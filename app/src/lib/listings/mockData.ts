import type { Listing } from './types';
import { getSeedListingById, getSeedListings } from './seed';

/**
 * Curated demo stays for the judge path — always labeled in UI.
 * Live OpenStreetMap / Wheelmap places merge in via enrichment (provenance: open-data).
 * IDs align with `api/seed-listings.json` so /property/prop-001 never 404s.
 */
export const MOCK_LISTINGS: Listing[] = getSeedListings();

export function getListingById(id: string): Listing | undefined {
  return getSeedListingById(id);
}
