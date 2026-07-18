import type { AccessibilityFilterKey } from '../listings/types';

const NEED_PATTERNS: { keys: AccessibilityFilterKey[]; patterns: RegExp[] }[] = [
  { keys: ['rollInShower'], patterns: [/roll[\s-]?in\s+shower/i, /barrier[\s-]?free\s+shower/i] },
  { keys: ['elevator'], patterns: [/elevator/i, /lift\b/i, /no\s+stairs/i] },
  { keys: ['wheelchairRamp', 'accessibleEntrance'], patterns: [/zero\s+step/i, /step[\s-]?free/i, /wheelchair\s+access/i, /ramp/i] },
  { keys: ['wideDoorways'], patterns: [/wide\s+door/i, /32[\s-]?inch/i, /36[\s-]?inch/i] },
  { keys: ['accessibleParking'], patterns: [/accessible\s+parking/i, /van\s+accessible/i] },
  { keys: ['accessibleRestroom'], patterns: [/accessible\s+(rest)?room/i] },
  { keys: ['loweredBathroom'], patterns: [/lowered\s+sink/i, /roll[\s-]?under/i] },
  { keys: ['serviceAnimalsAllowed'], patterns: [/service\s+animal/i] },
  { keys: ['ceilingHoist'], patterns: [/ceiling\s+hoist/i, /hoyer/i] },
];

export function parseNeedsLocally(text: string) {
  const trimmed = text.trim();
  const requiredFeatures: Partial<Record<AccessibilityFilterKey, boolean>> = {};
  const matchedPhrases: string[] = [];

  for (const { keys, patterns } of NEED_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(trimmed)) {
        for (const key of keys) requiredFeatures[key] = true;
        matchedPhrases.push(pattern.source.slice(0, 36));
        break;
      }
    }
  }

  const featureList = Object.keys(requiredFeatures) as AccessibilityFilterKey[];
  return {
    requiredFeatures,
    featureList,
    matchedPhrases: [...new Set(matchedPhrases)],
    parsed: featureList.length > 0,
  };
}
