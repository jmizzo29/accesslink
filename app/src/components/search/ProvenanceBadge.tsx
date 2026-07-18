import { resolveProvenance, provenanceShortLabel } from '../../lib/listings/provenance';
import type { Listing } from '../../lib/listings/types';

type ProvenanceBadgeProps = {
  listing: Listing;
};

export function ProvenanceBadge({ listing }: ProvenanceBadgeProps) {
  const kind = resolveProvenance(listing);
  const isOpenData = kind === 'open-data';
  const isDemo = kind === 'curated-demo';

  return (
    <span
      className={[
        'rounded-full px-2 py-0.5 text-[11px] font-medium',
        isOpenData
          ? 'bg-sky-50 text-sky-800'
          : isDemo
            ? 'bg-amber-50 text-amber-900'
            : 'bg-[#0f4c5c]/8 text-[#0f4c5c]',
      ].join(' ')}
      title={
        isOpenData
          ? 'Live place from OpenStreetMap / Wheelmap wheelchair tags'
          : isDemo
            ? 'Curated demo stay for the judge path — not a live marketplace booking'
            : 'Community-reported accessibility details'
      }
    >
      {provenanceShortLabel(kind)}
    </span>
  );
}
