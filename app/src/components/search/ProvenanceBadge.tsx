import { formatAttributionDate } from '../../lib/listings/attribution';
import { resolveProvenance, provenanceShortLabel } from '../../lib/listings/provenance';
import type { Listing } from '../../lib/listings/types';

type ProvenanceBadgeProps = {
  listing: Listing;
};

export function ProvenanceBadge({ listing }: ProvenanceBadgeProps) {
  const kind = resolveProvenance(listing);
  const isOpenData = kind === 'open-data';
  const isVerified = kind === 'verified';
  const when = formatAttributionDate(listing.verifiedAt);
  const verifiedLabel =
    listing.verifiedBy && when
      ? `Verified · ${listing.verifiedBy} · ${when}`
      : listing.verifiedBy
        ? `Verified · ${listing.verifiedBy}`
        : 'Verified';

  return (
    <span
      className={[
        'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        isOpenData
          ? 'bg-sky-50 text-sky-900'
          : isVerified
            ? 'bg-[var(--teal-soft)] text-[var(--teal)]'
            : 'bg-[var(--sand)] text-[var(--ink)]',
      ].join(' ')}
      title={
        isOpenData
          ? 'Place tagged on OpenStreetMap / Wheelmap'
          : isVerified
            ? listing.verifiedBy
              ? `Verified by ${listing.verifiedBy}${when ? ` on ${when}` : ''}`
              : 'Features confirmed by travelers'
            : 'Community-reported accessibility details — confirm before you book'
      }
    >
      {isVerified ? verifiedLabel : provenanceShortLabel(kind)}
    </span>
  );
}
