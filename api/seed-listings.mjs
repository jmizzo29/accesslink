/**
 * Shared demo corpus — used when Neon / GitHub / enrichment keys are absent.
 * Happy path works with zero environment variables.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
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

export function normalizeSeedListing(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const name = String(raw.name || raw.title || '').trim();
  if (!name) return null;
  const location = String(raw.location || '').trim();
  const city = String(raw.city || location.split(',')[0] || '').trim();
  const state = String(raw.state || location.split(',')[1] || '').trim();
  const category = ['hotel', 'airbnb', 'airport', 'wav'].includes(raw.category)
    ? raw.category
    : 'hotel';

  return {
    id: String(raw.id || `seed-${name.toLowerCase().replace(/\s+/g, '-')}`),
    name,
    location: location || city,
    address: raw.address ? String(raw.address) : undefined,
    city,
    state,
    category,
    price: Number(raw.price || 0),
    priceLabel:
      raw.priceLabel ||
      (category === 'wav' ? 'WAV / transfer' : category === 'airport' ? 'public facility' : 'per night'),
    rating: Number(raw.rating || 0),
    reviewCount: Number(raw.reviewCount || raw.reviews || 0),
    reviews: Number(raw.reviewCount || raw.reviews || 0),
    verified: Boolean(raw.verified),
    provenance: raw.provenance || (raw.verified ? 'curated-demo' : 'community'),
    verifiedOnChain: Boolean(raw.verifiedOnChain),
    summary: String(raw.summary || raw.description || 'Community-verified accessibility details.').slice(0, 320),
    description: raw.description ? String(raw.description) : undefined,
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    coordinates: raw.coordinates,
    accessibility: { ...emptyAccessibility(), ...(raw.accessibility || {}) },
  };
}

function loadCatalog(filename, fallbackListings = []) {
  const candidates = [
    join(__dirname, filename),
    join(__dirname, '../app/src/data', filename),
    join(__dirname, '../app/public', filename),
  ];
  for (const path of candidates) {
    const parsed = readJson(path);
    if (parsed?.listings && Array.isArray(parsed.listings)) {
      return parsed.listings.map(normalizeSeedListing).filter(Boolean);
    }
    if (Array.isArray(parsed)) {
      return parsed.map(normalizeSeedListing).filter(Boolean);
    }
  }
  return fallbackListings;
}

let curatedCache = null;
let communityCache = null;

export function getCuratedSeedListings() {
  if (!curatedCache) {
    curatedCache = loadCatalog('seed-listings.json');
  }
  return curatedCache.map((listing) => ({
    ...listing,
    accessibility: { ...listing.accessibility },
  }));
}

export function getCommunitySeedListings() {
  if (!communityCache) {
    communityCache = loadCatalog('community-catalog.json');
  }
  return communityCache.map((listing) => ({
    ...listing,
    accessibility: { ...listing.accessibility },
  }));
}

export function getAllSeedListings() {
  const byId = new Map();
  for (const listing of [...getCuratedSeedListings(), ...getCommunitySeedListings()]) {
    byId.set(listing.id, listing);
  }
  return [...byId.values()];
}

export function getSeedListingById(id) {
  return getAllSeedListings().find((listing) => listing.id === id) || null;
}

const ALIASES = {
  nyc: ['new york'],
  'new york city': ['new york'],
  sf: ['san francisco'],
  sfo: ['san francisco'],
  chi: ['chicago'],
  mia: ['miami'],
  'miami beach': ['miami'],
  mco: ['orlando'],
  pdx: ['portland'],
  atx: ['austin'],
  sea: ['seattle'],
};

function normalizePlace(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function listingMatchesLocation(listing, query) {
  const loc = normalizePlace(query);
  if (!loc) return true;
  const hay = normalizePlace(
    [listing.location, listing.city, listing.state, listing.name, listing.address]
      .filter(Boolean)
      .join(' '),
  );
  if (hay.includes(loc)) return true;
  const parts = loc.split(',').map((p) => p.trim()).filter((p) => p.length > 1);
  if (parts.some((part) => hay.includes(part))) return true;
  const tokens = loc.split(/[\s,]+/).filter((t) => t.length > 1);
  for (const token of tokens) {
    if (hay.includes(token)) return true;
    const extras = ALIASES[token] || [];
    if (extras.some((alias) => hay.includes(alias))) return true;
  }
  return false;
}

export function filterSeedListings({ location, category, accessibility } = {}, extra = []) {
  const byId = new Map();
  for (const listing of [...getAllSeedListings(), ...extra]) {
    byId.set(listing.id, listing);
  }
  let results = [...byId.values()];

  if (category) {
    results = results.filter((p) => p.category === category);
  }
  if (location) {
    results = results.filter((p) => listingMatchesLocation(p, location));
  }
  if (accessibility && typeof accessibility === 'object') {
    results = results.filter((prop) =>
      Object.entries(accessibility).every(([feature, required]) => {
        if (!required) return true;
        return prop.accessibility?.[feature] === true;
      }),
    );
  }
  return results;
}
