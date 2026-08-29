import type { Listing, ListingPhoto } from './types';

const CATEGORY_PHOTO: Record<Listing['category'], string> = {
  hotel: '/photos/photo-hotel-room.png',
  airbnb: '/photos/photo-stay.png',
  airport: '/photos/photo-airport.png',
  wav: '/photos/photo-van.png',
};

const LISTING_PHOTO: Record<string, string> = {
  'prop-001': '/photos/photo-hotel-room.png',
  'prop-004': '/photos/photo-resort.png',
  'prop-005': '/photos/photo-resort.png',
  'prop-008': '/photos/photo-hotel-room.png',
  'prop-012': '/photos/photo-hotel-room.png',
  'community-hotel-chi': '/photos/photo-hotel-room.png',
  'community-hotel-aus': '/photos/photo-hotel-room.png',
  'prop-002': '/photos/photo-stay.png',
  'prop-006': '/photos/photo-stay.png',
  'prop-009': '/photos/photo-stay.png',
  'prop-013': '/photos/photo-stay.png',
  'prop-015': '/photos/photo-stay.png',
  'community-stay-mia': '/photos/photo-stay.png',
  'community-stay-pdx': '/photos/photo-stay.png',
  'prop-003': '/photos/photo-airport.png',
  'prop-007': '/photos/photo-airport.png',
  'prop-011': '/photos/photo-airport.png',
  'prop-014': '/photos/photo-airport.png',
  'prop-010': '/photos/photo-van.png',
  'prop-016': '/photos/photo-van.png',
  'community-wav-nyc': '/photos/photo-van.png',
  'community-wav-orl': '/photos/photo-van.png',
};

export const HERO_PHOTO = '/photos/hero-hotel-entrance.png';

export function listingPhotoUrl(listing: Pick<Listing, 'id' | 'category' | 'photos'>): string {
  const owned = listing.photos?.find((p) => p.url);
  if (owned?.url) return owned.url;
  return LISTING_PHOTO[listing.id] || CATEGORY_PHOTO[listing.category] || CATEGORY_PHOTO.hotel;
}

export function listingPhotos(listing: Listing): ListingPhoto[] {
  const owned = listing.photos?.filter((p) => p.url) ?? [];
  if (owned.length) return owned;
  return [
    {
      url: listingPhotoUrl(listing),
      alt: `${listing.name} in ${listing.city || listing.location}`,
    },
  ];
}

export function withListingPhoto<T extends Listing>(listing: T): T {
  return {
    ...listing,
    photos: listingPhotos(listing),
  };
}
