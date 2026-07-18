import { Search } from 'lucide-react';

type SearchEmptyStateProps = {
  searched: boolean;
  hasFilters: boolean;
};

export function SearchEmptyState({ searched, hasFilters }: SearchEmptyStateProps) {
  let title = 'Search accessible places';
  let body =
    'Enter a location like New York, NY or Orlando, FL. Add accessibility filters to narrow results.';

  if (searched) {
    title = 'No matching listings';
    body = hasFilters
      ? 'No listings match your location and selected accessibility filters. Try fewer filters or a broader location.'
      : 'No listings found for that location. Try a nearby city or check your spelling.';
  }

  return (
    <div className="rounded-2xl border border-dashed border-[#d2d2d7] bg-white px-8 py-20 text-center">
      <Search className="mx-auto h-8 w-8 text-[#86868b]" strokeWidth={1.5} aria-hidden />
      <h3 className="mt-6 text-[21px] font-semibold tracking-tight text-[#1d1d1f]">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-[17px] leading-relaxed text-[#6e6e73]">{body}</p>
    </div>
  );
}
