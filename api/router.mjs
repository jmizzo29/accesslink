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
 * - POST /api/verify - Read a listing's community verification
 * - POST /api/match - Rank listings by natural-language needs
 */

import { handleAdminVerify, handleCosts } from './costs-handler.mjs';
import { enrichListingsServer } from './wheelmap-server.mjs';
import { rankListingsByNeeds } from './match-needs.mjs';
import {
  addCommunityListing,
  isCommunityStoreConfigured,
  listCommunityListings,
  storeStatus,
} from './community-store.mjs';
import {
  filterSeedListings,
  getAllSeedListings,
  getSeedListingById,
  normalizeCategory,
} from './seed-listings.mjs';
import { withTimeout } from './timeout.mjs';

// ============================================================================
// MOCK DATA - Replace with live database integration when configured
// ============================================================================

const LOCATION_COORDS = {
  'New York, NY': { lat: 40.7128, lng: -74.006 },
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'San Francisco, CA': { lat: 37.7749, lng: -122.4194 },
  'Miami, FL': { lat: 25.7617, lng: -80.1918 },
  'Orlando, FL': { lat: 28.5383, lng: -81.3792 },
  'Portland, OR': { lat: 45.5152, lng: -122.6784 },
  'Austin, TX': { lat: 30.2672, lng: -97.7431 },
  'Seattle, WA': { lat: 47.6062, lng: -122.3321 },
};

function canonicalizeProvenance(raw, verified = false) {
  if (raw === 'verified' || raw === 'community' || raw === 'open-data') return raw;
  if (raw === 'curated-demo' || raw === 'demo') return 'verified';
  return verified ? 'verified' : 'community';
}

function normalizeListing(listing) {
  const withProvenance = {
    ...listing,
    provenance: canonicalizeProvenance(listing.provenance, listing.verified),
  };
  if (withProvenance.coordinates?.lat != null && withProvenance.coordinates?.lng != null) {
    return withProvenance;
  }
  const coords = LOCATION_COORDS[withProvenance.location];
  return coords ? { ...withProvenance, coordinates: coords } : withProvenance;
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

/** In-repo verified catalog — always available with zero env vars. */
function verifiedCatalog() {
  return getAllSeedListings();
}

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

    const location = body.location;
    const category = normalizeCategory(body.category || body.type);
    const accessibility = body.accessibility;

    const seedResults = filterSeedListings({ location, category, accessibility }).map(normalizeListing);

    let community = [];
    try {
      const catalog = await withTimeout(listCommunityListings(), 4000, { listings: [] });
      community = catalog.listings || [];
    } catch {
      community = [];
    }

    let results = filterSeedListings({ location, category, accessibility }, community).map(
      normalizeListing,
    );
    if (!results.length && seedResults.length) {
      results = seedResults;
    }

    let enriched = { results, cloudEnriched: false, cloudPlacesAdded: 0, enrichmentSource: 'none' };
    try {
      const next = await withTimeout(
        enrichListingsServer(results, { location, category, accessibility }),
        2500,
        enriched,
      );
      if (next?.results?.length) {
        enriched = next;
      } else {
        enriched = { ...enriched, results };
      }
    } catch (error) {
      console.warn('[AccessLink] Enrichment skipped:', error?.message || error);
    }

    const finalResults = enriched.results?.length ? enriched.results : results;
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        results: finalResults,
        total: finalResults.length,
        query: { location, category, accessibility },
        accessibilityCloudEnriched: enriched.cloudEnriched,
        cloudPlacesAdded: enriched.cloudPlacesAdded,
        enrichmentSource: enriched.enrichmentSource,
      }),
    };
  } catch (error) {
    console.error('[AccessLink] Search handler error:', error);
    try {
      const fallback = filterSeedListings({}).map(normalizeListing);
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          results: fallback,
          total: fallback.length,
          query: {},
          enrichmentSource: 'none',
        }),
      };
    } catch {
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
    const property = getSeedListingById(propertyId) || verifiedCatalog().find((p) => p.id === propertyId);

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
      : verifiedCatalog().map(normalizeListing);
    const { listings: ranked, parsed } = rankListingsByNeeds(sourceListings, needs);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        results: ranked,
        parsed,
        ranked: Boolean(parsed?.parsed || ranked.some((item) => item.matchScore != null)),
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
        '/api/costs',
        '/api/costs/verify-admin',
        '/api/verify',
        '/api/community/listings',
        '/api/community/contribute',
        '/api/community/status',
        '/api/listings/:id',
        '/api/wheelmap/enrich',
      ],
    }),
  };
}

async function handleListingById(req) {
  const url = new URL(req.url || '/', 'http://localhost');
  const routed = url.searchParams.get('__path') || url.pathname;
  const match = String(routed).match(/listings\/([^/?]+)/);
  const id = decodeURIComponent(match?.[1] || url.searchParams.get('id') || '');
  if (!id) {
    return {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing listing id' }),
    };
  }

  let listing = getSeedListingById(id);
  if (!listing) {
    try {
      const catalog = await listCommunityListings();
      listing = (catalog.listings || []).find((row) => row.id === id) || null;
    } catch {
      listing = null;
    }
  }

  if (!listing) {
    return {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Property not found', id }),
    };
  }

  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listing: normalizeListing(listing), source: 'seed' }),
  };
}

async function handleWheelmapEnrich(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const listings = Array.isArray(body?.listings) ? body.listings.map(normalizeListing) : verifiedCatalog();
  try {
    const enriched = await enrichListingsServer(listings, {
      location: body?.location,
      category: body?.category,
      accessibility: body?.accessibility,
    });
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enriched),
    };
  } catch (error) {
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        results: listings,
        cloudEnriched: false,
        cloudPlacesAdded: 0,
        enrichmentSource: 'none',
        message: error instanceof Error ? error.message : 'Enrichment unavailable',
      }),
    };
  }
}

async function handleCommunityListings() {
  const data = await listCommunityListings();
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      storeConfigured: isCommunityStoreConfigured(),
    }),
  };
}

async function handleCommunityContribute(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  if (!body || typeof body !== 'object') body = {};

  if (!isCommunityStoreConfigured()) {
    return {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error:
          'Shared catalog is not connected. Contribute cannot publish until DATABASE_URL, BLOB_READ_WRITE_TOKEN, or KV/Upstash is set on the Vercel project.',
        shared: false,
        store: storeStatus(),
      }),
    };
  }

  try {
    const result = await addCommunityListing(body);
    if (!result.shared) {
      return {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Shared catalog write did not confirm. The listing was not published.',
          shared: false,
          store: storeStatus(),
        }),
      };
    }
    return {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listing: result.listing,
        shared: true,
        source: result.source,
        store: storeStatus(),
        message: 'Saved. Anyone opening Access4All will see this listing.',
      }),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not publish contribution';
    const missing = /not connected/i.test(message);
    return {
      status: missing ? 503 : 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: message,
        shared: false,
        store: storeStatus(),
      }),
    };
  }
}

async function handleCommunityStatus() {
  const listed = await listCommunityListings();
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      store: storeStatus(),
      storeConfigured: isCommunityStoreConfigured(),
      source: listed.source,
      total: listed.total,
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
      } else if (req.method === 'GET') {
        const url = new URL(req.url || '/', 'http://localhost');
        req.body = {
          location: url.searchParams.get('location') || undefined,
          category:
            url.searchParams.get('category') || url.searchParams.get('type') || undefined,
        };
        response = await handleSearch(req);
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
    } else if (pathname === '/api/verify') {
      if (req.method === 'OPTIONS') {
        response = await handleOptions(req);
      } else {
        response = await handleVerify(req);
      }
    } else if (pathname.startsWith('/api/listings/')) {
      if (req.method === 'OPTIONS') {
        response = await handleOptions(req);
      } else if (req.method === 'GET') {
        response = await handleListingById(req);
      } else {
        response = {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
      }
    } else if (pathname === '/api/wheelmap/enrich') {
      if (req.method === 'OPTIONS') {
        response = await handleOptions(req);
      } else {
        response = await handleWheelmapEnrich(req);
      }
    } else if (pathname === '/api/community/listings') {
      if (req.method === 'OPTIONS') {
        response = await handleOptions(req);
      } else if (req.method === 'GET') {
        response = await handleCommunityListings();
      } else {
        response = {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
      }
    } else if (pathname === '/api/community/status') {
      if (req.method === 'OPTIONS') {
        response = await handleOptions(req);
      } else if (req.method === 'GET') {
        response = await handleCommunityStatus();
      } else {
        response = {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
      }
    } else if (pathname === '/api/community/contribute') {
      if (req.method === 'OPTIONS') {
        response = await handleOptions(req);
      } else if (req.method === 'POST') {
        response = await handleCommunityContribute(req);
      } else {
        response = {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
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
