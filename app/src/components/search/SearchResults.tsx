import type { Listing } from '../../lib/listings/types';
import type { MonadChainStatus } from '../../lib/monad/types';
import { ListingCard } from './ListingCard';
import { resolveProvenance } from '../../lib/listings/provenance';

type SearchResultsListProps = {
  results: Listing[];
  onViewDetails: (listing: Listing) => void;
  ranked?: boolean;
  monadStatus?: MonadChainStatus | null;
};

export function SearchResultsList({
  results,
  onViewDetails,
  ranked = false,
  monadStatus = null,
}: SearchResultsListProps) {
  const openDataCount = results.filter((r) => resolveProvenance(r) === 'open-data').length;
  const demoCount = results.filter((r) => resolveProvenance(r) === 'curated-demo').length;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2
          id="results-heading"
          className="text-[13px] font-medium uppercase tracking-[0.08em] text-[#86868b]"
        >
          {results.length} {results.length === 1 ? 'place' : 'places'}
          {ranked ? ' · ranked by need fit' : ''}
        </h2>
        <p className="text-[12px] text-[#86868b]">
          {demoCount > 0 && <span>{demoCount} curated demo</span>}
          {demoCount > 0 && openDataCount > 0 && <span> · </span>}
          {openDataCount > 0 && <span>{openDataCount} live open maps</span>}
        </p>
      </div>
      <ul className="grid list-none gap-4 p-0 sm:gap-6">
        {results.map((listing, index) => (
          <li key={listing.id}>
            <ListingCard
              listing={listing}
              onViewDetails={onViewDetails}
              showAnchor={ranked && index === 0}
              monadStatus={monadStatus}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
