import type { ListingCategory } from '../listings/types';
import { cloudFeatureToListing } from './mappers';
import { fetchAccessibilityCloud } from './client';
import type { AccessibilityCloudFeature, AccessibilityCloudResponse } from './types';

export type CloudSearchParams = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  category?: ListingCategory | '';
  wheelchairFilter?: string;
  limit?: number;
};

const CATEGORY_INCLUDE: Record<ListingCategory, string> = {
  hotel: 'hotel,accommodation,lodging,motel,hostel',
  airbnb: 'accommodation,vacation_rental,apartment',
  airport: 'airport,transport',
};

export async function searchPlacesNearLocation(
  params: CloudSearchParams,
): Promise<AccessibilityCloudResponse> {
  const query: Record<string, string | number | undefined> = {
    latitude: params.latitude,
    longitude: params.longitude,
    accuracy: Math.min(params.accuracyMeters ?? 15000, 10000),
    limit: params.limit ?? 30,
    includeRelated: 'source',
  };

  if (params.wheelchairFilter) {
    query.filter = params.wheelchairFilter;
  }

  if (params.category) {
    query.includeCategories = CATEGORY_INCLUDE[params.category];
  }

  return fetchAccessibilityCloud<AccessibilityCloudResponse>('/place-infos.json', query);
}

export async function getPlaceByIdFromAccessibilityCloud(
  listingId: string,
): Promise<ReturnType<typeof cloudFeatureToListing>> {
  const cloudId = listingId.startsWith('ac-cloud-')
    ? listingId.slice('ac-cloud-'.length)
    : listingId;

  const data = await fetchAccessibilityCloud<AccessibilityCloudFeature>(
    `/place-infos/${cloudId}.json`,
    {},
  );

  if (!data?.properties?._id) return null;
  return cloudFeatureToListing({
    type: 'Feature',
    geometry: data.geometry,
    properties: data.properties,
  });
}

export function wheelchairFilterFromFeatures(
  required: Partial<Record<string, boolean>>,
): string | undefined {
  if (required.wheelchairRamp || required.accessibleEntrance) {
    return 'at-least-partially-accessible-by-wheelchair';
  }
  return undefined;
}
