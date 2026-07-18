import type { AccessibilityFilterKey, Listing } from '../listings/types';
import { parseNeedsLocally } from './parseNeeds';

const FEATURE_LABELS: Record<string, string> = {
  rollInShower: 'roll-in shower',
  elevator: 'elevator',
  wheelchairRamp: 'step-free / ramp access',
  accessibleEntrance: 'accessible entrance',
  wideDoorways: 'wide doorways',
  accessibleParking: 'accessible parking',
  accessibleRestroom: 'accessible restroom',
  loweredBathroom: 'lowered fixtures',
  serviceAnimalsAllowed: 'service animals welcome',
  ceilingHoist: 'ceiling hoist',
};

export function scoreListingForNeeds(
  listing: Listing,
  requiredFeatures: Partial<Record<AccessibilityFilterKey, boolean>>,
) {
  const keys = (Object.keys(requiredFeatures) as AccessibilityFilterKey[]).filter(
    (k) => requiredFeatures[k],
  );
  if (!keys.length) {
    return {
      score: 50,
      matchPercent: 0,
      matched: [] as string[],
      missing: [] as string[],
      reasons: ['Describe your needs to rank results.'],
    };
  }

  const matched: string[] = [];
  const missing: string[] = [];

  for (const key of keys) {
    if (listing.accessibility?.[key]) matched.push(key);
    else missing.push(key);
  }

  const matchPercent = Math.round((matched.length / keys.length) * 100);
  let score = matchPercent;

  if (listing.verified) score += 8;
  if (listing.verifiedOnChain) score += 7;
  if (listing.wheelchairRating === 'full') score += 5;
  if (listing.provenance === 'open-data' && matched.length > 0) score += 3;
  if (missing.length === 0) score += 10;

  score = Math.min(100, score);

  const reasons: string[] = [];
  if (matched.length) {
    reasons.push(`Has ${matched.map((k) => FEATURE_LABELS[k] || k).join(', ')}.`);
  }
  if (missing.length) {
    reasons.push(
      `Missing ${missing.map((k) => FEATURE_LABELS[k] || k).join(', ')} — confirm with property.`,
    );
  }
  if (listing.verifiedOnChain) reasons.push('On-chain verified record.');
  if (listing.wheelchairRating === 'full') reasons.push('Wheelmap: fully wheelchair accessible.');

  return { score, matchPercent, matched, missing, reasons };
}

export function rankListingsLocally(listings: Listing[], needsText: string) {
  const parsed = parseNeedsLocally(needsText);
  const scored = listings.map((listing) => {
    const match = scoreListingForNeeds(listing, parsed.requiredFeatures);
    return {
      ...listing,
      matchScore: match.score,
      matchPercent: match.matchPercent,
      matchReasons: match.reasons,
      matchMissing: match.missing,
      matchMatched: match.matched,
    };
  });

  if (!parsed.parsed) {
    return { listings: scored, parsed, ranked: false };
  }

  scored.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  return { listings: scored, parsed, ranked: true };
}
