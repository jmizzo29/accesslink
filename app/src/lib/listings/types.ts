/** Listing category — swap-friendly for Supabase enum later */
export type ListingCategory = 'hotel' | 'airbnb' | 'airport' | 'wav';

export type ListingPhoto = {
  url: string;
  alt: string;
};

export type ListingCoordinates = {
  lat: number;
  lng: number;
};

export type AccessibilityFeatures = {
  wheelchairRamp: boolean;
  rollInShower: boolean;
  elevator: boolean;
  wideDoorways: boolean;
  accessibleParking: boolean;
  accessibleRestroom: boolean;
  accessibleEntrance: boolean;
  loweredBathroom: boolean;
  serviceAnimalsAllowed: boolean;
  ceilingHoist?: boolean;
};

export type Listing = {
  id: string;
  name: string;
  location: string;
  address?: string;
  city: string;
  state: string;
  category: ListingCategory;
  price: number;
  priceLabel: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  summary: string;
  description?: string;
  photos?: ListingPhoto[];
  coordinates?: ListingCoordinates;
  accessibility: AccessibilityFeatures;
  provenance?: 'verified' | 'community' | 'open-data' | 'curated-demo';
  wheelchairRating?: 'full' | 'partial' | 'none' | 'unknown';
  accessibilityCloudId?: string;
  verifiedOnChain?: boolean;
  monadRecordId?: string;
  monadTxHash?: string;
  monadVerifiedAt?: string;
  matchScore?: number;
  matchPercent?: number;
  matchReasons?: string[];
  matchMissing?: string[];
  matchMatched?: string[];
};

export type AccessibilityFilterKey = keyof AccessibilityFeatures;

export type SearchQuery = {
  location: string;
  category: ListingCategory | '';
  requiredFeatures: Partial<Record<AccessibilityFilterKey, boolean>>;
};

export type SearchResponse = {
  results: Listing[];
  total: number;
  query: SearchQuery;
  accessibilityCloudEnriched?: boolean;
  cloudPlacesAdded?: number;
  enrichmentSource?: 'wheelmap' | 'osm' | 'none';
};
