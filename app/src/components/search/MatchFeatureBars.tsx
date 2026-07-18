import { ACCESSIBILITY_FILTERS } from '../../lib/listings/filters';
import type { Listing } from '../../lib/listings/types';

type MatchFeatureBarsProps = {
  listing: Listing;
  featureKeys?: string[];
};

export function MatchFeatureBars({ listing, featureKeys }: MatchFeatureBarsProps) {
  const labels = Object.fromEntries(ACCESSIBILITY_FILTERS.map((f) => [f.key, f.label])) as Record<
    string,
    string
  >;

  const matched = new Set(listing.matchMatched ?? []);
  const missing = new Set(listing.matchMissing ?? []);
  const keys =
    featureKeys?.length
      ? featureKeys
      : [...matched, ...missing].length
        ? [...matched, ...missing]
        : [];

  if (!keys.length && listing.matchPercent == null) return null;

  return (
    <div className="mt-4 space-y-3" aria-label="Accessibility match breakdown">
      {listing.matchPercent != null && (
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[13px]">
            <span className="font-medium text-[#1d1d1f]">Need fit</span>
            <span className="tabular-nums text-[#0f4c5c]">{listing.matchPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#e8e8ed]" role="presentation">
            <div
              className="h-full rounded-full bg-[#0f4c5c] transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max(0, Math.min(100, listing.matchPercent))}%` }}
            />
          </div>
        </div>
      )}
      {keys.length > 0 && (
        <ul className="space-y-2">
          {keys.map((key) => {
            const has = Boolean(listing.accessibility?.[key as keyof typeof listing.accessibility]);
            return (
              <li key={key}>
                <div className="mb-1 flex justify-between text-[12px]">
                  <span className="text-[#6e6e73]">{labels[key] ?? key}</span>
                  <span className={has ? 'text-[#0f4c5c]' : 'text-[#86868b]'}>
                    {has ? 'Match' : 'Gap'}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#e8e8ed]">
                  <div
                    className={[
                      'h-full rounded-full transition-[width] duration-500 ease-out',
                      has ? 'bg-emerald-600 w-full' : 'bg-amber-400 w-1/4',
                    ].join(' ')}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {listing.matchReasons?.[0] && (
        <p className="text-[13px] leading-relaxed text-[#6e6e73]">{listing.matchReasons[0]}</p>
      )}
    </div>
  );
}
