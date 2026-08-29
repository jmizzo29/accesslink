import type { Listing } from './types';
import { getSeedListingById, getSeedListings } from './seed';

/**
 * Seeded catalog so search and stay pages work with no environment variables.
 * OpenStreetMap / Wheelmap places merge in via enrichment (provenance: open-data).
 * IDs align with `api/data/seed-listings.json` so /property/prop-001 never 404s.
 */
export const MOCK_LISTINGS: Listing[] = getSeedListings();

export function getListingById(id: string): Listing | undefined {
  return getSeedListingById(id);
}
