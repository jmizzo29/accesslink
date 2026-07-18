import type { Listing, ListingCategory } from '../listings/types';
import type { AccessibilityCloudFeature, WheelchairRating } from './types';

const HOTEL_CATEGORIES = new Set([
  'hotel',
  'hotels',
  'accommodation',
  'accommodations',
  'lodging',
  'motel',
  'hostel',
  'guest_house',
]);

const STAY_CATEGORIES = new Set(['vacation_rental', 'apartment', 'bnb']);

const AIRPORT_CATEGORIES = new Set(['airport', 'airports', 'transport']);

export function parseWheelchairRating(
  accessibility?: AccessibilityCloudFeature['properties']['accessibility'],
): WheelchairRating {
  if (!accessibility) return 'unknown';
  if (accessibility.accessibleWith?.wheelchair === true) return 'full';
  if (accessibility.partiallyAccessibleWith?.wheelchair === true) return 'partial';
  if (accessibility.accessibleWith?.wheelchair === false) return 'none';
  return 'unknown';
}

export function wheelchairRatingLabel(rating: WheelchairRating): string {
  switch (rating) {
    case 'full':
      return 'Fully wheelchair accessible';
    case 'partial':
      return 'Partially wheelchair accessible';
    case 'none':
      return 'Not wheelchair accessible';
    default:
      return 'Wheelchair access unknown';
  }
}

function mapCloudCategory(category?: string): ListingCategory {
  const key = (category ?? '').toLowerCase();
  if (AIRPORT_CATEGORIES.has(key) || key.includes('airport')) return 'airport';
  if (STAY_CATEGORIES.has(key)) return 'airbnb';
  if (HOTEL_CATEGORIES.has(key) || key.includes('hotel')) return 'hotel';
  return 'hotel';
}

function parseAddressParts(address: string): { city: string; state: string } {
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      city: parts[parts.length - 3] ?? parts[0] ?? address,
      state: parts[parts.length - 2] ?? '',
    };
  }
  return { city: address, state: '' };
}

export function cloudFeatureToListing(feature: AccessibilityCloudFeature): Listing | null {
  const props = feature.properties;
  if (!props?._id) return null;

  const [lng, lat] = feature.geometry?.coordinates ?? [0, 0];
  const address = props.address ?? props.name ?? 'Address not listed';
  const { city, state } = parseAddressParts(address);
  const wheelchairRating = parseWheelchairRating(props.accessibility);
  const wheelchairOk = wheelchairRating === 'full' || wheelchairRating === 'partial';

  return {
    id: `ac-cloud-${props._id}`,
    name: props.name ?? 'Unnamed place',
    location: state ? `${city}, ${state}` : city,
    address,
    city,
    state,
    category: mapCloudCategory(props.category),
    price: 0,
    priceLabel: 'Open accessibility data',
    rating: 0,
    reviewCount: 0,
    verified: false,
    provenance: 'open-data',
    wheelchairRating,
    accessibilityCloudId: props._id,
    summary:
      wheelchairRating === 'unknown'
        ? 'Wheelchair accessibility reported on Wheelmap / accessibility.cloud.'
        : `${wheelchairRatingLabel(wheelchairRating)} — community open data.`,
    description:
      'Place data from accessibility.cloud (Wheelmap, OpenStreetMap, and partner sources). Confirm details with the venue before visiting.',
    photos: [],
    coordinates: { lat, lng },
    accessibility: {
      wheelchairRamp: wheelchairOk,
      rollInShower: false,
      elevator: false,
      wideDoorways: false,
      accessibleParking: false,
      accessibleRestroom: props.category?.includes('toilet') ?? false,
      accessibleEntrance: wheelchairOk,
      loweredBathroom: false,
      serviceAnimalsAllowed: false,
      ceilingHoist: false,
    },
  };
}

export function enrichListingFromCloud(
  listing: Listing,
  feature: AccessibilityCloudFeature,
): Listing {
  const rating = parseWheelchairRating(feature.properties.accessibility);
  const wheelchairOk = rating === 'full' || rating === 'partial';

  return {
    ...listing,
    wheelchairRating: rating,
    accessibilityCloudId: feature.properties._id,
    provenance: listing.provenance ?? (listing.verified ? 'verified' : 'community'),
    accessibility: {
      ...listing.accessibility,
      wheelchairRamp: listing.accessibility.wheelchairRamp || wheelchairOk,
      accessibleEntrance: listing.accessibility.accessibleEntrance || wheelchairOk,
      accessibleRestroom:
        listing.accessibility.accessibleRestroom ||
        (feature.properties.category?.includes('toilet') ?? false),
    },
    summary:
      listing.summary ||
      `${wheelchairRatingLabel(rating)} per Wheelmap / accessibility.cloud.`,
  };
}

export function namesLikelyMatch(a: string, b: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return false;
  return na.includes(nb) || nb.includes(na);
}

export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  if (!a.lat || !a.lng || !b.lat || !b.lng) return Number.POSITIVE_INFINITY;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
