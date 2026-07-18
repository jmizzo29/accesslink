import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ListingPhoto } from '../../lib/listings/types';

type PropertyPhotoGalleryProps = {
  photos: ListingPhoto[];
  propertyName: string;
};

export function PropertyPhotoGallery({ photos, propertyName }: PropertyPhotoGalleryProps) {
  const [index, setIndex] = useState(0);
  const hasPhotos = photos.length > 0;
  const safePhotos = hasPhotos ? photos : [];
  const current = hasPhotos ? safePhotos[index] : null;
  const hasMultiple = safePhotos.length > 1;

  function goPrev() {
    setIndex((i) => (i === 0 ? safePhotos.length - 1 : i - 1));
  }

  function goNext() {
    setIndex((i) => (i === safePhotos.length - 1 ? 0 : i + 1));
  }

  if (!current) {
    return (
      <section aria-label="Property photos">
        <div className="flex aspect-[16/10] w-full flex-col items-center justify-center rounded-2xl bg-[#f5f5f7] px-6 text-center">
          <p className="text-[17px] font-medium text-[#1d1d1f]">No photos yet</p>
          <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-[#6e6e73]">
            {propertyName} does not have community photos. Add one when you submit an accessibility
            report — we do not show stock stand-ins.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Property photos">
      <div className="relative overflow-hidden rounded-2xl bg-[#f5f5f7]">
        <img
          src={current.url}
          alt={current.alt}
          className="aspect-[16/10] w-full object-cover"
          width={1200}
          height={750}
        />
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1d1d1f] shadow-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f4c5c]"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1d1d1f] shadow-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f4c5c]"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <p className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-[13px] font-medium text-white">
              {index + 1} / {safePhotos.length}
            </p>
          </>
        )}
      </div>

      {hasMultiple && (
        <ul className="mt-4 grid list-none grid-cols-4 gap-2 p-0 sm:grid-cols-5">
          {safePhotos.map((photo, i) => (
            <li key={photo.url}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                className={[
                  'block w-full overflow-hidden rounded-lg border-2 transition-colors',
                  i === index ? 'border-[#0f4c5c]' : 'border-transparent opacity-80 hover:opacity-100',
                ].join(' ')}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
              >
                <img
                  src={photo.url}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
