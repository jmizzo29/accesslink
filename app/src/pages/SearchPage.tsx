import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { AccessibilityFilters } from '../components/search/AccessibilityFilters';
import { ListingDetailPanel } from '../components/search/ListingDetailPanel';
import { NeedsMatcher } from '../components/search/NeedsMatcher';
import { SearchEmptyState } from '../components/search/SearchEmptyState';
import { SearchResultsList } from '../components/search/SearchResults';
import { ACCESSIBILITY_FILTERS, LISTING_CATEGORIES } from '../lib/listings/filters';
import { searchListings } from '../lib/listings/repository';
import { resolveProvenance } from '../lib/listings/provenance';
import { matchListingsByNeeds } from '../lib/match/client';
import { fetchMonadStatus } from '../lib/monad/client';
import type { AccessibilityFilterKey, Listing, ListingCategory } from '../lib/listings/types';
import type { MonadChainStatus } from '../lib/monad/types';

type SearchStatus = 'idle' | 'loading' | 'done' | 'error';

const FEATURE_PARAM_KEYS = ACCESSIBILITY_FILTERS.map((f) => f.key);

function featuresFromParams(params: URLSearchParams): Partial<Record<AccessibilityFilterKey, boolean>> {
  const feats: Partial<Record<AccessibilityFilterKey, boolean>> = {};
  for (const key of FEATURE_PARAM_KEYS) {
    if (params.get(key) === '1') feats[key] = true;
  }
  return feats;
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const bootstrapped = useRef(false);

  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState<ListingCategory | ''>(
    (searchParams.get('category') as ListingCategory) || '',
  );
  const [featureFilters, setFeatureFilters] = useState<Partial<Record<AccessibilityFilterKey, boolean>>>(
    () => featuresFromParams(searchParams),
  );
  const [results, setResults] = useState<Listing[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [needs, setNeeds] = useState(searchParams.get('needs') || '');
  const [matching, setMatching] = useState(false);
  const [ranked, setRanked] = useState(false);
  const [parsedFeatures, setParsedFeatures] = useState<string[]>([]);
  const [enrichmentNote, setEnrichmentNote] = useState<string | null>(null);
  const [monadStatus, setMonadStatus] = useState<MonadChainStatus | null>(null);

  const activeFilterCount = Object.values(featureFilters).filter(Boolean).length;

  useEffect(() => {
    fetchMonadStatus().then(setMonadStatus);
  }, []);

  const syncUrl = useCallback(
    (next: {
      location?: string;
      category?: ListingCategory | '';
      requiredFeatures?: Partial<Record<AccessibilityFilterKey, boolean>>;
      needsText?: string;
    }) => {
      const params = new URLSearchParams();
      const loc = next.location ?? location;
      const cat = next.category ?? category;
      const feats = next.requiredFeatures ?? featureFilters;
      const needsText = next.needsText ?? needs;
      if (loc) params.set('location', loc);
      if (cat) params.set('category', cat);
      if (needsText) params.set('needs', needsText);
      if (searchParams.get('demo') === '1') params.set('demo', '1');
      Object.entries(feats).forEach(([key, on]) => {
        if (on) params.set(key, '1');
      });
      setSearchParams(params, { replace: true });
    },
    [location, category, featureFilters, needs, searchParams, setSearchParams],
  );

  const handleFilterChange = useCallback((key: AccessibilityFilterKey, checked: boolean) => {
    setFeatureFilters((prev) => {
      const next = { ...prev };
      if (checked) next[key] = true;
      else delete next[key];
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFeatureFilters({});
  }, []);

  const runSearch = useCallback(
    async (opts?: {
      location?: string;
      category?: ListingCategory | '';
      requiredFeatures?: Partial<Record<AccessibilityFilterKey, boolean>>;
      needsText?: string;
      writeUrl?: boolean;
    }) => {
      const loc = opts?.location ?? location;
      const cat = opts?.category ?? category;
      const feats = opts?.requiredFeatures ?? featureFilters;
      const needsText = opts?.needsText;

      if (opts?.writeUrl !== false) {
        syncUrl({ location: loc, category: cat, requiredFeatures: feats, needsText: needsText ?? needs });
      }

      setHasSearched(true);
      setStatus('loading');
      setSelectedListing(null);
      setRanked(false);

      try {
        const response = await searchListings({
          location: loc,
          category: cat,
          requiredFeatures: feats,
        });
        let nextResults = response.results;
        let nextRanked = false;
        let nextParsed: string[] = [];

        if (needsText && needsText.trim().length >= 8) {
          const match = await matchListingsByNeeds(needsText, nextResults);
          if (match) {
            nextResults = match.results;
            nextRanked = match.ranked;
            nextParsed = match.parsed.featureList;
          }
        }

        setResults(nextResults);
        setRanked(nextRanked);
        setParsedFeatures(nextParsed);
        setStatus('done');

        const openData = nextResults.filter((r) => resolveProvenance(r) === 'open-data').length;
        const demo = nextResults.filter((r) => resolveProvenance(r) === 'curated-demo').length;
        const community = nextResults.filter((r) => resolveProvenance(r) === 'community').length;
        const parts: string[] = [];
        if (demo) parts.push(`${demo} curated demo stay${demo === 1 ? '' : 's'}`);
        if (community) parts.push(`${community} community report${community === 1 ? '' : 's'}`);
        if (openData || response.cloudPlacesAdded) {
          parts.push(
            `${openData || response.cloudPlacesAdded || 0} live OpenStreetMap / Wheelmap place${
              (openData || response.cloudPlacesAdded || 0) === 1 ? '' : 's'
            }`,
          );
        }
        setEnrichmentNote(parts.length ? parts.join(' · ') : null);
      } catch {
        setResults([]);
        setStatus('error');
        setEnrichmentNote(null);
      }
    },
    [location, category, featureFilters, needs, syncUrl],
  );

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    const locParam = searchParams.get('location') || '';
    const needsParam = searchParams.get('needs') || '';
    const catParam = (searchParams.get('category') as ListingCategory) || '';
    const feats = featuresFromParams(searchParams);

    if (locParam) setLocation(locParam);
    if (catParam) setCategory(catParam);
    if (Object.keys(feats).length) setFeatureFilters(feats);
    if (needsParam) setNeeds(needsParam);

    void runSearch({
      location: locParam,
      category: catParam,
      requiredFeatures: feats,
      needsText: needsParam || undefined,
      writeUrl: false,
    });
  }, [searchParams, runSearch]);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    await runSearch({ writeUrl: true });
  }

  async function handleMatch() {
    if (needs.trim().length < 8) return;
    setMatching(true);
    try {
      await runSearch({ needsText: needs, writeUrl: true });
    } finally {
      setMatching(false);
    }
  }

  function handleViewDetails(listing: Listing) {
    navigate(`/property/${listing.id}${searchParams.get('demo') === '1' ? '?demo=1' : ''}`);
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-[1080px] px-4 py-12 sm:px-8 sm:py-16">
        <header className="max-w-2xl">
          <h1 className="font-display text-[40px] font-semibold tracking-tight sm:text-[48px]">Search</h1>
          <p className="mt-4 text-[19px] leading-relaxed text-[var(--muted)]">
            Find hotels, stays, airports, and wheelchair vans with verified accessibility details —
            curated demo stays and community reports are labeled clearly.
          </p>
          {enrichmentNote && <p className="mt-3 text-[14px] text-[var(--teal)]">{enrichmentNote}</p>}
        </header>

        <form
          onSubmit={handleSearch}
          className="mt-12 rounded-2xl border border-[var(--sand)] bg-[var(--paper)] p-6 sm:p-8"
          aria-label="Search accessible places"
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_auto_auto] lg:items-end">
            <div>
              <label htmlFor="search-location" className="block text-[13px] font-medium text-[var(--muted)]">
                Location
              </label>
              <div className="relative mt-2">
                <MapPin
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]"
                  aria-hidden
                />
                <input
                  id="search-location"
                  type="search"
                  autoComplete="address-level2"
                  placeholder="e.g. New York, NY or Orlando, FL"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-[var(--sand)] bg-[var(--cream)] py-3.5 pl-11 pr-4 text-[17px] placeholder:text-[var(--faint)] focus:border-[var(--teal)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/20"
                />
              </div>
            </div>

            <div className="lg:w-44">
              <label htmlFor="search-category" className="block text-[13px] font-medium text-[var(--muted)]">
                Type
              </label>
              <select
                id="search-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ListingCategory | '')}
                className="mt-2 w-full rounded-xl border border-[var(--sand)] bg-[var(--cream)] px-4 py-3.5 text-[17px] focus:border-[var(--teal)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/20"
              >
                {LISTING_CATEGORIES.map((c) => (
                  <option key={c.value || 'all'} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[var(--teal)] px-8 text-[17px] font-medium text-white hover:bg-[var(--teal-deep)] disabled:opacity-60 lg:min-w-[140px]"
            >
              <Search className="h-4 w-4" aria-hidden />
              {status === 'loading' ? 'Searching…' : 'Search'}
            </button>
          </div>

          <AccessibilityFilters selected={featureFilters} onChange={handleFilterChange} onClear={clearFilters} />
        </form>

        <NeedsMatcher
          value={needs}
          onChange={setNeeds}
          onMatch={() => void handleMatch()}
          matching={matching}
          parsedFeatures={parsedFeatures}
        />

        {ranked && results[0] && (
          <div className="mt-8 rounded-2xl border border-[var(--teal)]/20 bg-gradient-to-br from-[var(--teal-soft)] to-[var(--paper)] p-6 sm:p-8">
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--teal)]">
              Access Match → Anchor
            </p>
            <h2 className="mt-2 font-display text-[24px] font-semibold tracking-tight">
              Best fit: {results[0].name}
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
              Feature-by-feature match against your needs. Anchor a verification on Monad so the trust
              signal is public and inspectable.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to={`/property/${results[0].id}`}
                className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--sand)] bg-[var(--paper)] px-5 text-[15px] font-medium"
              >
                Inspect stay
              </Link>
            </div>
          </div>
        )}

        <section className="mt-12" aria-live="polite" aria-busy={status === 'loading'}>
          {status === 'loading' && (
            <div className="rounded-2xl border border-[var(--sand)] bg-[var(--paper)] px-8 py-20 text-center">
              <p className="text-[17px] text-[var(--muted)]">Searching listings…</p>
            </div>
          )}

          {status === 'error' && (
            <div
              className="rounded-2xl border border-[var(--sand)] bg-[var(--paper)] px-8 py-20 text-center"
              role="alert"
            >
              <p className="text-[17px] text-[var(--muted)]">
                Search is temporarily unavailable. Please try again shortly.
              </p>
            </div>
          )}

          {status !== 'loading' && status !== 'error' && results.length === 0 && (
            <SearchEmptyState searched={hasSearched} hasFilters={activeFilterCount > 0} />
          )}

          {status === 'done' && results.length > 0 && (
            <SearchResultsList
              results={results}
              onViewDetails={handleViewDetails}
              ranked={ranked}
              monadStatus={monadStatus}
            />
          )}
        </section>
      </div>

      <ListingDetailPanel listing={selectedListing} onClose={() => setSelectedListing(null)} />
    </PageShell>
  );
}
