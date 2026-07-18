import { isAccessibilityCloudConfigured } from './client';
import { apiUrl } from '../api-base';
import {
  cloudFeatureToListing,
  distanceMeters,
  enrichListingFromCloud,
  namesLikelyMatch,
} from './mappers';
import { searchPlacesNearLocation, wheelchairFilterFromFeatures } from './queries';
import type { AccessibilityCloudFeature } from './types';
import { geocodeLocation } from '../geocoding/nominatim';
import type { Listing, SearchQuery } from '../listings/types';

const MATCH_RADIUS_M = 350;
const MAX_CLOUD_ONLY = 12;

function findNearestFeature(
  listing: Listing,
  features: AccessibilityCloudFeature[],
): AccessibilityCloudFeature | null {
  let nearest: AccessibilityCloudFeature | null = null;
  let nearestScore = Number.POSITIVE_INFINITY;

  for (const feature of features) {
    const [lng, lat] = feature.geometry?.coordinates ?? [];
    if (lat == null || lng == null) continue;

    const dist = distanceMeters(listing.coordinates, { lat, lng });
    if (dist > MATCH_RADIUS_M) continue;

    const nameMatch = namesLikelyMatch(listing.name, feature.properties.name ?? '');
    const score = dist + (nameMatch ? 0 : 200);
    if (score < nearestScore) {
      nearestScore = score;
      nearest = feature;
    }
  }

  return nearest;
}

function isDuplicateCloudListing(existing: Listing[], candidate: Listing): boolean {
  return existing.some((item) => {
    if (item.accessibilityCloudId && item.accessibilityCloudId === candidate.accessibilityCloudId) {
      return true;
    }
    const dist = distanceMeters(item.coordinates, candidate.coordinates);
    return dist < MATCH_RADIUS_M && namesLikelyMatch(item.name, candidate.name);
  });
}

export type EnrichmentResult = {
  results: Listing[];
  cloudEnriched: boolean;
  cloudPlacesAdded: number;
  enrichmentSource?: 'wheelmap' | 'osm' | 'none';
};

/**
 * Merge accessibility.cloud (Wheelmap) open data into search results.
 * Enriches existing listings and appends nearby open-data places.
 */
export async function enrichSearchWithAccessibilityCloud(
  listings: Listing[],
  query: SearchQuery,
): Promise<EnrichmentResult> {
  if (!isAccessibilityCloudConfigured()) {
    try {
      const res = await fetch(apiUrl('/api/wheelmap/enrich'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listings,
          query: {
            location: query.location,
            category: query.category,
            accessibility: query.requiredFeatures,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          results: data.results ?? listings,
          cloudEnriched: Boolean(data.cloudEnriched),
          cloudPlacesAdded: data.cloudPlacesAdded ?? 0,
          enrichmentSource: data.enrichmentSource,
        };
      }
    } catch {
      /* fall through */
    }
    return { results: listings, cloudEnriched: false, cloudPlacesAdded: 0 };
  }

  let center = listings.find((l) => l.coordinates.lat && l.coordinates.lng)?.coordinates;

  if (!center && query.location.trim()) {
    const geo = await geocodeLocation(query.location);
    if (geo) center = { lat: geo.lat, lng: geo.lng };
  }

  if (!center) {
    return { results: listings, cloudEnriched: false, cloudPlacesAdded: 0 };
  }

  try {
    const response = await searchPlacesNearLocation({
      latitude: center.lat,
      longitude: center.lng,
      accuracyMeters: 10000,
      category: query.category,
      wheelchairFilter: wheelchairFilterFromFeatures(query.requiredFeatures),
      limit: 40,
    });

    const features = response.features ?? [];
    if (!features.length) {
      return { results: listings, cloudEnriched: true, cloudPlacesAdded: 0 };
    }

    const enriched = listings.map((listing) => {
      const match = findNearestFeature(listing, features);
      return match ? enrichListingFromCloud(listing, match) : listing;
    });

    const cloudOnly: Listing[] = [];
    for (const feature of features) {
      const mapped = cloudFeatureToListing(feature);
      if (!mapped) continue;
      if (query.category && mapped.category !== query.category) continue;
      if (isDuplicateCloudListing(enriched, mapped)) continue;
      cloudOnly.push(mapped);
      if (cloudOnly.length >= MAX_CLOUD_ONLY) break;
    }

    return {
      results: [...enriched, ...cloudOnly],
      cloudEnriched: true,
      cloudPlacesAdded: cloudOnly.length,
    };
  } catch {
    return { results: listings, cloudEnriched: false, cloudPlacesAdded: 0 };
  }
}
