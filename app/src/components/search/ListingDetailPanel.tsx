import { useEffect, useRef } from 'react';
import { Check, MapPin, Star, X } from 'lucide-react';
import type { Listing } from '../../lib/listings/types';
import { ACCESSIBILITY_FILTERS, categoryLabel } from '../../lib/listings/filters';

type ListingDetailPanelProps = {
  listing: Listing | null;
  onClose: () => void;
};

export function ListingDetailPanel({ listing, onClose }: ListingDetailPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!listing) return undefined;

    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [listing, onClose]);

  if (!listing) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close details"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-detail-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-[#d2d2d7] bg-white p-6 shadow-xl sm:rounded-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#86868b]">
              {categoryLabel(listing.category)}
            </p>
            <h2
              id="listing-detail-title"
              className="mt-2 text-[28px] font-semibold tracking-tight text-[#1d1d1f]"
            >
              {listing.name}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d2d2d7] text-[#6e6e73] transition-colors hover:bg-[#f5f5f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f4c5c]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-[15px] text-[#6e6e73]">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          {listing.location}
        </p>

        {listing.reviewCount > 0 && (
          <p className="mt-2 flex items-center gap-1 text-[14px] text-[#86868b]">
            <Star className="h-4 w-4 fill-[#0f4c5c] text-[#0f4c5c]" aria-hidden />
            {listing.rating.toFixed(1)} · {listing.reviewCount} community reviews
          </p>
        )}

        <p className="mt-6 text-[17px] leading-relaxed text-[#6e6e73]">{listing.summary}</p>

        <div className="mt-6 flex items-baseline gap-2">
          {listing.price > 0 ? (
            <>
              <span className="text-[32px] font-semibold tabular-nums text-[#1d1d1f]">
                ${listing.price}
              </span>
              <span className="text-[15px] text-[#86868b]">{listing.priceLabel}</span>
            </>
          ) : (
            <span className="text-[17px] font-medium text-[#6e6e73]">{listing.priceLabel}</span>
          )}
        </div>

        <section className="mt-8" aria-labelledby="detail-features-heading">
          <h3
            id="detail-features-heading"
            className="text-[13px] font-medium uppercase tracking-[0.08em] text-[#86868b]"
          >
            Accessibility features
          </h3>
          <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2">
            {ACCESSIBILITY_FILTERS.map(({ key, label }) => {
              const has = listing.accessibility[key];
              return (
                <li
                  key={key}
                  className={[
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-[14px]',
                    has ? 'text-[#0f4c5c]' : 'text-[#86868b]',
                  ].join(' ')}
                >
                  {has ? (
                    <Check className="h-4 w-4 shrink-0" aria-hidden />
                  ) : (
                    <X className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                  <span>{label}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <p className="mt-8 text-[13px] leading-relaxed text-[#86868b]">
          Beta — details are community-reported. Always confirm accessibility with the property before booking.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full min-h-[48px] rounded-full bg-[#0f4c5c] text-[17px] font-medium text-white transition-colors hover:bg-[#0a3540] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0f4c5c]"
        >
          Done
        </button>
      </div>
    </div>
  );
}
