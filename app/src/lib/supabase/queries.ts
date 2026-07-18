import type { AccessibilityFilterKey, Listing, SearchQuery, SearchResponse } from '../listings/types';
import { getSupabaseClient } from './client';
import { ACCESSIBILITY_COLUMN_MAP, accessibilityToReportColumns, rowToListing } from './mappers';
import type { ReportInsert } from './database.types';

export type SubmitReportInput = {
  propertyId?: string;
  issueType: 'inaccurate_feature' | 'missing_access' | 'new_listing' | 'other';
  title?: string;
  location?: string;
  reporterEmail?: string;
  notes: string;
  features?: Partial<Record<AccessibilityFilterKey, boolean>>;
};

export type SubmitReportResult = {
  id: string;
  status: string;
};

/**
 * Search properties with location, category, and accessibility filters.
 *
 * @example
 * await searchPropertiesFromSupabase({
 *   location: 'Orlando',
 *   category: 'hotel',
 *   requiredFeatures: { rollInShower: true, elevator: true },
 * });
 */
export async function searchPropertiesFromSupabase(
  query: SearchQuery,
): Promise<SearchResponse> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  let dbQuery = supabase.from('properties').select('*');

  const loc = query.location.trim();
  if (loc) {
    const term = loc.replace(/[%_]/g, '').trim();
    dbQuery = dbQuery.or(
      `location.ilike.%${term}%,city.ilike.%${term}%,state.ilike.%${term}%`,
    );
  }

  if (query.category) {
    dbQuery = dbQuery.eq('category', query.category);
  }

  for (const [key, required] of Object.entries(query.requiredFeatures)) {
    if (!required) continue;
    const column = ACCESSIBILITY_COLUMN_MAP[key as AccessibilityFilterKey];
    if (column) {
      dbQuery = dbQuery.eq(column, true);
    }
  }

  dbQuery = dbQuery.order('verified', { ascending: false }).order('rating', { ascending: false });

  const { data, error } = await dbQuery;

  if (error) {
    throw new Error(error.message);
  }

  const results = (data ?? []).map(rowToListing);

  return {
    results,
    total: results.length,
    query,
  };
}

/**
 * Fetch a single property by UUID.
 *
 * @example
 * const listing = await getPropertyByIdFromSupabase('uuid-here');
 */
export async function getPropertyByIdFromSupabase(id: string): Promise<Listing | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? rowToListing(data) : null;
}

/**
 * Submit a community accessibility report.
 *
 * @example
 * await submitReportToSupabase({
 *   propertyId: listing.id,
 *   issueType: 'inaccurate_feature',
 *   notes: 'Roll-in shower was not available on arrival.',
 *   reporterEmail: 'traveler@example.com',
 * });
 */
export async function submitReportToSupabase(
  input: SubmitReportInput,
): Promise<SubmitReportResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const payload: ReportInsert = {
    property_id: input.propertyId ?? null,
    issue_type: input.issueType,
    title: input.title ?? null,
    location: input.location ?? null,
    reporter_email: input.reporterEmail ?? null,
    notes: input.notes.trim(),
    status: 'pending',
    ...accessibilityToReportColumns(input.features ?? {}),
  };

  const { data, error } = await supabase
    .from('reports')
    .insert(payload)
    .select('id, status')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { id: data.id, status: data.status };
}

/** Distinct locations for search suggestions */
export async function fetchLocationSuggestions(term: string, limit = 8): Promise<string[]> {
  const supabase = getSupabaseClient();
  if (!supabase || term.trim().length < 2) return [];

  const pattern = `%${term.trim()}%`;
  const { data, error } = await supabase
    .from('properties')
    .select('location, city, state')
    .or(`location.ilike.${pattern},city.ilike.${pattern},state.ilike.${pattern}`)
    .limit(limit * 2);

  if (error || !data) return [];

  const seen = new Set<string>();
  const suggestions: string[] = [];

  for (const row of data) {
    for (const candidate of [row.location, row.city && row.state ? `${row.city}, ${row.state}` : null]) {
      if (!candidate || seen.has(candidate)) continue;
      seen.add(candidate);
      suggestions.push(candidate);
      if (suggestions.length >= limit) return suggestions;
    }
  }

  return suggestions;
}
