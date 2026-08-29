import type { AccessibilityFeatures, Listing } from './types';
import seedFile from '../../data/seed-listings.json';
import { withListingPhoto } from './photos';
import { canonicalizeProvenance } from './provenance';
import { SEED_VERIFICATION } from './verification';

function emptyAccessibility(): AccessibilityFeatures {
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

export function normalizeSeedListing(raw: Partial<Listing> & { title?: string; reviews?: number }): Listing | null {
  const name = String(raw.name ?? raw.title ?? '').trim();
  if (!name) return null;
  const location = String(raw.location ?? '').trim();
  const city = String(raw.city ?? location.split(',')[0]?.trim() ?? location);
  const state = String(raw.state ?? location.split(',')[1]?.trim() ?? '');
  const category = raw.category ?? 'hotel';
  const id = String(raw.id ?? `seed-${name.toLowerCase().replace(/\s+/g, '-')}`);
  const verification = SEED_VERIFICATION[id] ?? {};

  return {
    id,
    name,
    location: location || city,
    address: raw.address ? String(raw.address) : undefined,
    city,
    state,
    category,
    price: Number(raw.price ?? 0),
    priceLabel:
      raw.priceLabel ||
      (category === 'wav' ? 'WAV / transfer' : category === 'airport' ? 'public facility' : 'per night'),
    rating: Number(raw.rating ?? 0),
    reviewCount: Number(raw.reviewCount ?? raw.reviews ?? 0),
    verified: Boolean(raw.verified),
    verifiedBy: raw.verifiedBy || verification.verifiedBy,
    verifiedAt: raw.verifiedAt || verification.verifiedAt,
    contributorName: raw.contributorName,
    contributedAt: raw.contributedAt,
    provenance: canonicalizeProvenance(raw.provenance, raw.verified),
    summary: String(raw.summary ?? raw.description ?? 'Community-verified accessibility details.').slice(0, 320),
    description: raw.description ? String(raw.description) : undefined,
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    coordinates: raw.coordinates,
    accessibility: { ...emptyAccessibility(), ...(raw.accessibility ?? {}) },
    wheelchairRating: raw.wheelchairRating,
    accessibilityCloudId: raw.accessibilityCloudId,
  };
}

const SEED_LISTINGS: Listing[] = (seedFile.listings ?? [])
  .map((row) => normalizeSeedListing(row as Partial<Listing>))
  .filter((row): row is Listing => Boolean(row))
  .map(withListingPhoto);

export function getSeedListings(): Listing[] {
  return SEED_LISTINGS.map((listing) => ({
    ...listing,
    accessibility: { ...listing.accessibility },
  }));
}

export function getSeedListingById(id: string): Listing | undefined {
  return SEED_LISTINGS.find((listing) => listing.id === id);
}

export function getSeedStats() {
  return {
    total: SEED_LISTINGS.length,
    cities: new Set(SEED_LISTINGS.map((l) => l.city)).size,
    categories: new Set(SEED_LISTINGS.map((l) => l.category)).size,
  };
}
