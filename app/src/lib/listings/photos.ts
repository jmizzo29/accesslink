import type { Listing, ListingPhoto } from './types';

const CATEGORY_PHOTO: Record<Listing['category'], string> = {
  hotel: '/photos/photo-hotel-room.jpg',
  airbnb: '/photos/photo-stay.jpg',
  airport: '/photos/photo-airport.jpg',
  wav: '/photos/photo-van.jpg',
};

const LISTING_PHOTO: Record<string, string> = {
  'prop-001': '/photos/photo-hotel-room.jpg',
  'prop-004': '/photos/photo-resort.jpg',
  'prop-005': '/photos/photo-resort.jpg',
  'prop-008': '/photos/photo-hotel-room.jpg',
  'prop-012': '/photos/photo-hotel-room.jpg',
  'community-hotel-chi': '/photos/photo-hotel-room.jpg',
  'community-hotel-aus': '/photos/photo-hotel-room.jpg',
  'prop-002': '/photos/photo-stay.jpg',
  'prop-006': '/photos/photo-stay.jpg',
  'prop-009': '/photos/photo-stay.jpg',
  'prop-013': '/photos/photo-stay.jpg',
  'prop-015': '/photos/photo-stay.jpg',
  'community-stay-mia': '/photos/photo-stay.jpg',
  'community-stay-pdx': '/photos/photo-stay.jpg',
  'prop-003': '/photos/photo-airport.jpg',
  'prop-007': '/photos/photo-airport.jpg',
  'prop-011': '/photos/photo-airport.jpg',
  'prop-014': '/photos/photo-airport.jpg',
  'prop-010': '/photos/photo-van.jpg',
  'prop-016': '/photos/photo-van.jpg',
  'community-wav-nyc': '/photos/photo-van.jpg',
  'community-wav-orl': '/photos/photo-van.jpg',
};

export const HERO_PHOTO = '/accesslink-hero.webp';

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
