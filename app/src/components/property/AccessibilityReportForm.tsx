import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { submitAccessibilityReport } from '../../lib/listings/repository';
import type { Listing } from '../../lib/listings/types';
import type { AccessibilityFilterKey } from '../../lib/listings/types';
import { verifyListingOnMonad } from '../../lib/monad/client';
import { ACCESSIBILITY_FILTERS } from '../../lib/listings/filters';

type AccessibilityReportFormProps = {
  listing?: Listing | null;
  onSuccess?: () => void;
};

const ISSUE_TYPES = [
  { value: 'inaccurate_feature', label: 'Inaccurate feature' },
  { value: 'missing_access', label: 'Missing accessibility' },
  { value: 'new_listing', label: 'Suggest new place' },
  { value: 'other', label: 'Other' },
] as const;

export function AccessibilityReportForm({ listing, onSuccess }: AccessibilityReportFormProps) {
  const [issueType, setIssueType] = useState<(typeof ISSUE_TYPES)[number]['value']>('inaccurate_feature');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState(listing?.location ?? '');
  const [title, setTitle] = useState(listing?.name ?? '');
  const [features, setFeatures] = useState<Partial<Record<AccessibilityFilterKey, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);

  const supabaseReady = isSupabaseConfigured();

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
    if (notes.trim().length < 10) {
      toast.error('Please add at least 10 characters describing the issue.');
      return;
    }

    if (!supabaseReady) {
      const subject = encodeURIComponent(`Access4All report: ${title || listing?.name || 'listing'}`);
      const body = encodeURIComponent(
        `Issue: ${issueType}\nLocation: ${location}\nProperty: ${listing?.name ?? title}\n\n${notes}\n\nPage: ${window.location.href}`,
      );
      window.location.href = `mailto:hello@restarto.ai?subject=${subject}&body=${body}`;
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitAccessibilityReport({
        propertyId: listing?.id,
        issueType,
        title: title || undefined,
        location: location || undefined,
        reporterEmail: email || undefined,
        notes: notes.trim(),
        features,
      });

      if (listing?.id && (title || listing.name)) {
        const featureKeys = Object.entries(features)
          .filter(([, v]) => v)
          .map(([k]) => k);
        void verifyListingOnMonad({
          propertyId: listing.id,
          propertyName: listing.name || title,
          location: location || listing.location,
          features: featureKeys,
          reportId: result.id,
        });
      }

      toast.success('Report submitted — thank you for helping the community.');
      setNotes('');
      setFeatures({});
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not submit report';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="report"
      aria-labelledby="report-heading"
      className="rounded-2xl border border-[#d2d2d7] bg-white p-6 sm:p-8"
    >
      <h2 id="report-heading" className="text-[28px] font-semibold tracking-tight text-[#1d1d1f]">
        Report an issue
      </h2>
      <p className="mt-2 text-[17px] text-[#6e6e73]">
        {supabaseReady
          ? 'Submit a community report. Verified reports are logged to the Monad ledger after review.'
          : 'Connect Supabase for in-app reports, or send via email. Verified reports anchor to Monad.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="report-type" className="block text-[13px] font-medium text-[#6e6e73]">
            Issue type
          </label>
          <select
            id="report-type"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value as typeof issueType)}
            className="mt-2 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-[17px] focus:border-[#0f4c5c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
          >
            {ISSUE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {!listing && (
          <>
            <div>
              <label htmlFor="report-title" className="block text-[13px] font-medium text-[#6e6e73]">
                Place name
              </label>
              <input
                id="report-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-[17px] focus:border-[#0f4c5c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
              />
            </div>
            <div>
              <label htmlFor="report-location" className="block text-[13px] font-medium text-[#6e6e73]">
                Location
              </label>
              <input
                id="report-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-[17px] focus:border-[#0f4c5c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="report-notes" className="block text-[13px] font-medium text-[#6e6e73]">
            Details
          </label>
          <textarea
            id="report-notes"
            required
            minLength={10}
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what was inaccurate or missing…"
            className="mt-2 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-[17px] focus:border-[#0f4c5c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
          />
        </div>

        <div>
          <label htmlFor="report-email" className="block text-[13px] font-medium text-[#6e6e73]">
            Email (optional)
          </label>
          <input
            id="report-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-[17px] focus:border-[#0f4c5c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
          />
        </div>

        <fieldset>
          <legend className="text-[13px] font-medium text-[#6e6e73]">
            Features to flag (optional)
          </legend>
          <ul className="mt-3 grid list-none gap-2 p-0 sm:grid-cols-2">
            {ACCESSIBILITY_FILTERS.slice(0, 6).map(({ key, label }) => (
              <li key={key}>
                <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-[#d2d2d7] px-3 py-2 text-[14px]">
                  <input
                    type="checkbox"
                    checked={Boolean(features[key])}
                    onChange={(e) => toggleFeature(key, e.target.checked)}
                    className="h-4 w-4 rounded text-[#0f4c5c]"
                  />
                  {label}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#0f4c5c] px-8 text-[17px] font-medium text-white transition-colors hover:bg-[#0a3540] disabled:opacity-60 sm:w-auto"
        >
          {submitting ? 'Submitting…' : supabaseReady ? 'Submit report' : 'Report via email'}
        </button>
      </form>
    </section>
  );
}
