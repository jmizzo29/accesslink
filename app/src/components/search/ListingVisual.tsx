import { Building2, Car, Home, Plane } from 'lucide-react';
import type { Listing } from '../../lib/listings/types';

const TILE: Record<Listing['category'], string> = {
  hotel: 'tile-hotel',
  airbnb: 'tile-airbnb',
  airport: 'tile-airport',
  wav: 'tile-wav',
};

export function ListingVisual({ listing, className = '' }: { listing: Listing; className?: string }) {
  const Icon =
    listing.category === 'airport'
      ? Plane
      : listing.category === 'wav'
        ? Car
        : listing.category === 'airbnb'
          ? Home
          : Building2;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl text-white ${TILE[listing.category]} ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #fff, transparent 45%)' }} />
      <div className="relative flex h-full min-h-[120px] flex-col justify-between p-4">
        <Icon className="h-7 w-7" strokeWidth={1.5} />
        <p className="text-[13px] font-semibold leading-tight">{listing.city}</p>
      </div>
    </div>
  );
}
