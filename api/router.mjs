/**
 * Unified API Router for AccessLink
 * Handles all backend endpoints: /api/costs, /api/search, /api/verify
 * 
 * This is a single serverless Node.js function that routes requests
 * to appropriate handlers. Deployed on Vercel as a single endpoint.
 * 
 * Endpoints:
 * - GET /api/costs - Cost tracking data (supports ?format=json|csv|report)
 * - POST /api/search - Search accessible properties
 * - POST /api/verify - Verify property accessibility
 * - GET /api/monad/status - Monad chain + contract status
 * - GET /api/monad/history - Verification ledger history
 * - POST /api/monad/verify - Log / anchor verification on Monad
 * - POST /api/demo/verify - Judge demo one-click verify
 * - POST /api/match - Rank listings by natural-language needs
 */

import { handleAdminVerify, handleCosts } from './costs-handler.mjs';
import { enrichListingsServer } from './wheelmap-server.mjs';
import { rankListingsByNeeds } from './match-needs.mjs';
import {
  getMonadStatus,
  listVerificationRecords,
  readOnChainRecordCount,
  verifyPropertyOnMonad,
} from './monad-server.mjs';

// ============================================================================
// MOCK DATA - Replace with real Supabase/Monad integration when live
// ============================================================================

const LOCATION_COORDS = {
  'New York, NY': { lat: 40.7128, lng: -74.006 },
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'San Francisco, CA': { lat: 37.7749, lng: -122.4194 },
  'Miami, FL': { lat: 25.7617, lng: -80.1918 },
  'Orlando, FL': { lat: 28.5383, lng: -81.3792 },
};

function normalizeListing(listing) {
  if (listing.coordinates?.lat != null && listing.coordinates?.lng != null) {
    return listing;
  }
  const coords = LOCATION_COORDS[listing.location];
  return coords ? { ...listing, coordinates: coords } : listing;
}

const MOCK_COST_DATA = {
  summary: {
    totalCostUsd: 24.57,
    totalCalls: 42,
    totalInputTokens: 18500,
    totalOutputTokens: 8200,
    totalTokens: 26700,
    averageRuntimeMs: 450,
    totalRuntimeMs: 18900,
    minRuntimeMs: 120,
    maxRuntimeMs: 1200,
    byProvider: {
      anthropic: {
        callCount: 25,
        inputTokens: 12000,
        outputTokens: 5000,
        totalCostUsd: 15.30,
        avgRuntimeMs: 480,
        avgCostPerCall: 0.612,
      },
      openai: {
        callCount: 12,
        inputTokens: 4500,
        outputTokens: 2200,
        totalCostUsd: 8.20,
        avgRuntimeMs: 420,
        avgCostPerCall: 0.683,
      },
      other: {
        callCount: 5,
        inputTokens: 2000,
        outputTokens: 1000,
        totalCostUsd: 1.07,
        avgRuntimeMs: 350,
        avgCostPerCall: 0.214,
      },
    },
    byModel: {
      'claude-3-sonnet': { callCount: 15, costUsd: 9.20 },
      'gpt-4-turbo': { callCount: 10, costUsd: 7.50 },
    },
  },
  events: [
    {
      id: 'evt-001',
      sessionId: 'session-123',
      agentRole: 'researcher',
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      inputTokens: 1200,
      outputTokens: 450,
      estimatedCostUsd: 0.89,
      runtimeMs: 580,
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      date: new Date().toISOString().split('T')[0],
    },
    {
      id: 'evt-002',
      sessionId: 'session-124',
      agentRole: 'analyst',
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      inputTokens: 800,
      outputTokens: 300,
      estimatedCostUsd: 0.62,
      runtimeMs: 420,
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      date: new Date().toISOString().split('T')[0],
    },
    {
      id: 'evt-003',
      sessionId: 'session-125',
      agentRole: 'verifier',
      provider: 'anthropic',
      model: 'claude-3-opus-20240229',
      inputTokens: 2100,
      outputTokens: 890,
      estimatedCostUsd: 1.75,
      runtimeMs: 920,
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      date: new Date().toISOString().split('T')[0],
    },
  ],
  dailyRollups: [
    {
      date: new Date().toISOString().split('T')[0],
      totalCostUsd: 24.57,
      totalCalls: 42,
      byProvider: {
        anthropic: { calls: 25, costUsd: 15.30 },
        openai: { calls: 12, costUsd: 8.20 },
        other: { calls: 5, costUsd: 1.07 },
      },
    },
  ],
};

const MOCK_PROPERTIES = [
  {
    id: 'prop-001',
    name: 'Harborview Accessible Hotel',
    location: 'New York, NY',
    category: 'hotel',
    rating: 4.8,
    reviews: 142,
    price: 189,
    verified: true,
    summary:
      'Downtown hotel with verified roll-in shower rooms, 36-inch doorways, and staffed accessibility desk at check-in.',
    accessibility: {
      wheelchairRamp: true,
      rollInShower: true,
      elevator: true,
      wideDoorways: true,
      accessibleParking: true,
      accessibleRestroom: true,
      serviceAnimalsAllowed: true,
      accessibleEntrance: true,
      loweredBathroom: true,
    },
  },
  {
    id: 'prop-002',
    name: 'Lincoln Park Inclusive Stay',
    location: 'Chicago, IL',
    category: 'airbnb',
    rating: 4.5,
    reviews: 87,
    price: 129,
    verified: true,
    summary:
      'Ground-floor stay with ramp entry and wide hallway. Roll-in shower reported by 12 community reviewers.',
    accessibility: {
      wheelchairRamp: true,
      rollInShower: true,
      elevator: false,
      wideDoorways: true,
      accessibleParking: true,
      accessibleRestroom: true,
      serviceAnimalsAllowed: true,
      accessibleEntrance: true,
      loweredBathroom: true,
    },
  },
  {
    id: 'prop-003',
    name: 'SFO Accessibility Services Hub',
    location: 'San Francisco, CA',
    category: 'airport',
    rating: 4.2,
    reviews: 54,
    price: 0,
    verified: true,
    summary:
      'Terminal accessibility desk, elevator maps, and wheelchair assistance between gates.',
    accessibility: {
      wheelchairRamp: true,
      rollInShower: false,
      elevator: true,
      wideDoorways: true,
      accessibleParking: true,
      accessibleRestroom: true,
      serviceAnimalsAllowed: true,
      accessibleEntrance: true,
      loweredBathroom: true,
    },
  },
  {
    id: 'prop-004',
    name: 'Ocean Breeze Accessible Resort',
    location: 'Miami, FL',
    category: 'hotel',
    rating: 4.7,
    reviews: 210,
    price: 249,
    verified: true,
    summary:
      'Beachfront property with pool lift, accessible paths, and multiple roll-in shower suites.',
    accessibility: {
      wheelchairRamp: true,
      rollInShower: true,
      elevator: true,
      wideDoorways: true,
      accessibleParking: true,
      accessibleRestroom: true,
      serviceAnimalsAllowed: true,
      accessibleEntrance: true,
      loweredBathroom: true,
    },
  },
  {
    id: 'prop-005',
    name: 'Sunshine Family Suites Orlando',
    location: 'Orlando, FL',
    category: 'hotel',
    rating: 4.6,
    reviews: 98,
    price: 165,
    verified: true,
    summary:
      'Theme-park area hotel popular with families — roll-in showers, pool ramp, and wide suite doorways.',
    accessibility: {
      wheelchairRamp: true,
      rollInShower: true,
      elevator: true,
      wideDoorways: true,
      accessibleParking: true,
      accessibleRestroom: true,
      serviceAnimalsAllowed: true,
      accessibleEntrance: true,
      loweredBathroom: true,
    },
  },
  {
    id: 'prop-006',
    name: 'Brooklyn Heights Accessible Loft',
    location: 'New York, NY',
    category: 'airbnb',
    rating: 4.4,
    reviews: 63,
    price: 175,
    verified: true,
    summary:
      'Elevator building with 34-inch doorway and tub transfer bench on request — no roll-in shower.',
    accessibility: {
      wheelchairRamp: true,
      rollInShower: false,
      elevator: true,
      wideDoorways: true,
      accessibleParking: false,
      accessibleRestroom: true,
      serviceAnimalsAllowed: true,
      accessibleEntrance: true,
      loweredBathroom: false,
    },
  },
  {
    id: 'prop-007',
    name: 'MCO Terminal B Mobility Center',
    location: 'Orlando, FL',
    category: 'airport',
    rating: 4.3,
    reviews: 41,
    price: 0,
    verified: true,
    summary:
      'Orlando International — wheelchair service, accessible restrooms, and elevator access to all concourses.',
    accessibility: {
      wheelchairRamp: true,
      rollInShower: false,
      elevator: true,
      wideDoorways: true,
      accessibleParking: true,
      accessibleRestroom: true,
      serviceAnimalsAllowed: true,
      accessibleEntrance: true,
      loweredBathroom: true,
    },
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse URL query parameters from request URL
 */
function parseQueryParams(url) {
  const urlObj = new URL(url, 'http://localhost');
  const params = {};
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Generate CSV from cost events
 */
function generateCostCSV() {
  const header = ['SessionID', 'Provider', 'Model', 'InputTokens', 'OutputTokens', 'CostUSD', 'Timestamp'];
  const rows = MOCK_COST_DATA.events.map((e) => [
    e.sessionId,
    e.provider,
    e.model,
    e.inputTokens,
    e.outputTokens,
    e.estimatedCostUsd.toFixed(4),
    e.timestamp,
  ]);
  return [header, ...rows].map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
}

/**
 * Generate text report from cost data
 */
function generateCostReport() {
  const lines = [
    'AccessLink LLM Cost Report',
    `Generated: ${new Date().toISOString()}`,
    '',
    'SUMMARY',
    '='.repeat(70),
    `Total Cost:           $${MOCK_COST_DATA.summary.totalCostUsd.toFixed(2)} USD`,
    `Total Calls:          ${MOCK_COST_DATA.summary.totalCalls}`,
    `Total Input Tokens:   ${MOCK_COST_DATA.summary.totalInputTokens.toLocaleString()}`,
    `Total Output Tokens:  ${MOCK_COST_DATA.summary.totalOutputTokens.toLocaleString()}`,
    `Total Tokens:         ${MOCK_COST_DATA.summary.totalTokens.toLocaleString()}`,
    `Avg Runtime:          ${MOCK_COST_DATA.summary.averageRuntimeMs}ms`,
    `Total Runtime:        ${(MOCK_COST_DATA.summary.totalRuntimeMs / 1000).toFixed(2)}s`,
    '',
    'BY PROVIDER',
    '='.repeat(70),
  ];

  Object.entries(MOCK_COST_DATA.summary.byProvider).forEach(([provider, stats]) => {
    lines.push(`\n${provider.toUpperCase()}`);
    lines.push('-'.repeat(70));
    lines.push(`  Calls:        ${stats.callCount}`);
    lines.push(`  Cost:         $${stats.totalCostUsd.toFixed(2)}`);
    lines.push(`  Avg Cost/Call: $${stats.avgCostPerCall.toFixed(4)}`);
    lines.push(`  Avg Runtime:  ${stats.avgRuntimeMs}ms`);
  });

  lines.push('\n' + '='.repeat(70));
  return lines.join('\n');
}

/**
 * Set CORS headers for responses
 */
function setCORSHeaders(res) {
  res.headers = {
    ...res.headers,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * POST /api/search - Search accessible properties
 * Body: { location?, category?, accessibility? }
 */
async function handleSearch(req) {
  try {
    let body = {};
    if (req.body) {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }

    const { location, category, accessibility } = body;

    let results = MOCK_PROPERTIES.map(normalizeListing);

    if (category) {
      results = results.filter((p) => p.category === category);
    }

    if (location) {
      const locLower = location.toLowerCase();
      results = results.filter((p) => p.location.toLowerCase().includes(locLower));
    }

    if (accessibility && typeof accessibility === 'object') {
      results = results.filter((prop) =>
        Object.entries(accessibility).every(([feature, required]) => {
          if (required) return prop.accessibility[feature] === true;
          return true;
        }),
      );
    }

    const enriched = await enrichListingsServer(results, { location, category, accessibility });

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        results: enriched.results,
        total: enriched.results.length,
        query: { location, category, accessibility },
        accessibilityCloudEnriched: enriched.cloudEnriched,
        cloudPlacesAdded: enriched.cloudPlacesAdded,
        enrichmentSource: enriched.enrichmentSource,
      }),
    };
  } catch (error) {
    console.error('[AccessLink] Search handler error:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Search failed',
        message: error.message,
      }),
    };
  }
}

/**
 * POST /api/verify - Verify property accessibility
 * Body: { propertyId }
 */
async function handleVerify(req) {
  try {
    let body = {};
    if (req.body) {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }

    const { propertyId } = body;

    if (!propertyId) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing propertyId' }),
      };
    }

    // Find property
    const property = MOCK_PROPERTIES.find((p) => p.id === propertyId);

    if (!property) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Property not found' }),
      };
    }

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyId,
        verified: property.verified,
        accessibility: property.accessibility,
        verifiedAt: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('[AccessLink] Verify handler error:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Verification failed',
        message: error.message,
      }),
    };
  }
}

/**
 * GET /api/monad/status — chain + contract posture
 */
async function handleMonadStatus() {
  const status = getMonadStatus();
  const onChainRecordCount = await readOnChainRecordCount();
  const ledgerRecordCount = listVerificationRecords().length;
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...status, onChainRecordCount, ledgerRecordCount }),
  };
}

/**
 * GET /api/monad/history — verification ledger
 */
async function handleMonadHistory(req) {
  const url = new URL(req.url || '/', 'http://localhost');
  const propertyId = url.searchParams.get('propertyId');
  const records = listVerificationRecords({ propertyId: propertyId || undefined });
  const status = getMonadStatus();
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      records,
      total: records.length,
      propertyId: propertyId || null,
      status,
    }),
  };
}

/**
 * POST /api/monad/verify — anchor accessibility verification
 */
async function handleMonadVerify(req) {
  try {
    let body = {};
    if (req.body) {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
    const record = await verifyPropertyOnMonad(body);
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record, status: getMonadStatus() }),
    };
  } catch (error) {
    return {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Monad verify failed',
        message: error instanceof Error ? error.message : 'unknown error',
      }),
    };
  }
}

/**
 * POST /api/demo/verify — judge demo one-click verification
 */
async function handleDemoVerify() {
  const property = MOCK_PROPERTIES[0];
  const features = Object.entries(property.accessibility)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);
  const record = await verifyPropertyOnMonad({
    propertyId: property.id,
    propertyName: property.name,
    location: property.location,
    features,
    verifiedBy: 'Access4All demo',
  });
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ record, status: getMonadStatus() }),
  };
}

/**
 * POST /api/match — Rank listings by natural-language accessibility needs
 */
async function handleMatch(req) {
  try {
    let body = {};
    if (req.body) {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }

    const { needs, listings } = body;
    if (!needs || typeof needs !== 'string') {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'needs text is required' }),
      };
    }

    const sourceListings = Array.isArray(listings)
      ? listings.map(normalizeListing)
      : MOCK_PROPERTIES.map(normalizeListing);
    const { listings: ranked, parsed } = rankListingsByNeeds(sourceListings, needs);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        results: ranked,
        parsed,
        total: ranked.length,
      }),
    };
  } catch (error) {
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Match failed',
        message: error instanceof Error ? error.message : 'unknown error',
      }),
    };
  }
}

/**
 * Handle OPTIONS requests (CORS preflight)
 */
async function handleOptions(req) {
  return {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: '',
  };
}

/**
 * Handle 404 - Not found
 */
async function handleNotFound(req) {
  return {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: 'Not found',
      path: req.url,
      available: [
        '/api/search',
        '/api/match',
        '/api/demo/verify',
        '/api/costs',
        '/api/costs/verify-admin',
        '/api/verify',
        '/api/monad/status',
        '/api/monad/history',
        '/api/monad/verify',
      ],
    }),
  };
}

// ============================================================================
// MAIN ROUTER
// ============================================================================

/**
 * Main serverless function entry point
 * This function is called by Vercel for every request to /api/*
 */
function resolvePathname(req) {
  const url = new URL(req.url || '/', 'http://localhost');
  const routed = url.searchParams.get('__path');
  if (routed) {
    return `/api/${routed.replace(/^\/+/, '')}`;
  }
  const pathname = url.pathname;
  if (pathname.startsWith('/api/accesslink/') && pathname !== '/api/accesslink/router') {
    return `/api/${pathname.slice('/api/accesslink/'.length)}`;
  }
  return pathname;
}

export default async function handler(req, res) {
  try {
    const pathname = resolvePathname(req);

    let response;

    // Route to appropriate handler
    if (pathname === '/api/costs' || pathname === '/api/costs/verify-admin') {
      if (req.method === 'OPTIONS') {
        response = await handleOptions(req);
      } else if (pathname === '/api/costs/verify-admin' && req.method === 'POST') {
        response = await handleAdminVerify(req);
      } else if (pathname === '/api/costs' && req.method === 'GET') {
        response = await handleCosts(req);
      } else {
        response = {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
      }
    } else if (pathname === '/api/search') {
      if (req.method === 'OPTIONS') {
        response = await handleOptions(req);
      } else {
        response = await handleSearch(req);
      }
    } else if (pathname === '/api/match') {
      if (req.method === 'OPTIONS') {
        response = await handleOptions(req);
      } else if (req.method === 'POST') {
        response = await handleMatch(req);
      } else {
        response = {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
      }
    } else if (pathname === '/api/demo/verify') {
      if (req.method === 'OPTIONS') {
        response = await handleOptions(req);
      } else if (req.method === 'POST') {
        response = await handleDemoVerify();
      } else {
        response = {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
      }
    } else if (pathname === '/api/monad/status') {
      if (req.method === 'GET') {
        response = await handleMonadStatus();
      } else {
        response = {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
      }
    } else if (pathname === '/api/monad/history') {
      if (req.method === 'GET') {
        response = await handleMonadHistory(req);
      } else {
        response = {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
      }
    } else if (pathname === '/api/monad/verify') {
      if (req.method === 'OPTIONS') {
        response = await handleOptions(req);
      } else if (req.method === 'POST') {
        response = await handleMonadVerify(req);
      } else {
        response = {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
      }
    } else if (pathname === '/api/verify') {
      if (req.method === 'OPTIONS') {
        response = await handleOptions(req);
      } else {
        response = await handleVerify(req);
      }
    } else {
      response = await handleNotFound(req);
    }

    // Set response status
    res.status(response.status);

    // Set response headers
    Object.entries(response.headers || {}).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Send response body
    res.end(response.body || '');
  } catch (error) {
    console.error('[AccessLink] Router error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
