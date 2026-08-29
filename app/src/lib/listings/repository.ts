import { enrichSearchWithAccessibilityCloud } from '../accessibility-cloud/enrich';
import { isSupabaseConfigured } from '../supabase/client';
import {
  getPropertyByIdFromSupabase,
  searchPropertiesFromSupabase,
  submitReportToSupabase,
} from '../supabase/queries';
import type { SubmitReportInput, SubmitReportResult } from '../supabase/queries';
import { apiUrl } from '../api-base';
import type { Listing, SearchQuery, SearchResponse } from './types';
import { buildAccessibilityPayload } from './filters';
import {
  getCommunityListingByIdAsync,
  loadCommunityCatalog,
  mergeCommunityIntoResults,
  readLocalCommunityCatalog,
} from './communityCatalog';
import { getListingById as getLocalById } from './mockData';
import { searchListingsLocal } from './searchLocal';
import { withListingPhoto } from './photos';

export type ListingsDataSource = 'supabase' | 'api' | 'local';

export type DataSourceInfo = {
  source: ListingsDataSource;
  label: string;
};

export function resolveDataSource(): DataSourceInfo {
  if (isSupabaseConfigured()) {
    return { source: 'supabase', label: 'Live database' };
  }
  return { source: 'local', label: 'Demo catalog (works without env vars)' };
}

function mergeById(primary: Listing[], secondary: Listing[]): Listing[] {
  const byId = new Map<string, Listing>();
  for (const listing of [...secondary, ...primary]) {
    byId.set(listing.id, listing);
  }
  return [...byId.values()];
}

async function applyCloudEnrichment(
  response: SearchResponse,
  query: SearchQuery,
  dataSource: ListingsDataSource,
): Promise<SearchResponse & { dataSource: ListingsDataSource }> {
  try {
    const enriched = await enrichSearchWithAccessibilityCloud(response.results, query);
    return {
      ...response,
      results: enriched.results,
      total: enriched.results.length,
      dataSource,
      accessibilityCloudEnriched: enriched.cloudEnriched,
      cloudPlacesAdded: enriched.cloudPlacesAdded,
      enrichmentSource: enriched.enrichmentSource ?? response.enrichmentSource,
    };
  } catch {
    return { ...response, dataSource };
  }
}

async function withCommunity(
  response: SearchResponse,
  query: SearchQuery,
  dataSource: ListingsDataSource,
): Promise<SearchResponse & { dataSource: ListingsDataSource }> {
  const community = await loadCommunityCatalog();
  const merged = mergeCommunityIntoResults(
    response.results,
    community,
    query.location,
    query.category,
  );
  const required = query.requiredFeatures;
  const filtered =
    required && Object.keys(required).length > 0
      ? merged.filter((listing) =>
          Object.entries(required).every(([feature, mustHave]) => {
            if (!mustHave) return true;
            const key = feature as keyof Listing['accessibility'];
            return listing.accessibility[key] === true;
          }),
        )
      : merged;

  return applyCloudEnrichment(
    { ...response, results: filtered, total: filtered.length },
    query,
    dataSource,
  );
}

export async function searchListings(
  query: SearchQuery,
  options: { dataSource?: ListingsDataSource } = {},
): Promise<SearchResponse & { dataSource: ListingsDataSource }> {
  const forced = options.dataSource;
  const seed = searchListingsLocal(query, []);

  if (!forced || forced === 'supabase') {
    if (isSupabaseConfigured()) {
      try {
        const result = await searchPropertiesFromSupabase(query);
        const merged = { ...result, results: mergeById(result.results, seed.results) };
        return withCommunity(merged, query, 'supabase');
      } catch {
        if (forced === 'supabase') throw new Error('Supabase search failed');
      }
    }
  }

  if (!forced || forced === 'api') {
    try {
      const accessibility = buildAccessibilityPayload(query.requiredFeatures);
      const res = await fetch(apiUrl('/api/search'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: query.location.trim() || undefined,
          category: query.category || undefined,
          accessibility,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const results = mergeById(normalizeListings(data.results), seed.results);
        return withCommunity(
          {
            results,
            total: results.length,
            query,
            accessibilityCloudEnriched: data.accessibilityCloudEnriched,
            cloudPlacesAdded: data.cloudPlacesAdded,
            enrichmentSource: data.enrichmentSource,
          },
          query,
          results.length ? 'api' : 'local',
        );
      }
    } catch {
      if (forced === 'api') throw new Error('API search failed');
    }
  }

  const community = await loadCommunityCatalog();
  const local = searchListingsLocal(query, community);
  return applyCloudEnrichment(local, query, 'local');
}

export async function getListingById(
  id: string,
  options: { dataSource?: ListingsDataSource } = {},
): Promise<{ listing: Listing | null; dataSource: ListingsDataSource }> {
  const forced = options.dataSource;
  const local = getLocalById(id);
  if (local) return { listing: local, dataSource: 'local' };

  const justPublished = readLocalCommunityCatalog().find((listing) => listing.id === id);
  if (justPublished) return { listing: justPublished, dataSource: 'local' };

  const community = await getCommunityListingByIdAsync(id);
  if (community) return { listing: community, dataSource: 'local' };

  if (!forced || forced === 'api') {
    try {
      const res = await fetch(apiUrl(`/api/listings/${encodeURIComponent(id)}`));
      if (res.ok) {
        const data = await res.json();
        const listing = normalizeListings([data.listing ?? data])[0];
        if (listing?.id) return { listing, dataSource: 'api' };
      }
    } catch {
      if (forced === 'api') throw new Error('API fetch failed');
    }
  }

  if (!forced || forced === 'supabase') {
    if (isSupabaseConfigured()) {
      try {
        const listing = await getPropertyByIdFromSupabase(id);
        if (listing) return { listing, dataSource: 'supabase' };
      } catch {
        if (forced === 'supabase') throw new Error('Supabase fetch failed');
      }
    }
  }

  return { listing: null, dataSource: 'local' };
}

export async function submitAccessibilityReport(
  input: SubmitReportInput,
): Promise<SubmitReportResult> {
  if (isSupabaseConfigured()) {
    return submitReportToSupabase(input);
  }
  throw new Error(
    'Report submission requires a connected database. Use Contribute to add a community listing without env vars.',
  );
}

function normalizeListings(raw: unknown): Listing[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((item) => {
    const r = item as Record<string, unknown>;
    const acc = (r.accessibility as Record<string, boolean>) ?? {};
    const location = String(r.location ?? '');
    const city = String(r.city ?? location.split(',')[0]?.trim() ?? location);
    const state = String(r.state ?? location.split(',')[1]?.trim() ?? '');
    const photos = Array.isArray(r.photos) ? r.photos : [];
    const category = (r.category as Listing['category']) ?? 'hotel';

    return {
      id: String(r.id ?? ''),
      name: String(r.name ?? r.title ?? 'Unnamed listing'),
      location,
      address: String(r.address ?? location),
      city,
      state,
      category,
      price: Number(r.price ?? 0),
      priceLabel:
        typeof r.priceLabel === 'string'
          ? r.priceLabel
          : category === 'airport'
            ? 'public facility'
            : category === 'wav'
              ? 'WAV / transfer'
              : 'per night',
      rating: Number(r.rating ?? 0),
      reviewCount: Number(r.reviews ?? r.reviewCount ?? 0),
      verified: Boolean(r.verified ?? false),
      provenance: r.provenance as Listing['provenance'],
      summary: String(
        r.summary ?? r.description ?? 'Community-verified accessibility details available.',
      ).slice(0, 240),
      description: String(r.description ?? r.summary ?? ''),
      photos: photos.map((p: { url?: string; alt?: string }) => ({
        url: String(p.url ?? ''),
        alt: String(p.alt ?? 'Property photo'),
      })),
      coordinates: {
        lat: Number((r.coordinates as { lat?: number })?.lat ?? r.lat ?? 0),
        lng: Number((r.coordinates as { lng?: number })?.lng ?? r.lng ?? 0),
      },
      accessibility: {
        wheelchairRamp: Boolean(acc.wheelchairRamp ?? acc.wheelchair_ramp),
        rollInShower: Boolean(acc.rollInShower ?? acc.roll_in_shower),
        elevator: Boolean(acc.elevator),
        wideDoorways: Boolean(acc.wideDoorways ?? acc.wide_doorways),
        accessibleParking: Boolean(acc.accessibleParking ?? acc.accessible_parking),
        accessibleRestroom: Boolean(acc.accessibleRestroom ?? acc.accessible_restroom),
        accessibleEntrance: Boolean(
          acc.accessibleEntrance ?? acc.accessible_entrance ?? acc.wheelchairRamp,
        ),
        loweredBathroom: Boolean(acc.loweredBathroom ?? acc.lowered_bathroom),
        serviceAnimalsAllowed: Boolean(acc.serviceAnimalsAllowed ?? acc.service_animals_allowed),
        ceilingHoist: Boolean(acc.ceilingHoist ?? acc.ceiling_hoist),
      },
    };
  }).map(withListingPhoto);
}
