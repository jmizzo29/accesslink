import type { Listing, SearchQuery, SearchResponse } from './types';
import { MOCK_LISTINGS } from './mockData';
import { mergeCommunityIntoResults, readLocalCommunityCatalog } from './communityCatalog';

/**
 * Client-side search — demo corpus + community contributions (local + shared catalog).
 */
export function searchListingsLocal(
  query: SearchQuery,
  community: Listing[] = readLocalCommunityCatalog(),
): SearchResponse {
  const loc = query.location.trim().toLowerCase();
  let results = [...MOCK_LISTINGS];

  if (query.category) {
    results = results.filter((p) => p.category === query.category);
  }

  if (loc) {
    results = results.filter((p) => {
      const haystack = `${p.location} ${p.city} ${p.state}`.toLowerCase();
      return (
        haystack.includes(loc) ||
        loc.split(',').some((part) => {
          const t = part.trim();
          return t.length > 1 && haystack.includes(t);
        })
      );
    });
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
