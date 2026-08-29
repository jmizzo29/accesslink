/**
 * Shared community catalog — durable store for hotel / Airbnb / WAV contributions.
 * Backed by GitHub Contents API (invisible to travelers). Falls back to in-memory
 * for the warm serverless instance when a token is missing.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { getCommunitySeedListings } from './seed-listings.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const REPO = process.env.COMMUNITY_GITHUB_REPO || 'jmizzo29/accesslink';
const FILE_PATH = process.env.COMMUNITY_CATALOG_PATH || 'app/public/community-catalog.json';
const RAW_URL = `https://raw.githubusercontent.com/${REPO}/main/${FILE_PATH}`;

/** @type {{ version: number, updatedAt: string, listings: object[] } | null} */
let memoryCatalog = null;

function githubToken() {
  return (
    process.env.COMMUNITY_GITHUB_TOKEN ||
    process.env.GITHUB_TOKEN ||
    process.env.GH_TOKEN ||
    ''
  );
}

function emptyAccessibility() {
  return {
    wheelchairRamp: false,
    rollInShower: false,
    elevator: false,
    wideDoorways: false,
    accessibleParking: false,
    accessibleRestroom: false,
    accessibleEntrance: false,
    loweredBathroom: false,
    serviceAnimalsAllowed: false,
    ceilingHoist: false,
  };
}

function mergeById(primary = [], secondary = []) {
  const byId = new Map();
  for (const listing of [...secondary, ...primary]) {
    if (listing?.id) byId.set(listing.id, listing);
  }
  return [...byId.values()];
}

function seedCatalog() {
  try {
    const seeded = JSON.parse(
      readFileSync(join(__dirname, 'community-catalog.json'), 'utf8'),
    );
    const fromFile = Array.isArray(seeded.listings) ? seeded.listings : [];
    return {
      version: 1,
      updatedAt: seeded.updatedAt || new Date().toISOString(),
      listings: mergeById(fromFile, getCommunitySeedListings()),
    };
  } catch {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      listings: getCommunitySeedListings(),
    };
  }
}

function normalizeListing(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const name = String(raw.name || raw.title || '').trim();
  if (name.length < 3) return null;
  const location = String(raw.location || '').trim();
  if (location.length < 3) return null;
  const category = ['hotel', 'airbnb', 'airport', 'wav'].includes(raw.category)
    ? raw.category
    : 'hotel';
  const city = String(raw.city || location.split(',')[0] || '').trim();
  const state = String(raw.state || location.split(',')[1] || '').trim();
  const summary = String(raw.summary || raw.description || '').trim();
  if (summary.length < 10) return null;

  return {
    id: String(raw.id || `community-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`),
    name,
    location,
    city,
    state,
    address: raw.address ? String(raw.address).trim() : undefined,
    category,
    summary: summary.slice(0, 400),
    description: raw.description ? String(raw.description).slice(0, 1200) : summary,
    price: Number(raw.price || 0),
    priceLabel:
      category === 'wav' ? 'WAV / transfer' : category === 'airport' ? 'public facility' : 'per night',
    rating: 0,
    reviewCount: 0,
    verified: false,
    provenance: 'community',
    accessibility: { ...emptyAccessibility(), ...(raw.accessibility || {}) },
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    contributedAt: raw.contributedAt || new Date().toISOString(),
    contributorName: raw.contributorName ? String(raw.contributorName).slice(0, 80) : undefined,
  };
}

async function fetchGithubFile() {
  const token = githubToken();
  if (!token) return null;
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'access4all-community',
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const decoded = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8');
  const parsed = JSON.parse(decoded);
  return {
    sha: data.sha,
    catalog: {
      version: 1,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      listings: Array.isArray(parsed.listings) ? parsed.listings : [],
    },
  };
}

async function fetchRawCatalog() {
  try {
    const res = await fetch(`${RAW_URL}?t=${Date.now()}`, {
      headers: { 'User-Agent': 'access4all-community' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const parsed = await res.json();
    return {
      version: 1,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      listings: Array.isArray(parsed.listings) ? parsed.listings : [],
    };
  } catch {
    return null;
  }
}

export async function listCommunityListings() {
  const seed = seedCatalog();
  let remote = null;
  const fromGh = await fetchGithubFile();
  if (fromGh?.catalog) remote = fromGh.catalog;
  else {
    const raw = await fetchRawCatalog();
    if (raw) remote = raw;
  }
  const listings = mergeById(memoryCatalog?.listings || [], mergeById(remote?.listings || [], seed.listings));
  memoryCatalog = {
    version: 1,
    updatedAt: remote?.updatedAt || seed.updatedAt,
    listings,
  };
  return {
    listings,
    source: remote ? 'shared+seed' : memoryCatalog ? 'memory+seed' : 'seed',
    total: listings.length,
  };
}

async function persistCatalog(catalog, sha) {
  const token = githubToken();
  if (!token) {
    memoryCatalog = catalog;
    return { ok: true, source: 'memory', shared: false };
  }

  const body = {
    message: `community: add ${catalog.listings[0]?.name || 'listing'}`,
    content: Buffer.from(JSON.stringify(catalog, null, 2) + '\n', 'utf8').toString('base64'),
    sha,
  };

  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'access4all-community',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    memoryCatalog = catalog;
    return { ok: false, source: 'memory', shared: false, error: errText.slice(0, 300) };
  }

  memoryCatalog = catalog;
  return { ok: true, source: 'shared', shared: true };
}

export async function addCommunityListing(input) {
  const listing = normalizeListing({
    ...input,
    id: `community-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`,
    contributedAt: new Date().toISOString(),
  });
  if (!listing) {
    throw new Error('Name, location, and a short accessibility description are required.');
  }

  const existing = await fetchGithubFile();
  const base = existing?.catalog || memoryCatalog || (await fetchRawCatalog()) || seedCatalog();
  const listings = [listing, ...base.listings.filter((l) => l.id !== listing.id)].slice(0, 500);
  const catalog = {
    version: 1,
    updatedAt: new Date().toISOString(),
    listings,
  };

  const persist = await persistCatalog(catalog, existing?.sha);
  return { listing, ...persist };
}

export function isCommunityStoreConfigured() {
  return Boolean(githubToken());
}
