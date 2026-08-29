import type { Listing } from './types';

export function formatAttributionDate(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function listingAttribution(listing: Listing): string | null {
  const when = formatAttributionDate(listing.verifiedAt || listing.contributedAt);
  if (listing.verified && listing.verifiedBy) {
    return when ? `Verified by ${listing.verifiedBy} · ${when}` : `Verified by ${listing.verifiedBy}`;
  }
  if (listing.contributorName) {
    return when ? `Reported by ${listing.contributorName} · ${when}` : `Reported by ${listing.contributorName}`;
  }
  return null;
}
