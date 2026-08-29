import type { Listing } from './types';

export type ProvenanceKind = NonNullable<Listing['provenance']>;

export function resolveProvenance(listing: Listing): ProvenanceKind {
  if (listing.provenance === 'curated-demo') return 'verified';
  if (listing.provenance) return listing.provenance;
  if (listing.id.startsWith('osm-') || listing.id.startsWith('wm-')) return 'open-data';
  if (listing.verified) return 'verified';
  return 'community';
}

export function provenanceLabel(kind: ProvenanceKind): string {
  switch (kind) {
    case 'open-data':
      return 'Tagged on open maps';
    case 'curated-demo':
    case 'verified':
      return 'Verified by travelers';
    case 'community':
    default:
      return 'Community report';
  }
}

export function provenanceShortLabel(kind: ProvenanceKind): string {
  switch (kind) {
    case 'open-data':
      return 'Open maps';
    case 'curated-demo':
    case 'verified':
      return 'Verified';
    case 'community':
    default:
      return 'Community';
  }
}
