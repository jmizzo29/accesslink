import { resolveProvenance, provenanceShortLabel } from '../../lib/listings/provenance';
import type { Listing } from '../../lib/listings/types';

type ProvenanceBadgeProps = {
  listing: Listing;
};

export function ProvenanceBadge({ listing }: ProvenanceBadgeProps) {
  const kind = resolveProvenance(listing);
  const isOpenData = kind === 'open-data';
  const isVerified = kind === 'verified' || kind === 'curated-demo';

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
            ? 'Features confirmed by travelers or our team'
            : 'Community-reported accessibility details — confirm before you book'
      }
    >
      {provenanceShortLabel(kind)}
    </span>
  );
}
