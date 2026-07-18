/**
 * Natural-language accessibility needs → feature extraction + listing scores.
 * No external LLM — deterministic keyword matching for demo reliability.
 */

const NEED_PATTERNS = [
  { keys: ['rollInShower'], patterns: [/roll[\s-]?in\s+shower/i, /barrier[\s-]?free\s+shower/i, /walk[\s-]?in\s+shower/i] },
  { keys: ['elevator'], patterns: [/elevator/i, /lift\b/i, /no\s+stairs/i] },
  { keys: ['wheelchairRamp', 'accessibleEntrance'], patterns: [/zero\s+step/i, /no\s+steps/i, /step[\s-]?free/i, /wheelchair\s+access/i, /ramp/i] },
  { keys: ['wideDoorways'], patterns: [/wide\s+door/i, /32[\s-]?inch/i, /36[\s-]?inch/i, /doorway/i] },
  { keys: ['accessibleParking'], patterns: [/accessible\s+parking/i, /van\s+accessible/i, /parking/i] },
  { keys: ['accessibleRestroom'], patterns: [/accessible\s+(rest)?room/i, /toilet/i, /bathroom/i] },
  { keys: ['loweredBathroom'], patterns: [/lowered\s+(sink|mirror|fixture)/i, /roll[\s-]?under\s+sink/i] },
  { keys: ['serviceAnimalsAllowed'], patterns: [/service\s+animal/i, /guide\s+dog/i] },
  { keys: ['ceilingHoist'], patterns: [/ceiling\s+hoist/i, /overhead\s+lift/i, /hoyer/i] },
];

const FEATURE_LABELS = {
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

export function parseNeedsFromText(text) {
  const trimmed = String(text || '').trim();
  const requiredFeatures = {};
  const matchedPhrases = [];

  for (const { keys, patterns } of NEED_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(trimmed)) {
        for (const key of keys) {
          requiredFeatures[key] = true;
        }
        matchedPhrases.push(pattern.source.replace(/\\s/g, ' ').slice(0, 40));
        break;
      }
    }
  }

  const featureList = Object.keys(requiredFeatures);
  return {
    requiredFeatures,
    featureList,
    matchedPhrases: [...new Set(matchedPhrases)],
    parsed: featureList.length > 0,
  };
}

export function scoreListingForNeeds(listing, requiredFeatures) {
  const keys = Object.keys(requiredFeatures).filter((k) => requiredFeatures[k]);
  if (!keys.length) {
    return { score: 50, matchPercent: 0, matched: [], missing: [], reasons: ['Describe your needs to rank results.'] };
  }

  const matched = [];
  const missing = [];

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

  const reasons = [];
  if (matched.length) {
    reasons.push(`Has ${matched.map((k) => FEATURE_LABELS[k] || k).join(', ')}.`);
  }
  if (missing.length) {
    reasons.push(`Missing ${missing.map((k) => FEATURE_LABELS[k] || k).join(', ')} — confirm with property.`);
  }
  if (listing.verifiedOnChain) reasons.push('On-chain verified record.');
  if (listing.wheelchairRating === 'full') reasons.push('Wheelmap: fully wheelchair accessible.');

  return { score, matchPercent, matched, missing, reasons };
}

export function rankListingsByNeeds(listings, needsText) {
  const parsed = parseNeedsFromText(needsText);
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
