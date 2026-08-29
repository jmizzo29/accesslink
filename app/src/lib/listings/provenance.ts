import type { Listing } from './types';

export type ProvenanceKind = NonNullable<Listing['provenance']>;

export function canonicalizeProvenance(
  raw: unknown,
  verified = false,
): ProvenanceKind {
  if (raw === 'verified' || raw === 'community' || raw === 'open-data') return raw;
  if (raw === 'curated-demo' || raw === 'demo') return 'verified';
  return verified ? 'verified' : 'community';
}

export function resolveProvenance(listing: Listing): ProvenanceKind {
  if (listing.provenance) {
    return canonicalizeProvenance(listing.provenance, listing.verified);
  }
  if (
    listing.id.startsWith('osm-') ||
    listing.id.startsWith('wm-') ||
    listing.id.startsWith('ac-cloud-')
  ) {
    return 'open-data';
  }
  return listing.verified ? 'verified' : 'community';
}

export function provenanceLabel(kind: ProvenanceKind): string {
  switch (kind) {
    case 'open-data':
      return 'Tagged on open maps';
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
    case 'verified':
      return 'Verified';
    case 'community':
    default:
      return 'Community';
  }
}
