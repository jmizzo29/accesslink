import { ArrowRight, MapPin, Star } from 'lucide-react';
import type { Listing } from '../../lib/listings/types';
import { ACCESSIBILITY_FILTERS, CARD_FEATURE_KEYS, categoryLabel } from '../../lib/listings/filters';
import { FeaturePill } from './AccessibilityFilters';
import { ListingVisual } from './ListingVisual';
import { MatchFeatureBars } from './MatchFeatureBars';
import { ProvenanceBadge } from './ProvenanceBadge';
import { AnchorVerifyButton } from '../monad/AnchorVerifyButton';
import type { MonadChainStatus } from '../../lib/monad/types';

type ListingCardProps = {
  listing: Listing;
  onViewDetails: (listing: Listing) => void;
  showAnchor?: boolean;
  monadStatus?: MonadChainStatus | null;
};

export function ListingCard({
  listing,
  onViewDetails,
  showAnchor = false,
  monadStatus = null,
}: ListingCardProps) {
  const featureMap = Object.fromEntries(ACCESSIBILITY_FILTERS.map((f) => [f.key, f.label])) as Record<
    string,
    string
  >;

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--sand)] bg-[var(--paper)] shadow-sm transition-shadow hover:shadow-md">
      <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
        <ListingVisual listing={listing} className="min-h-[140px] rounded-none sm:min-h-full" />
        <div className="p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--faint)]">
                  {categoryLabel(listing.category)}
                </p>
                <ProvenanceBadge listing={listing} />
                {listing.verifiedOnChain && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                    On-chain
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-display text-[22px] font-semibold tracking-tight">{listing.name}</h3>
              <p className="mt-2 flex items-center gap-1.5 text-[15px] text-[var(--muted)]">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                {listing.location}
              </p>
              {listing.reviewCount > 0 && (
                <p className="mt-2 flex items-center gap-1 text-[13px] text-[var(--faint)]">
                  <Star className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" aria-hidden />
                  <span>
                    {listing.rating.toFixed(1)} · {listing.reviewCount} reviews
                  </span>
                </p>
              )}
            </div>
            <div className="shrink-0 text-right">
              {listing.price > 0 ? (
                <>
                  <span className="text-[28px] font-semibold tabular-nums tracking-tight">${listing.price}</span>
                  <span className="block text-[13px] text-[var(--faint)]">{listing.priceLabel}</span>
                </>
              ) : (
                <span className="text-[15px] font-medium text-[var(--muted)]">{listing.priceLabel}</span>
              )}
            </div>
          </div>

          <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)] line-clamp-2">{listing.summary}</p>
          <MatchFeatureBars listing={listing} />

          <div className="mt-5 flex flex-wrap gap-2" aria-label="Key accessibility features">
            {CARD_FEATURE_KEYS.map((key) => (
              <FeaturePill key={key} available={Boolean(listing.accessibility[key])} label={featureMap[key] ?? key} />
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onViewDetails(listing)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--sand)] px-5 text-[15px] font-medium hover:bg-[var(--cream)]"
            >
              View details
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            {showAnchor && <AnchorVerifyButton listing={listing} status={monadStatus} />}
          </div>
        </div>
      </div>
    </article>
  );
}
