import { Link } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { PRODUCT_NAME } from '../lib/constants';

const LINKS = [
  { label: 'Quick tour', path: '/demo' },
  { label: 'Search New York + roll-in shower', path: '/search?location=New%20York%2C%20NY&rollInShower=1' },
  { label: 'Harborview stay page', path: '/property/prop-001' },
  { label: 'Write a stay report', path: '/contribute' },
  { label: 'How we work', path: '/costs' },
] as const;

export function JudgeBriefPage() {
  function handlePrint() {
    window.print();
  }

  return (
    <PageShell hideFooter>
      <div className="product-brief min-h-screen bg-[var(--paper)] text-[var(--ink)] print:bg-white">
        <div className="mx-auto max-w-[680px] px-6 py-10 sm:px-8 sm:py-14 print:max-w-none print:px-12 print:py-10">
          <div className="flex flex-wrap items-start justify-between gap-4 print:block">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--teal)] print:text-[10pt]">
                Product overview
              </p>
              <h1 className="mt-2 font-display text-[36px] font-semibold tracking-tight print:text-[18pt]">
                {PRODUCT_NAME}
              </h1>
              <p className="mt-2 text-[18px] text-[var(--muted)] print:text-[12pt]">
                Community catalog of accessibility-verified hotels, stays, airports, and wheelchair vans.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="print:hidden inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--sand)] px-5 text-[14px] font-medium hover:bg-[var(--cream)]"
            >
              <Printer className="h-4 w-4" aria-hidden />
              Print / Save as PDF
            </button>
          </div>

          <section className="mt-10 print:mt-8">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--faint)]">
              The problem
            </h2>
            <p className="mt-2 text-[16px] leading-relaxed print:text-[11pt]">
              Travelers who use wheelchairs still book stays tagged “accessible” that have steps, no
              roll-in shower, or doors too narrow. Marketing labels waste hours and create real trip
              risk. Booking sites do not filter by the features that matter, and community tips
              disappear into threads.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--faint)]">
              What Access4All does
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[16px] leading-relaxed print:text-[11pt]">
              <li>Search hotels, Airbnb stays, airports, and wheelchair vans by eight real features</li>
              <li>
                <strong>Match my needs</strong> — type plain English, get ranked results with match bars
              </li>
              <li>
                Stay pages with photos, a traveler story, and a checklist — not a spec sheet
              </li>
              <li>
                Community reports stay labeled until another traveler can confirm the same features
              </li>
              <li>Seeded catalog so search and stay pages work with no setup</li>
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-[var(--sand)] bg-[var(--cream)] p-5 print:border print:bg-transparent print:p-4">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--faint)]">
              Ninety-second walkthrough
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-[16px] leading-relaxed print:text-[11pt]">
              <li>Open Search and try New York + roll-in shower</li>
              <li>Open Harborview — photos, stay story, eight-feature checklist</li>
              <li>
                Type <em>“roll-in shower and elevator”</em> and rank results
              </li>
              <li>Write a stay report so the next traveler is not guessing</li>
            </ol>
          </section>

          <section className="mt-8">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--faint)]">
              Live pages
            </h2>
            <table className="mt-3 w-full text-left text-[15px] print:text-[10pt]">
              <tbody>
                {LINKS.map(({ label, path }) => (
                  <tr key={path} className="border-b border-[var(--sand)]">
                    <td className="py-2.5 pr-4 font-medium">{label}</td>
                    <td className="py-2.5 break-all text-[var(--teal)]">
                      <Link to={path} className="print:no-underline">
                        {path}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <p className="mt-10 text-[13px] text-[var(--faint)] print:mt-8 print:text-[9pt]">
            {PRODUCT_NAME} · Confirm features with the place before you book.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 print:hidden">
            <Link
              to="/demo"
              className="inline-flex min-h-[48px] items-center rounded-full bg-[var(--teal)] px-6 text-[15px] font-semibold text-white hover:bg-[var(--teal-deep)]"
            >
              Take the quick tour
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-[48px] items-center rounded-full border border-[var(--sand)] px-6 text-[15px] font-medium"
            >
              Home
            </Link>
          </div>
        </div>

        <style>{`
          @media print {
            .product-brief { font-size: 11pt; }
            nav, .print\\:hidden { display: none !important; }
            a { color: #1f4d48; }
          }
        `}</style>
      </div>
    </PageShell>
  );
}
