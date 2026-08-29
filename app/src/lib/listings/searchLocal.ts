import type { Listing, SearchQuery, SearchResponse } from './types';
import { MOCK_LISTINGS } from './mockData';
import { mergeCommunityIntoResults, readLocalCommunityCatalog } from './communityCatalog';
import { listingMatchesLocation } from './locationMatch';

/**
 * Client-side search — demo corpus + community contributions (local + shared catalog).
 * Works with zero env vars and no API.
 */
export function searchListingsLocal(
  query: SearchQuery,
  community: Listing[] = readLocalCommunityCatalog(),
): SearchResponse {
  let results = [...MOCK_LISTINGS];

  if (query.category) {
    results = results.filter((p) => p.category === query.category);
  }

  if (query.location.trim()) {
    results = results.filter((p) => listingMatchesLocation(p, query.location));
  }

  results = mergeCommunityIntoResults(results, community, query.location, query.category);

  const required = query.requiredFeatures;
  if (required && Object.keys(required).length > 0) {
    results = results.filter((listing) =>
      Object.entries(required).every(([feature, mustHave]) => {
        if (!mustHave) return true;
        const key = feature as keyof Listing['accessibility'];
        return listing.accessibility[key] === true;
      }),
    );
  }

  return {
    results,
    total: results.length,
    query,
  };
}
