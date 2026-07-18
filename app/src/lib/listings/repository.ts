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
} from './communityCatalog';
import { getListingById as getLocalById } from './mockData';
import { searchListingsLocal } from './searchLocal';

export type ListingsDataSource = 'supabase' | 'api' | 'local';

export type DataSourceInfo = {
  source: ListingsDataSource;
  label: string;
};

export function resolveDataSource(): DataSourceInfo {
  if (isSupabaseConfigured()) {
    return { source: 'supabase', label: 'Live database' };
  }
  return { source: 'local', label: 'Sample data (connect Supabase for live listings)' };
};

async function applyCloudEnrichment(
  response: SearchResponse,
  query: SearchQuery,
  dataSource: ListingsDataSource,
): Promise<SearchResponse & { dataSource: ListingsDataSource }> {
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

  if (!forced || forced === 'supabase') {
    if (isSupabaseConfigured()) {
      try {
        const result = await searchPropertiesFromSupabase(query);
        return withCommunity(result, query, 'supabase');
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
        const results = normalizeListings(data.results);
        return withCommunity(
          {
            results,
            total: data.total ?? results.length,
            query,
            accessibilityCloudEnriched: data.accessibilityCloudEnriched,
            cloudPlacesAdded: data.cloudPlacesAdded,
            enrichmentSource: data.enrichmentSource,
          },
          query,
          'api',
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

  const community = await getCommunityListingByIdAsync(id);
  if (community) return { listing: community, dataSource: 'local' };

  const local = getLocalById(id) ?? null;
  return { listing: local, dataSource: 'local' };
}

export async function submitAccessibilityReport(
  input: SubmitReportInput,
): Promise<SubmitReportResult> {
  if (isSupabaseConfigured()) {
    return submitReportToSupabase(input);
  }
  throw new Error(
    'Report submission requires Supabase. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
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

    return {
      id: String(r.id ?? ''),
      name: String(r.name ?? r.title ?? 'Unnamed listing'),
      location,
      address: String(r.address ?? location),
      city,
      state,
      category: (r.category as Listing['category']) ?? 'hotel',
      price: Number(r.price ?? 0),
      priceLabel: r.category === 'airport' ? 'public facility' : 'per night',
      rating: Number(r.rating ?? 0),
      reviewCount: Number(r.reviews ?? r.reviewCount ?? 0),
      verified: Boolean(r.verified ?? true),
      verifiedOnChain: Boolean(r.verifiedOnChain ?? r.verified_on_chain ?? false),
      monadRecordId: r.monadRecordId ? String(r.monadRecordId) : undefined,
      monadTxHash: r.monadTxHash ? String(r.monadTxHash) : undefined,
      monadVerifiedAt: r.monadVerifiedAt ? String(r.monadVerifiedAt) : undefined,
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
        accessibleEntrance: Boolean(acc.accessibleEntrance ?? acc.accessible_entrance ?? acc.wheelchairRamp),
        loweredBathroom: Boolean(acc.loweredBathroom ?? acc.lowered_bathroom),
        serviceAnimalsAllowed: Boolean(acc.serviceAnimalsAllowed ?? acc.service_animals_allowed),
        ceilingHoist: Boolean(acc.ceilingHoist ?? acc.ceiling_hoist),
      },
    };
  });
}
