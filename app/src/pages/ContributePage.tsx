import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { PageShell } from '../components/PageShell';
import { ACCESSIBILITY_FILTERS, CONTRIBUTE_CATEGORIES } from '../lib/listings/filters';
import type { AccessibilityFilterKey, Listing, ListingCategory } from '../lib/listings/types';
import { publishCommunityContribution } from '../lib/listings/communityCatalog';

export function ContributePage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<ListingCategory>('hotel');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [summary, setSummary] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [asVerified, setAsVerified] = useState(false);
  const [features, setFeatures] = useState<Partial<Record<AccessibilityFilterKey, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState<Listing | null>(null);
  const [shared, setShared] = useState(false);

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
      toast.error('Add a city so other travelers can find it.');
      return;
    }
    if (summary.trim().length < 20) {
      toast.error('Tell the next traveler what you found — at least a couple of sentences.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await publishCommunityContribution({
        name,
        location,
        address: address || undefined,
        category,
        summary,
        contributorName: contributorName || undefined,
        accessibility: features,
        verified: asVerified,
        verifiedBy: asVerified ? contributorName.trim() || 'Access4All' : undefined,
      });

      setSaved(result.listing);
      setShared(result.shared);
      toast.success(
        result.shared
          ? 'Saved. Anyone opening Access4All will see this listing.'
          : result.message,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save your report');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto flex max-w-[720px] flex-col items-center px-4 py-12 text-center sm:px-8 sm:py-20">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--teal)]">
          Share what you found
        </p>
        <h1 className="mt-3 font-display text-[40px] font-semibold tracking-tight sm:text-[48px]">
          Write a stay report
        </h1>
        <p className="mt-4 max-w-xl text-[19px] leading-relaxed text-[var(--muted)]">
          If a listing said “accessible” and it was wrong — or surprisingly right — tell the next
          traveler. Your report is labeled Community until someone else can confirm the same
          features.
        </p>

        {saved ? (
          <div className="mt-10 w-full rounded-3xl border border-[var(--sand)] bg-[var(--paper)] p-6 text-left sm:p-10">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[var(--ok)]" aria-hidden />
              <div>
                <h2 className="font-display text-[26px] font-semibold tracking-tight">
                  Report published
                </h2>
                <p className="mt-1 font-display text-[20px] font-semibold tracking-tight">{saved.name}</p>
                <p className="mt-2 text-[16px] leading-relaxed text-[var(--muted)]">
                  {shared
                    ? 'Saved. Anyone opening Access4All will see this listing.'
                    : 'The shared catalog did not accept this listing. It is not visible on other devices.'}
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/search?location=${encodeURIComponent(saved.location)}&category=${saved.category}`,
                  )
                }
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[var(--teal)] px-6 text-[15px] font-semibold text-white hover:bg-[var(--teal-deep)]"
              >
                <Search className="h-4 w-4" aria-hidden />
                Search for it
              </button>
              <Link
                to={`/property/${saved.id}`}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[var(--sand)] bg-[var(--cream)] px-6 text-[15px] font-semibold hover:bg-[var(--paper)]"
              >
                Open the stay page
              </Link>
            </div>
            <button
              type="button"
              className="mt-6 min-h-[44px] text-[15px] font-medium text-[var(--teal)] hover:underline"
              onClick={() => {
                setSaved(null);
                setShared(false);
                setName('');
                setSummary('');
                setFeatures({});
                setAsVerified(false);
              }}
            >
              Write another report
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-10 w-full space-y-7 rounded-3xl border border-[var(--sand)] bg-[var(--paper)] p-6 text-left sm:p-8"
          >
            <fieldset>
              <legend className="text-[15px] font-semibold text-[var(--ink)]">What kind of place?</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {CONTRIBUTE_CATEGORIES.map((c) => (
                  <label
                    key={c.value}
                    className={[
                      'flex min-h-[52px] cursor-pointer items-center justify-center rounded-2xl border px-3 text-center text-[15px] font-medium',
                      category === c.value
                        ? 'border-[var(--teal)] bg-[var(--teal-soft)] text-[var(--teal)]'
                        : 'border-[var(--sand)] bg-[var(--cream)] text-[var(--ink)]',
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
              <label htmlFor="place-name" className="block text-[15px] font-semibold">
                Place name
              </label>
              <input
                id="place-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={
                  category === 'wav' ? 'City Accessible Vans' : 'Harborview Accessible Inn'
                }
                className="mt-2 w-full rounded-2xl border border-[var(--sand)] bg-[var(--cream)] px-4 py-3.5 text-[17px] placeholder:text-[var(--faint)] focus:border-[var(--teal)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/20"
              />
            </div>

            <div>
              <label htmlFor="place-location" className="block text-[15px] font-semibold">
                City
              </label>
              <input
                id="place-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="New York, NY"
                className="mt-2 w-full rounded-2xl border border-[var(--sand)] bg-[var(--cream)] px-4 py-3.5 text-[17px] placeholder:text-[var(--faint)] focus:border-[var(--teal)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/20"
              />
            </div>

            <div>
              <label htmlFor="place-address" className="block text-[15px] font-semibold">
                Street address <span className="font-normal text-[var(--faint)]">(optional)</span>
              </label>
              <input
                id="place-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="If you remember it"
                className="mt-2 w-full rounded-2xl border border-[var(--sand)] bg-[var(--cream)] px-4 py-3.5 text-[17px] placeholder:text-[var(--faint)] focus:border-[var(--teal)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/20"
              />
            </div>

            <fieldset>
              <legend className="text-[15px] font-semibold">What did you actually find?</legend>
              <p className="mt-1 text-[14px] text-[var(--muted)]">
                Check only what you saw or used. Leave the rest unchecked.
              </p>
              <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2">
                {ACCESSIBILITY_FILTERS.map((f) => (
                  <li key={f.key}>
                    <label className="flex min-h-[52px] cursor-pointer items-start gap-3 rounded-2xl border border-[var(--sand)] bg-[var(--cream)] px-3 py-3">
                      <input
                        type="checkbox"
                        checked={Boolean(features[f.key])}
                        onChange={(e) => toggleFeature(f.key, e.target.checked)}
                        className="mt-1 h-5 w-5 rounded border-[var(--sand)] text-[var(--teal)] focus:ring-[var(--teal)]"
                      />
                      <span>
                        <span className="block text-[15px] font-medium">{f.label}</span>
                        <span className="block text-[13px] text-[var(--faint)]">{f.description}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>

            <div>
              <label htmlFor="place-summary" className="block text-[15px] font-semibold">
                Notes for the next traveler
              </label>
              <textarea
                id="place-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
                rows={6}
                placeholder="The roll-in shower had a fold-down bench and a handheld sprayer. The bathroom doorway measured 34 inches. Parking was next to the lobby elevator."
                className="mt-2 w-full rounded-2xl border border-[var(--sand)] bg-[var(--cream)] px-4 py-3.5 text-[17px] placeholder:text-[var(--faint)] focus:border-[var(--teal)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/20"
              />
            </div>

            <div>
              <label htmlFor="contributor" className="block text-[15px] font-semibold">
                Your name or handle <span className="font-normal text-[var(--faint)]">(optional)</span>
              </label>
              <input
                id="contributor"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                placeholder="Alex"
                className="mt-2 w-full rounded-2xl border border-[var(--sand)] bg-[var(--cream)] px-4 py-3.5 text-[17px] placeholder:text-[var(--faint)] focus:border-[var(--teal)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/20"
              />
            </div>

            <label className="flex min-h-[52px] cursor-pointer items-start gap-3 rounded-2xl border border-[var(--sand)] bg-[var(--cream)] px-3 py-3">
              <input
                type="checkbox"
                checked={asVerified}
                onChange={(e) => setAsVerified(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-[var(--sand)] text-[var(--teal)] focus:ring-[var(--teal)]"
              />
              <span>
                <span className="block text-[15px] font-medium">Verified listing</span>
                <span className="block text-[13px] text-[var(--muted)]">
                  Off by default. When checked, this place is labeled Verified
                  {contributorName.trim() ? ` by ${contributorName.trim()}` : ' by Access4All'} and
                  stays in search for everyone.
                </span>
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[var(--teal)] px-8 text-[17px] font-semibold text-white hover:bg-[var(--teal-deep)] disabled:opacity-60 sm:w-auto"
            >
              {submitting ? 'Publishing…' : 'Publish my report'}
            </button>
          </form>
        )}
      </div>
    </PageShell>
  );
}
