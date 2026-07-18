import type { AccessibilityFilterKey, AccessibilityFeatures, Listing, ListingPhoto } from '../listings/types';
import type { PropertyRow } from './database.types';

/** Maps app filter keys → Postgres column names */
export const ACCESSIBILITY_COLUMN_MAP: Record<AccessibilityFilterKey, keyof PropertyRow> = {
  wheelchairRamp: 'wheelchair_ramp',
  rollInShower: 'roll_in_shower',
  elevator: 'elevator',
  wideDoorways: 'wide_doorways',
  accessibleParking: 'accessible_parking',
  accessibleRestroom: 'accessible_restroom',
  accessibleEntrance: 'accessible_entrance',
  loweredBathroom: 'lowered_bathroom',
  serviceAnimalsAllowed: 'service_animals_allowed',
  ceilingHoist: 'ceiling_hoist',
};

export function rowToAccessibility(row: PropertyRow): AccessibilityFeatures {
  return {
    wheelchairRamp: row.wheelchair_ramp,
    rollInShower: row.roll_in_shower,
    elevator: row.elevator,
    wideDoorways: row.wide_doorways,
    accessibleParking: row.accessible_parking,
    accessibleRestroom: row.accessible_restroom,
    accessibleEntrance: row.accessible_entrance,
    loweredBathroom: row.lowered_bathroom,
    serviceAnimalsAllowed: row.service_animals_allowed,
    ceilingHoist: row.ceiling_hoist,
  };
}

function parsePhotos(raw: PropertyRow['photos']): ListingPhoto[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p) => p && typeof p.url === 'string')
    .map((p) => ({ url: p.url, alt: p.alt ?? 'Property photo' }));
}

export function rowToListing(row: PropertyRow): Listing {
  const city = row.city ?? row.location.split(',')[0]?.trim() ?? row.location;
  const state = row.state ?? row.location.split(',')[1]?.trim() ?? '';

  return {
    id: row.id,
    name: row.title,
    location: row.location,
    address: row.address ?? row.location,
    city,
    state,
    category: row.category,
    price: Number(row.price ?? 0),
    priceLabel: row.category === 'airport' ? 'public facility' : 'per night',
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    verified: row.verified,
    summary: row.summary ?? row.description?.slice(0, 160) ?? 'Accessibility details from the community.',
    description: row.description ?? row.summary ?? '',
    photos: parsePhotos(row.photos),
    coordinates: {
      lat: row.lat ?? 0,
      lng: row.lng ?? 0,
    },
    accessibility: rowToAccessibility(row),
  };
}

export function accessibilityToReportColumns(
  features: Partial<Record<AccessibilityFilterKey, boolean>>,
): Record<string, boolean | null> {
  const out: Record<string, boolean | null> = {};
  for (const [key, column] of Object.entries(ACCESSIBILITY_COLUMN_MAP)) {
    const value = features[key as AccessibilityFilterKey];
    if (value === true) {
      out[column] = true;
    }
  }
  return out;
}
