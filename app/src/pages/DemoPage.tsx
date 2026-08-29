import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { PageShell } from '../components/PageShell';

const STEPS = [
  {
    id: 'search',
    title: 'Search with real filters',
    body: 'Try New York and roll-in shower. You’ll see hotels, stays, airports, and wheelchair vans — each labeled Verified or Community.',
    href: '/search?location=New%20York%2C%20NY&rollInShower=1',
    cta: 'Open search',
  },
  {
    id: 'property',
    title: 'Open a stay page',
    body: 'Harborview in New York — photos, the story of the stay, and an eight-feature checklist you can actually use.',
    href: '/property/prop-001',
    cta: 'View Harborview',
  },
  {
    id: 'match',
    title: 'Match my needs',
    body: 'Type “roll-in shower and elevator” and rank results against the features you actually need — not a marketing tag.',
    href: '/search?needs=roll-in%20shower%20and%20elevator&location=New%20York%2C%20NY',
    cta: 'Try the ranker',
  },
  {
    id: 'contribute',
    title: 'Share a stay you trust',
    body: 'Write a short report for the next traveler. Community reports stay labeled until others confirm the same features.',
    href: '/contribute',
    cta: 'Write a report',
  },
] as const;

export function DemoPage() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  return (
    <PageShell>
      <div className="mx-auto max-w-[720px] px-4 py-12 sm:px-8 sm:py-20">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--teal)]">
          About 90 seconds
        </p>
        <h1 className="mt-4 font-display text-[40px] font-semibold tracking-tight sm:text-[48px]">
          See how Access4All works
        </h1>
        <p className="mt-4 text-[19px] leading-relaxed text-[var(--muted)]">
          I kept booking “accessible” hotels that were not — missing roll-in showers, mystery steps
          at the door. This is the checklist I wish I had: filter by real features, rank stays in
          plain English, and share what you found.
        </p>

        <ol className="mt-12 space-y-4">
          {STEPS.map((step, index) => {
            const done = completed[step.id];
            return (
              <li
                key={step.id}
                className="rounded-3xl border border-[var(--sand)] bg-[var(--paper)] p-6 sm:p-8"
              >
                <div className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--teal-soft)] text-[14px] font-semibold text-[var(--teal)]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-[var(--teal)]" aria-hidden />
                      ) : (
                        <Circle className="h-5 w-5 text-[var(--sand)]" aria-hidden />
                      )}
                      <h2 className="font-display text-[22px] font-semibold tracking-tight">
                        {step.title}
                      </h2>
                    </div>
                    <p className="mt-2 text-[16px] leading-relaxed text-[var(--muted)]">{step.body}</p>
                    <div className="mt-5">
                      <Link
                        to={step.href}
                        onClick={() => setCompleted((c) => ({ ...c, [step.id]: true }))}
                        className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[var(--teal)] px-6 text-[15px] font-semibold text-white hover:bg-[var(--teal-deep)]"
                      >
                        {step.cta}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 rounded-[2rem] bg-[var(--teal)] p-8 text-center text-white sm:p-10">
          <p className="font-display text-[26px] font-semibold tracking-tight">Ready to look up a trip?</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/search?location=New%20York%2C%20NY&rollInShower=1"
              className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-white px-8 text-[17px] font-semibold text-[var(--teal)]"
            >
              Search New York
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/judge"
              className="inline-flex min-h-[52px] items-center rounded-full border border-white/40 px-8 text-[17px] font-semibold text-white hover:bg-white/10"
            >
              One-page overview
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
