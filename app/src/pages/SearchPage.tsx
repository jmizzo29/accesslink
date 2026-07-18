import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';
import { AppNav } from '../components/AppNav';
import { AccessibilityFilters } from '../components/search/AccessibilityFilters';
import { ListingDetailPanel } from '../components/search/ListingDetailPanel';
import { NeedsMatcher } from '../components/search/NeedsMatcher';
import { SearchEmptyState } from '../components/search/SearchEmptyState';
import { SearchResultsList } from '../components/search/SearchResults';
import { LISTING_CATEGORIES } from '../lib/listings/filters';
import { searchListings } from '../lib/listings/repository';
import { resolveProvenance } from '../lib/listings/provenance';
import { matchListingsByNeeds } from '../lib/match/client';
import { fetchMonadStatus } from '../lib/monad/client';
import type { AccessibilityFilterKey, Listing, ListingCategory } from '../lib/listings/types';
import type { MonadChainStatus } from '../lib/monad/types';

type SearchStatus = 'idle' | 'loading' | 'done' | 'error';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const demoBootstrapped = useRef(false);

  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<ListingCategory | ''>('');
  const [featureFilters, setFeatureFilters] = useState<
    Partial<Record<AccessibilityFilterKey, boolean>>
  >({});
  const [results, setResults] = useState<Listing[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [needs, setNeeds] = useState('');
  const [matching, setMatching] = useState(false);
  const [ranked, setRanked] = useState(false);
  const [parsedFeatures, setParsedFeatures] = useState<string[]>([]);
  const [enrichmentNote, setEnrichmentNote] = useState<string | null>(null);
  const [monadStatus, setMonadStatus] = useState<MonadChainStatus | null>(null);

  const activeFilterCount = Object.values(featureFilters).filter(Boolean).length;

  useEffect(() => {
    fetchMonadStatus().then(setMonadStatus);
  }, []);

  const handleFilterChange = useCallback((key: AccessibilityFilterKey, checked: boolean) => {
    setFeatureFilters((prev) => {
      const next = { ...prev };
      if (checked) {
        next[key] = true;
      } else {
        delete next[key];
      }
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
    }) => {
      const loc = opts?.location ?? location;
      const cat = opts?.category ?? category;
      const feats = opts?.requiredFeatures ?? featureFilters;
      const needsText = opts?.needsText;

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
        const parts: string[] = [];
        if (demo) parts.push(`${demo} curated demo stay${demo === 1 ? '' : 's'}`);
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
    [location, category, featureFilters],
  );

  useEffect(() => {
    if (demoBootstrapped.current) return;
    const isDemo = searchParams.get('demo') === '1';
    const locParam = searchParams.get('location') || '';
    const needsParam = searchParams.get('needs') || '';
    const rollIn = searchParams.get('rollInShower') === '1';

    if (!isDemo && !locParam && !needsParam) return;
    demoBootstrapped.current = true;

    const feats: Partial<Record<AccessibilityFilterKey, boolean>> = {};
    if (rollIn) feats.rollInShower = true;

    if (locParam) setLocation(locParam);
    if (rollIn) setFeatureFilters(feats);
    if (needsParam) setNeeds(needsParam);

    void runSearch({
      location: locParam || 'New York, NY',
      requiredFeatures: feats,
      needsText: needsParam || undefined,
    });
  }, [searchParams, runSearch]);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    await runSearch();
  }

  async function handleMatch() {
    if (needs.trim().length < 8) return;
    setMatching(true);
    try {
      if (!hasSearched || results.length === 0) {
        await runSearch({ needsText: needs });
      } else {
        const match = await matchListingsByNeeds(needs, results);
        if (match) {
          setResults(match.results);
          setRanked(match.ranked);
          setParsedFeatures(match.parsed.featureList);
        }
      }
    } finally {
      setMatching(false);
    }
  }

  function handleViewDetails(listing: Listing) {
    navigate(`/property/${listing.id}${searchParams.get('demo') === '1' ? '?demo=1' : ''}`);
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
      <AppNav variant="app" />

      <div className="mx-auto max-w-[1080px] px-6 py-12 sm:px-8 sm:py-16">
        <header className="max-w-2xl">
          <h1 className="font-display text-[40px] font-semibold tracking-tight text-[#1d1d1f] sm:text-[48px]">
            Search
          </h1>
          <p className="mt-4 text-[19px] leading-relaxed text-[#6e6e73]">
            Find hotels, stays, and airports with verified accessibility details — curated demo stays
            and live open-map places are labeled clearly.
          </p>
          {enrichmentNote && (
            <p className="mt-3 text-[14px] text-[#0f4c5c]">{enrichmentNote}</p>
          )}
        </header>

        <form
          onSubmit={handleSearch}
          className="mt-12 rounded-2xl border border-[#d2d2d7] bg-white p-6 sm:p-8"
          aria-label="Search accessible places"
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_auto_auto] lg:items-end">
            <div>
              <label htmlFor="search-location" className="block text-[13px] font-medium text-[#6e6e73]">
                Location
              </label>
              <div className="relative mt-2">
                <MapPin
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]"
                  aria-hidden
                />
                <input
                  id="search-location"
                  type="search"
                  autoComplete="address-level2"
                  placeholder="e.g. New York, NY or Orlando, FL"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] py-3.5 pl-11 pr-4 text-[17px] text-[#1d1d1f] placeholder:text-[#86868b] transition-colors focus:border-[#0f4c5c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
                />
              </div>
            </div>

            <div className="lg:w-44">
              <label htmlFor="search-category" className="block text-[13px] font-medium text-[#6e6e73]">
                Type
              </label>
              <select
                id="search-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ListingCategory | '')}
                className="mt-2 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3.5 text-[17px] text-[#1d1d1f] transition-colors focus:border-[#0f4c5c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
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
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#0f4c5c] px-8 text-[17px] font-medium text-white transition-colors hover:bg-[#0a3540] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0f4c5c] disabled:opacity-60 lg:min-w-[140px]"
            >
              <Search className="h-4 w-4" aria-hidden />
              {status === 'loading' ? 'Searching…' : 'Search'}
            </button>
          </div>

          <AccessibilityFilters
            selected={featureFilters}
            onChange={handleFilterChange}
            onClear={clearFilters}
          />
        </form>

        <NeedsMatcher
          value={needs}
          onChange={setNeeds}
          onMatch={() => void handleMatch()}
          matching={matching}
          parsedFeatures={parsedFeatures}
        />

        {ranked && results[0] && (
          <div className="mt-8 rounded-2xl border border-[#0f4c5c]/20 bg-gradient-to-br from-[#f0f9fa] to-white p-6 sm:p-8">
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#0f4c5c]">
              Access Match → Anchor
            </p>
            <h2 className="mt-2 font-display text-[24px] font-semibold tracking-tight">
              Best fit: {results[0].name}
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#6e6e73]">
              Feature-by-feature match against your needs. Anchor a verification on Monad so the
              trust signal is public and inspectable.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to={`/property/${results[0].id}`}
                className="inline-flex min-h-[44px] items-center rounded-full border border-[#d2d2d7] px-5 text-[15px] font-medium"
              >
                Inspect stay
              </Link>
            </div>
          </div>
        )}

        <section className="mt-12" aria-live="polite" aria-busy={status === 'loading'}>
          {status === 'loading' && (
            <div className="rounded-2xl border border-[#d2d2d7] bg-white px-8 py-20 text-center">
              <p className="text-[17px] text-[#6e6e73]">Searching listings…</p>
            </div>
          )}

          {status === 'error' && (
            <div
              className="rounded-2xl border border-[#d2d2d7] bg-white px-8 py-20 text-center"
              role="alert"
            >
              <p className="text-[17px] text-[#6e6e73]">
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
    </div>
  );
}
