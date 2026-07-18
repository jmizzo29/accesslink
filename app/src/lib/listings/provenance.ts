import type { Listing } from './types';

export type ProvenanceKind = NonNullable<Listing['provenance']>;

export function resolveProvenance(listing: Listing): ProvenanceKind {
  if (listing.provenance) return listing.provenance;
  if (listing.id.startsWith('osm-') || listing.id.startsWith('wm-')) return 'open-data';
  if (listing.verified) return 'community';
  return 'community';
}

export function provenanceLabel(kind: ProvenanceKind): string {
  switch (kind) {
    case 'open-data':
      return 'Live OpenStreetMap / Wheelmap';
    case 'curated-demo':
      return 'Curated demo stay';
    case 'verified':
      return 'Community verified';
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
      return 'Demo stay';
    case 'verified':
      return 'Verified';
    case 'community':
    default:
      return 'Community';
  }
}
