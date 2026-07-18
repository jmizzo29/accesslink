import { apiUrl } from '../api-base';
import type { Listing } from '../listings/types';
import { rankListingsLocally } from './rankLocal';

export type ParsedNeeds = {
  requiredFeatures: Partial<Record<string, boolean>>;
  featureList: string[];
  matchedPhrases: string[];
  parsed: boolean;
};

export type MatchResult = {
  results: Listing[];
  parsed: ParsedNeeds;
  ranked: boolean;
};

export async function matchListingsByNeeds(
  needs: string,
  listings: Listing[],
): Promise<MatchResult | null> {
  const trimmed = needs.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch(apiUrl('/api/match'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ needs: trimmed, listings }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        results: data.results ?? listings,
        parsed:
          data.parsed ?? {
            parsed: false,
            featureList: [],
            requiredFeatures: {},
            matchedPhrases: [],
          },
        ranked: Boolean(data.ranked),
      };
    }
  } catch {
    /* fall through to local rank */
  }

  const local = rankListingsLocally(listings, trimmed);
  return {
    results: local.listings,
    parsed: local.parsed,
    ranked: local.ranked,
  };
}
