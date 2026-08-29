import type { Listing } from '../../lib/listings/types';
import { ListingCard } from './ListingCard';
import { resolveProvenance } from '../../lib/listings/provenance';

type SearchResultsListProps = {
  results: Listing[];
  ranked?: boolean;
};

export function SearchResultsList({ results, ranked = false }: SearchResultsListProps) {
  const verified = results.filter((r) => resolveProvenance(r) === 'verified').length;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 id="results-heading" className="font-display text-[22px] font-semibold tracking-tight">
          {results.length} {results.length === 1 ? 'place' : 'places'}
          {ranked ? ' ranked for your needs' : ''}
        </h2>
        {verified > 0 && (
          <p className="text-[14px] text-[var(--faint)]">{verified} traveler-verified</p>
        )}
      </div>
      <ul className="grid list-none gap-6 p-0">
        {results.map((listing) => (
          <li key={listing.id}>
            <ListingCard listing={listing} ranked={ranked} />
          </li>
        ))}
      </ul>
    </>
  );
}
