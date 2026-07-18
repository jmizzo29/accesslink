import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github, Download, Search, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppNav } from '../components/AppNav';
import { ACCESSIBILITY_FILTERS, CONTRIBUTE_CATEGORIES } from '../lib/listings/filters';
import type { AccessibilityFilterKey, Listing, ListingCategory } from '../lib/listings/types';
import {
  addCommunityContribution,
  buildGithubIssueUrl,
  downloadContributionJson,
} from '../lib/listings/communityCatalog';
import { verifyListingOnMonad } from '../lib/monad/client';

export function ContributePage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<ListingCategory>('hotel');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [summary, setSummary] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [features, setFeatures] = useState<Partial<Record<AccessibilityFilterKey, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState<Listing | null>(null);

  function toggleFeature(key: AccessibilityFilterKey, checked: boolean) {
    setFeatures((prev) => {
      const next = { ...prev };
      if (checked) next[key] = true;
      else delete next[key];
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 3) {
      toast.error('Add a place name (at least 3 characters).');
      return;
    }
    if (location.trim().length < 3) {
      toast.error('Add a city or location so others can find it.');
      return;
    }
    if (summary.trim().length < 20) {
      toast.error('Describe accessibility in at least 20 characters — help the next traveler.');
      return;
    }

    setSubmitting(true);
    try {
      const listing = addCommunityContribution({
        name,
        location,
        address: address || undefined,
        category,
        summary,
        contributorName: contributorName || undefined,
        photoUrl: photoUrl || undefined,
        accessibility: features,
      });

      const featureKeys = Object.entries(features)
        .filter(([, v]) => v)
        .map(([k]) => k);
      void verifyListingOnMonad({
        propertyId: listing.id,
        propertyName: listing.name,
        location: listing.location,
        features: featureKeys,
      }).catch(() => undefined);

      setSaved(listing);
      toast.success('Added to the community catalog — searchable now on this device.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save contribution');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <AppNav variant="app" />

      <div className="mx-auto max-w-[720px] px-4 py-12 sm:px-8 sm:py-16">
        <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-[#6e6e73]">
          Community · like open source
        </p>
        <h1 className="mt-3 font-display text-[36px] font-semibold tracking-tight sm:text-[44px]">
          Contribute a place
        </h1>
        <p className="mt-4 text-[18px] leading-relaxed text-[#6e6e73]">
          Add a hotel, Airbnb, or wheelchair van (WAV) you verified. Others search the shared catalog —
          same idea as GitHub: you contribute, the community benefits.
        </p>

        {saved ? (
          <div className="mt-10 rounded-2xl border border-emerald-200 bg-white p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" aria-hidden />
              <div>
                <h2 className="text-[22px] font-semibold tracking-tight">{saved.name} is in the catalog</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-[#6e6e73]">
                  Searchable on this browser immediately. To share with everyone worldwide, open a GitHub
                  contribution issue (or download JSON and open a PR) — we merge into the public community
                  catalog.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => navigate(`/search?location=${encodeURIComponent(saved.location)}`)}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#0f4c5c] px-6 text-[15px] font-semibold text-white hover:bg-[#0a3540]"
              >
                <Search className="h-4 w-4" aria-hidden />
                Search for it
              </button>
              <a
                href={buildGithubIssueUrl(saved)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#d2d2d7] bg-white px-6 text-[15px] font-semibold hover:bg-[#f5f5f7]"
              >
                <Github className="h-4 w-4" aria-hidden />
                Publish on GitHub
              </a>
              <button
                type="button"
                onClick={() => downloadContributionJson(saved)}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#d2d2d7] bg-white px-6 text-[15px] font-semibold hover:bg-[#f5f5f7]"
              >
                <Download className="h-4 w-4" aria-hidden />
                Download JSON
              </button>
              <Link
                to={`/property/${saved.id}`}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full px-4 text-[15px] font-medium text-[#0f4c5c] underline-offset-4 hover:underline"
              >
                View listing
              </Link>
            </div>
            <button
              type="button"
              className="mt-6 text-[14px] font-medium text-[#6e6e73] hover:text-[#1d1d1f]"
              onClick={() => {
                setSaved(null);
                setName('');
                setSummary('');
                setFeatures({});
              }}
            >
              Contribute another place
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-2xl border border-[#d2d2d7] bg-white p-6 sm:p-8">
            <fieldset>
              <legend className="text-[13px] font-medium text-[#6e6e73]">What are you adding?</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {CONTRIBUTE_CATEGORIES.map((c) => (
                  <label
                    key={c.value}
                    className={[
                      'flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl border px-3 text-center text-[14px] font-medium',
                      category === c.value
                        ? 'border-[#0f4c5c] bg-[#0f4c5c]/8 text-[#0f4c5c]'
                        : 'border-[#d2d2d7] bg-[#f5f5f7] text-[#1d1d1f]',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={c.value}
                      checked={category === c.value}
                      onChange={() => setCategory(c.value)}
                      className="sr-only"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="place-name" className="block text-[13px] font-medium text-[#6e6e73]">
                Place or service name
              </label>
              <input
                id="place-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={
                  category === 'wav' ? 'City Accessible Vans' : 'Harborview Accessible Hotel'
                }
                className="mt-2 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-[17px] focus:border-[#0f4c5c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
              />
            </div>

            <div>
              <label htmlFor="place-location" className="block text-[13px] font-medium text-[#6e6e73]">
                City / location
              </label>
              <input
                id="place-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="New York, NY"
                className="mt-2 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-[17px] focus:border-[#0f4c5c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
              />
            </div>

            <div>
              <label htmlFor="place-address" className="block text-[13px] font-medium text-[#6e6e73]">
                Address (optional)
              </label>
              <input
                id="place-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address if you have it"
                className="mt-2 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-[17px] focus:border-[#0f4c5c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
              />
            </div>

            <div>
              <label htmlFor="place-summary" className="block text-[13px] font-medium text-[#6e6e73]">
                What worked for accessibility?
              </label>
              <textarea
                id="place-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
                rows={4}
                placeholder="Roll-in shower in room 412, zero-step lobby, staff helped with WAV pickup at curb…"
                className="mt-2 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-[17px] focus:border-[#0f4c5c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
              />
            </div>

            <fieldset>
              <legend className="text-[13px] font-medium text-[#6e6e73]">Features you verified</legend>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {ACCESSIBILITY_FILTERS.map((f) => (
                  <li key={f.key}>
                    <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-3 py-3">
                      <input
                        type="checkbox"
                        checked={Boolean(features[f.key])}
                        onChange={(e) => toggleFeature(f.key, e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-[#d2d2d7] text-[#0f4c5c] focus:ring-[#0f4c5c]"
                      />
                      <span>
                        <span className="block text-[14px] font-medium">{f.label}</span>
                        <span className="block text-[12px] text-[#86868b]">{f.description}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>

            <div>
              <label htmlFor="photo-url" className="block text-[13px] font-medium text-[#6e6e73]">
                Photo URL you own (optional)
              </label>
              <input
                id="photo-url"
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://… — only links to photos you have rights to"
                className="mt-2 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-[17px] focus:border-[#0f4c5c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
              />
              <p className="mt-2 text-[13px] text-[#86868b]">
                No stock photo uploads. Link your own image, or leave blank.
              </p>
            </div>

            <div>
              <label htmlFor="contributor" className="block text-[13px] font-medium text-[#6e6e73]">
                Your name or handle (optional)
              </label>
              <input
                id="contributor"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                placeholder="Alex"
                className="mt-2 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-[17px] focus:border-[#0f4c5c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#0f4c5c] px-8 text-[17px] font-semibold text-white hover:bg-[#0a3540] disabled:opacity-60 sm:w-auto"
            >
              {submitting ? 'Saving…' : 'Add to community catalog'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
