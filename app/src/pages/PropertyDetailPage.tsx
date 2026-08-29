import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { AccessibilityChecklist } from '../components/property/AccessibilityChecklist';
import { AccessibilityReportForm } from '../components/property/AccessibilityReportForm';
import { PropertyMap } from '../components/property/PropertyMap';
import { PropertyPhotoGallery } from '../components/property/PropertyPhotoGallery';
import { ProvenanceBadge } from '../components/search/ProvenanceBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getListingById } from '../lib/listings/repository';
import { categoryLabel } from '../lib/listings/filters';
import { listingPhotos } from '../lib/listings/photos';
import { wheelchairRatingLabel } from '../lib/accessibility-cloud/mappers';
import { provenanceLabel, resolveProvenance } from '../lib/listings/provenance';
import { listingAttribution } from '../lib/listings/attribution';
import type { Listing } from '../lib/listings/types';

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getListingById(id)
      .then(({ listing: result }) => {
        if (cancelled) return;
        if (!result) {
          setNotFound(true);
          setListing(null);
        } else {
          setListing(result);
          setNotFound(false);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <PageShell>
        <div className="flex justify-center py-24">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  if (notFound || !listing) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="font-display text-[32px] font-semibold">We could not find that place</h1>
          <Link
            to="/search"
            className="mt-8 inline-flex min-h-[48px] items-center rounded-full bg-[var(--teal)] px-8 text-[17px] font-medium text-white"
          >
            Back to search
          </Link>
        </div>
      </PageShell>
    );
  }

  const photos = listingPhotos(listing);

  return (
    <PageShell>
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-8 sm:py-12">
        <Link
          to="/search"
          className="inline-flex min-h-[44px] items-center gap-2 text-[15px] font-medium text-[var(--teal)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to search
        </Link>

        <div className="mt-6 overflow-hidden rounded-[2rem] bg-[var(--sand)]">
          <PropertyPhotoGallery photos={photos} propertyName={listing.name} />
        </div>

        <header className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--faint)]">
                {categoryLabel(listing.category)}
              </p>
              <ProvenanceBadge listing={listing} />
            </div>
            <h1 className="mt-3 font-display text-[40px] font-semibold tracking-tight sm:text-[52px]">
              {listing.name}
            </h1>
            <p className="mt-4 flex items-center gap-2 text-[18px] text-[var(--muted)]">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              {listing.address || listing.location}
            </p>
            {listingAttribution(listing) && (
              <p className="mt-3 text-[16px] font-medium text-[var(--ink)]">{listingAttribution(listing)}</p>
            )}
            {listing.reviewCount > 0 && (
              <p className="mt-2 flex items-center gap-1 text-[15px] text-[var(--faint)]">
                <Star className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" aria-hidden />
                {listing.rating.toFixed(1)} · {listing.reviewCount} traveler notes
              </p>
            )}
            {listing.wheelchairRating && (
              <p className="mt-3 text-[15px] font-medium text-[var(--teal)]">
                {wheelchairRatingLabel(listing.wheelchairRating)}
              </p>
            )}
          </div>
          <aside className="rounded-3xl border border-[var(--sand)] bg-[var(--paper)] p-6">
            {listing.price > 0 ? (
              <p className="font-display text-[36px] font-semibold tabular-nums">
                ${listing.price}
                <span className="ml-2 font-sans text-[15px] font-normal text-[var(--faint)]">
                  {listing.priceLabel}
                </span>
              </p>
            ) : (
              <p className="text-[18px] font-semibold">{listing.priceLabel}</p>
            )}
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
              {provenanceLabel(resolveProvenance(listing))}. Always confirm details with the place
              before you book.
            </p>
            <Link
              to="/contribute"
              className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[var(--teal)] px-5 text-[15px] font-semibold text-white hover:bg-[var(--teal-deep)]"
            >
              Add what you found here
            </Link>
          </aside>
        </header>

        <div className="mt-14 space-y-16">
          <section>
            <h2 className="font-display text-[28px] font-semibold tracking-tight">The stay</h2>
            <p className="mt-4 max-w-3xl text-[18px] leading-relaxed text-[var(--muted)]">
              {listing.description || listing.summary}
            </p>
          </section>

          <AccessibilityChecklist features={listing.accessibility} />

          <PropertyMap
            name={listing.name}
            address={listing.address}
            coordinates={listing.coordinates}
          />

          <AccessibilityReportForm listing={listing} />
        </div>
      </div>
    </PageShell>
  );
}
