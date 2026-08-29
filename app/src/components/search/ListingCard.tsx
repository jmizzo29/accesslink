import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import type { Listing } from '../../lib/listings/types';
import { ACCESSIBILITY_FILTERS, CARD_FEATURE_KEYS, categoryLabel } from '../../lib/listings/filters';
import { listingPhotoUrl } from '../../lib/listings/photos';
import { listingAttribution } from '../../lib/listings/attribution';
import { MatchFeatureBars } from './MatchFeatureBars';
import { ProvenanceBadge } from './ProvenanceBadge';

type ListingCardProps = {
  listing: Listing;
  onViewDetails?: (listing: Listing) => void;
  ranked?: boolean;
  variant?: 'row' | 'cover';
};

export function ListingCard({ listing, onViewDetails, ranked = false, variant = 'row' }: ListingCardProps) {
  const featureMap = Object.fromEntries(ACCESSIBILITY_FILTERS.map((f) => [f.key, f.label])) as Record<
    string,
    string
  >;
  const photo = listingPhotoUrl(listing);
  const href = `/property/${listing.id}`;

  function open() {
    if (onViewDetails) onViewDetails(listing);
  }

  const media = (
    <img
      src={photo}
      alt=""
      className={
        variant === 'cover'
          ? 'h-52 w-full object-cover sm:h-56'
          : 'h-44 w-full object-cover sm:h-full sm:min-h-[180px]'
      }
    />
  );

  const body = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--faint)]">
          {categoryLabel(listing.category)}
        </p>
        <ProvenanceBadge listing={listing} />
      </div>
      <h3 className="mt-2 font-display text-[22px] font-semibold leading-tight tracking-tight">{listing.name}</h3>
      <p className="mt-2 flex items-center gap-1.5 text-[15px] text-[var(--muted)]">
        <MapPin className="h-4 w-4 shrink-0" aria-hidden />
        {listing.city || listing.location}
      </p>
      {listingAttribution(listing) && (
        <p className="mt-2 text-[14px] font-medium text-[var(--ink)]">{listingAttribution(listing)}</p>
      )}
      {listing.reviewCount > 0 && (
        <p className="mt-2 flex items-center gap-1 text-[14px] text-[var(--faint)]">
          <Star className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" aria-hidden />
          {listing.rating.toFixed(1)} · {listing.reviewCount} reviews
        </p>
      )}
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)] line-clamp-2">{listing.summary}</p>
      {ranked && <MatchFeatureBars listing={listing} />}
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Key accessibility features">
        {CARD_FEATURE_KEYS.filter((key) => listing.accessibility[key]).map((key) => (
          <span
            key={key}
            className="inline-flex items-center rounded-full bg-[var(--teal-soft)] px-3 py-1 text-[12px] font-semibold text-[var(--teal)]"
          >
            {featureMap[key] ?? key}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        {listing.price > 0 ? (
          <p className="text-[20px] font-semibold tabular-nums">
            ${listing.price}
            <span className="ml-1 text-[13px] font-normal text-[var(--faint)]">{listing.priceLabel}</span>
          </p>
        ) : (
          <p className="text-[14px] font-medium text-[var(--muted)]">{listing.priceLabel}</p>
        )}
        {onViewDetails ? (
          <button
            type="button"
            onClick={open}
            className="inline-flex min-h-[44px] items-center rounded-full bg-[var(--teal)] px-5 text-[14px] font-semibold text-white hover:bg-[var(--teal-deep)]"
          >
            View stay
          </button>
        ) : (
          <span className="inline-flex min-h-[44px] items-center text-[14px] font-semibold text-[var(--teal)]">
            View stay
          </span>
        )}
      </div>
    </>
  );

  const className =
    variant === 'cover'
      ? 'stay-card block overflow-hidden rounded-3xl border border-[var(--sand)] bg-[var(--paper)]'
      : 'stay-card block overflow-hidden rounded-3xl border border-[var(--sand)] bg-[var(--paper)]';

  if (onViewDetails) {
    return (
      <article className={className}>
        <div className={variant === 'cover' ? '' : 'grid sm:grid-cols-[240px_1fr]'}>
          <div className="overflow-hidden bg-[var(--sand)]">{media}</div>
          <div className="p-5 sm:p-6">{body}</div>
        </div>
      </article>
    );
  }

  return (
    <Link to={href} className={className}>
      <div className={variant === 'cover' ? '' : 'grid sm:grid-cols-[240px_1fr]'}>
        <div className="overflow-hidden bg-[var(--sand)]">{media}</div>
        <div className="p-5 sm:p-6">{body}</div>
      </div>
    </Link>
  );
}
