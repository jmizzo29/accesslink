import type { AccessibilityFilterKey } from './types';

/** User-facing filter labels — single source of truth for UI + API keys */
export const ACCESSIBILITY_FILTERS: {
  key: AccessibilityFilterKey;
  label: string;
  description: string;
}[] = [
  {
    key: 'wheelchairRamp',
    label: 'Wheelchair access',
    description: 'Step-free entrance or ramp',
  },
  {
    key: 'rollInShower',
    label: 'Roll-in shower',
    description: 'Barrier-free shower with grab bars',
  },
  {
    key: 'elevator',
    label: 'Elevator',
    description: 'Elevator to guest floors',
  },
  {
    key: 'wideDoorways',
    label: 'Wide doorways',
    description: 'Doorways ≥ 32 inches clear width',
  },
  {
    key: 'accessibleParking',
    label: 'Accessible parking',
    description: 'Van-accessible or close parking',
  },
  {
    key: 'accessibleRestroom',
    label: 'Accessible restroom',
    description: 'Public or in-room accessible toilet',
  },
  {
    key: 'loweredBathroom',
    label: 'Lowered fixtures',
    description: 'Sink, mirror, or controls at wheelchair height',
  },
  {
    key: 'serviceAnimalsAllowed',
    label: 'Service animals',
    description: 'Service animals welcome without extra fees',
  },
];

export const LISTING_CATEGORIES = [
  { value: '', label: 'All types' },
  { value: 'hotel', label: 'Hotels' },
  { value: 'airbnb', label: 'Airbnb / stays' },
  { value: 'wav', label: 'Wheelchair vans (WAV)' },
  { value: 'airport', label: 'Airports' },
] as const;

export const CONTRIBUTE_CATEGORIES = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'airbnb', label: 'Airbnb / stay' },
  { value: 'wav', label: 'Wheelchair van (WAV)' },
] as const;

/** Features shown on result cards (subset for scannability) */
export const CARD_FEATURE_KEYS: AccessibilityFilterKey[] = [
  'wheelchairRamp',
  'rollInShower',
  'elevator',
  'wideDoorways',
  'accessibleParking',
  'accessibleRestroom',
];

export function categoryLabel(category: string): string {
  if (category === 'airbnb') return 'Stay';
  if (category === 'airport') return 'Airport';
  if (category === 'hotel') return 'Hotel';
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function emptyRequiredFeatures(): Partial<Record<AccessibilityFilterKey, boolean>> {
  return {};
}

export function buildAccessibilityPayload(
  filters: Partial<Record<AccessibilityFilterKey, boolean>>,
): Record<string, boolean> | undefined {
  const entries = Object.entries(filters).filter(([, v]) => v === true);
  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries);
}
