import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import { AppNav } from '../components/AppNav';
import { AccessibilityChecklist } from '../components/property/AccessibilityChecklist';
import { AccessibilityReportForm } from '../components/property/AccessibilityReportForm';
import { PropertyMap } from '../components/property/PropertyMap';
import { PropertyPhotoGallery } from '../components/property/PropertyPhotoGallery';
import { ProvenanceBadge } from '../components/search/ProvenanceBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getListingById } from '../lib/listings/repository';
import { categoryLabel } from '../lib/listings/filters';
import { VerificationHistory } from '../components/monad/VerificationHistory';
import { OnChainBadge } from '../components/monad/OnChainBadge';
import { AnchorVerifyButton } from '../components/monad/AnchorVerifyButton';
import { fetchMonadStatus } from '../lib/monad/client';
import { monadExplorerTxUrl, shortenHash } from '../lib/monad/explorer';
import { wheelchairRatingLabel } from '../lib/accessibility-cloud/mappers';
import { provenanceLabel, resolveProvenance } from '../lib/listings/provenance';
import type { Listing } from '../lib/listings/types';
import type { MonadChainStatus } from '../lib/monad/types';

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [monadStatus, setMonadStatus] = useState<MonadChainStatus | null>(null);

  useEffect(() => {
    fetchMonadStatus().then(setMonadStatus);
  }, []);

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
      <div className="min-h-screen bg-[#f5f5f7]">
        <AppNav variant="app" />
        <div className="flex justify-center py-24">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="min-h-screen bg-[#f5f5f7]">
        <AppNav variant="app" />
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="text-[32px] font-semibold text-[#1d1d1f]">Property not found</h1>
          <Link
            to="/search"
            className="mt-8 inline-flex min-h-[48px] items-center rounded-full bg-[#0f4c5c] px-8 text-[17px] font-medium text-white"
          >
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
      <AppNav variant="app" />

      <div className="mx-auto max-w-[1080px] px-6 py-8 sm:px-8 sm:py-12">
        <Link
          to="/search"
          className="inline-flex min-h-[44px] items-center gap-2 text-[15px] font-medium text-[#0f4c5c] hover:text-[#0a3540]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to search
        </Link>

        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#86868b]">
              {categoryLabel(listing.category)}
            </p>
            <ProvenanceBadge listing={listing} />
            {listing.verified && (
              <OnChainBadge compact onChain={listing.verifiedOnChain} />
            )}
          </div>
          <p className="mt-2 text-[13px] text-[#6e6e73]">
            {provenanceLabel(resolveProvenance(listing))}
          </p>
          {listing.wheelchairRating && (
            <p className="mt-2 text-[15px] font-medium text-[#0f4c5c]">
              {wheelchairRatingLabel(listing.wheelchairRating)}
            </p>
          )}
          <h1 className="mt-3 font-display text-[40px] font-semibold tracking-tight sm:text-[48px]">
            {listing.name}
          </h1>
          <p className="mt-4 flex items-center gap-2 text-[17px] text-[#6e6e73]">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            {listing.address || listing.location}
          </p>
          {listing.reviewCount > 0 && (
            <p className="mt-2 flex items-center gap-1 text-[15px] text-[#86868b]">
              <Star className="h-4 w-4 fill-[#0f4c5c] text-[#0f4c5c]" aria-hidden />
              {listing.rating.toFixed(1)} · {listing.reviewCount} reviews
            </p>
          )}
          {listing.price > 0 && (
            <p className="mt-4 text-[28px] font-semibold tabular-nums">
              ${listing.price}
              <span className="ml-2 text-[15px] font-normal text-[#86868b]">{listing.priceLabel}</span>
            </p>
          )}
          <div className="mt-6">
            <AnchorVerifyButton listing={listing} status={monadStatus} />
          </div>
        </header>

        <div className="mt-10 space-y-16">
          <PropertyPhotoGallery photos={listing.photos} propertyName={listing.name} />

          <section>
            <h2 className="text-[28px] font-semibold tracking-tight">About this place</h2>
            <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-[#6e6e73]">
              {listing.description || listing.summary}
            </p>
          </section>

          <AccessibilityChecklist features={listing.accessibility} />

          <PropertyMap
            name={listing.name}
            address={listing.address}
            coordinates={listing.coordinates}
          />

          {listing.monadTxHash && (
            <section className="rounded-2xl border border-[#d2d2d7] bg-white p-6 sm:p-8">
              <h2 className="text-[24px] font-semibold tracking-tight">Monad verification</h2>
              <p className="mt-3 text-[15px] text-[#6e6e73]">
                This listing has a community-verified accessibility record
                {listing.monadVerifiedAt
                  ? ` from ${new Date(listing.monadVerifiedAt).toLocaleDateString()}`
                  : ''}
                .
              </p>
              <a
                href={monadExplorerTxUrl('https://testnet.monadvision.com', listing.monadTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 font-mono text-[14px] text-[#0f4c5c] hover:underline"
              >
                {shortenHash(listing.monadTxHash)}
              </a>
            </section>
          )}

          <VerificationHistory propertyId={listing.id} propertyName={listing.name} />

          <AccessibilityReportForm listing={listing} />
        </div>

        <p className="mt-12 text-center text-[12px] text-[#86868b]">
          Beta — always confirm accessibility with the property before booking.
        </p>
      </div>
    </div>
  );
}
