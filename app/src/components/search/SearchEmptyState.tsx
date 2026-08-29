import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const SUGGESTIONS = [
  { label: 'New York', to: '/search?location=New%20York%2C%20NY' },
  { label: 'Miami', to: '/search?location=Miami%2C%20FL' },
  { label: 'Orlando', to: '/search?location=Orlando%2C%20FL' },
  { label: 'Chicago', to: '/search?location=Chicago%2C%20IL' },
] as const;

type SearchEmptyStateProps = {
  searched: boolean;
  hasFilters: boolean;
};

export function SearchEmptyState({ searched, hasFilters }: SearchEmptyStateProps) {
  const title = searched ? 'Nothing matched that trip' : 'Where are you going?';
  const body = searched
    ? hasFilters
      ? 'No stays match that city and those features. Try fewer filters, or start with a nearby city.'
      : 'We do not have a stay in that city yet. Try a nearby city, or share a place you already trust.'
    : 'Search a city, then filter by roll-in shower, elevator, wide doorways, and the rest of the eight features.';

  return (
    <div className="rounded-3xl border border-[var(--sand)] bg-[var(--paper)] px-6 py-16 text-center sm:px-10">
      <MapPin className="mx-auto h-8 w-8 text-[var(--teal)]" strokeWidth={1.5} aria-hidden />
      <h3 className="mt-5 font-display text-[26px] font-semibold tracking-tight">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-[17px] leading-relaxed text-[var(--muted)]">{body}</p>
      <ul className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {SUGGESTIONS.map((city) => (
          <li key={city.to}>
            <Link
              to={city.to}
              className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--sand)] bg-[var(--cream)] px-5 text-[15px] font-medium hover:border-[var(--teal)]"
            >
              {city.label}
            </Link>
          </li>
        ))}
      </ul>
      {searched && (
        <Link
          to="/contribute"
          className="mt-6 inline-flex min-h-[48px] items-center text-[15px] font-semibold text-[var(--teal)] hover:underline"
        >
          Share a place you trust
        </Link>
      )}
    </div>
  );
}
