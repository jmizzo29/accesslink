import type { ListingCoordinates } from '../../lib/listings/types';

type PropertyMapProps = {
  name: string;
  address: string;
  coordinates: ListingCoordinates;
};

function hasValidCoords(coords: ListingCoordinates): boolean {
  return coords.lat !== 0 && coords.lng !== 0 && Number.isFinite(coords.lat) && Number.isFinite(coords.lng);
}

export function PropertyMap({ name, address, coordinates }: PropertyMapProps) {
  const query = encodeURIComponent(address || name);
  const googleUrl = hasValidCoords(coordinates)
    ? `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${query}`;
  const mapboxUrl = `https://api.mapbox.com/search/v1/forward/${query}.html`;

  if (!hasValidCoords(coordinates)) {
    return (
      <section aria-labelledby="map-heading" className="rounded-2xl border border-[#d2d2d7] bg-white p-8">
        <h2 id="map-heading" className="text-[21px] font-semibold text-[#1d1d1f]">
          Location
        </h2>
        <p className="mt-3 text-[15px] text-[#6e6e73]">{address}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center rounded-full border border-[#d2d2d7] px-5 text-[14px] font-medium text-[#1d1d1f] transition-colors hover:border-[#86868b]"
          >
            Open in Google Maps
          </a>
          <a
            href={mapboxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center rounded-full border border-[#d2d2d7] px-5 text-[14px] font-medium text-[#1d1d1f] transition-colors hover:border-[#86868b]"
          >
            Open in Mapbox
          </a>
        </div>
      </section>
    );
  }

  const { lat, lng } = coordinates;
  const delta = 0.02;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(',');
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <section aria-labelledby="map-heading">
      <h2 id="map-heading" className="text-[21px] font-semibold text-[#1d1d1f]">
        Map
      </h2>
      <p className="mt-2 text-[15px] text-[#6e6e73]">{address}</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#d2d2d7]">
        <iframe
          title={`Map of ${name}`}
          src={embedUrl}
          className="h-[320px] w-full border-0 sm:h-[400px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center rounded-full border border-[#d2d2d7] px-5 text-[14px] font-medium text-[#1d1d1f] transition-colors hover:border-[#86868b]"
        >
          Google Maps
        </a>
        <a
          href={mapboxUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center rounded-full border border-[#d2d2d7] px-5 text-[14px] font-medium text-[#1d1d1f] transition-colors hover:border-[#86868b]"
        >
          Mapbox
        </a>
      </div>
      <p className="mt-3 text-[12px] text-[#86868b]">
        Map preview uses OpenStreetMap. Production can swap to Mapbox GL or Google Maps with your API key.
      </p>
    </section>
  );
}
