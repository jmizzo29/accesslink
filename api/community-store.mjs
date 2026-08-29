/**
 * Shared listing catalog — in-repo community seed + durable store writes.
 * Travelers never log in. A missing store fails Contribute loudly.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { getCommunitySeedListings } from './seed-listings.mjs';
import { COMMUNITY_ATTRIBUTION } from './verification.mjs';
import {
  describeStore,
  isSharedStoreConfigured,
  readSharedCatalog,
  writeSharedCatalog,
} from './shared-store.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
      readFileSync(join(__dirname, 'data/community-catalog.json'), 'utf8'),
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
    : raw.category === 'van' || raw.category === 'vans'
      ? 'wav'
      : 'hotel';
  const city = String(raw.city || location.split(',')[0] || '').trim();
  const state = String(raw.state || location.split(',')[1] || '').trim();
  const summary = String(raw.summary || raw.description || '').trim();
  if (summary.length < 10) return null;

  const asVerified = Boolean(
    raw.verified || raw.asVerified || raw.verifiedListing || raw.provenance === 'verified',
  );
  const contributorName = raw.contributorName
    ? String(raw.contributorName).slice(0, 80)
    : COMMUNITY_ATTRIBUTION[String(raw.id || '')]?.contributorName;
  const verifiedBy = asVerified
    ? String(raw.verifiedBy || contributorName || 'Access4All').slice(0, 80)
    : undefined;

  return {
    id: String(
      raw.id ||
        `${asVerified ? 'shared' : 'community'}-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`,
    ),
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
    rating: Number(raw.rating || 0),
    reviewCount: Number(raw.reviewCount || 0),
    verified: asVerified,
    provenance: asVerified ? 'verified' : 'community',
    verifiedBy,
    verifiedAt: asVerified ? raw.verifiedAt || new Date().toISOString().slice(0, 10) : undefined,
    accessibility: { ...emptyAccessibility(), ...(raw.accessibility || {}) },
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    contributedAt:
      raw.contributedAt ||
      COMMUNITY_ATTRIBUTION[String(raw.id || '')]?.contributedAt ||
      new Date().toISOString(),
    contributorName,
  };
}

export function isCommunityStoreConfigured() {
  return isSharedStoreConfigured();
}

export function storeStatus() {
  return describeStore();
}

export async function listCommunityListings() {
  const seed = seedCatalog();
  let stored = [];
  let source = 'seed';
  try {
    const remote = await readSharedCatalog();
    if (remote?.listings) {
      stored = remote.listings.map(normalizeListing).filter(Boolean);
      source = `${describeStore().backend}+seed`;
    }
  } catch (error) {
    console.warn('[Access4All] Shared catalog read failed:', error?.message || error);
  }

  const listings = mergeById(stored, seed.listings);
  return {
    listings,
    source,
    total: listings.length,
    storeConfigured: isSharedStoreConfigured(),
    store: describeStore(),
  };
}

export async function addCommunityListing(input) {
  if (!isSharedStoreConfigured()) {
    throw new Error(
      'Shared catalog is not connected. Contribute cannot publish until DATABASE_URL, BLOB_READ_WRITE_TOKEN, or KV/Upstash is set on the Vercel project.',
    );
  }

  const listing = normalizeListing({
    ...input,
    id:
      input.id ||
      `${input.verified || input.asVerified || input.verifiedListing ? 'shared' : 'community'}-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`,
    contributedAt: new Date().toISOString(),
  });
  if (!listing) {
    throw new Error('Name, location, and a short accessibility description are required.');
  }

  let existing = [];
  try {
    const remote = await readSharedCatalog();
    existing = remote?.listings || [];
  } catch {
    existing = [];
  }

  const listings = [listing, ...existing.filter((row) => row.id !== listing.id)].slice(0, 500);
  const catalog = {
    version: 1,
    updatedAt: new Date().toISOString(),
    listings,
  };

  const wrote = await writeSharedCatalog(catalog);
  if (!wrote) {
    throw new Error('Shared catalog write failed. The listing was not published.');
  }

  return {
    listing,
    ok: true,
    shared: true,
    source: describeStore().backend,
  };
}
