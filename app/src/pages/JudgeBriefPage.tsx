import { Link } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { AppNav } from '../components/AppNav';
import { PRODUCT_NAME } from '../lib/constants';

/** Live SPA path (Vercel redirects portfolio root → /app/) */
const BASE = 'https://www.restarto.ai/portfolio/access4all/app';
const CONTRACT = '0x26a0383b3E81e0f81261ecE6aadB3aAC8022195E';

const LINKS = [
  { label: 'Judge demo (start)', path: '/demo' },
  { label: 'Search + AI matcher', path: '/search?demo=1&location=New%20York%2C%20NY&rollInShower=1' },
  { label: 'Harborview (demo stay)', path: '/property/prop-001' },
  { label: 'Monad activity', path: '/activity' },
  { label: 'Transparency (public costs)', path: '/costs' },
] as const;

export function JudgeBriefPage() {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="judge-brief min-h-screen bg-white text-[#1d1d1f] print:bg-white">
      <div className="print:hidden">
        <AppNav variant="app" />
      </div>

      <div className="mx-auto max-w-[680px] px-6 py-10 sm:px-8 sm:py-14 print:max-w-none print:px-12 print:py-10">
        <div className="flex flex-wrap items-start justify-between gap-4 print:block">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e6e73] print:text-[10pt]">
              Hackathon judge brief · one page
            </p>
            <h1 className="mt-2 font-display text-[36px] font-semibold tracking-tight print:text-[14pt]">
              {PRODUCT_NAME}
            </h1>
            <p className="mt-2 text-[17px] text-[#0f4c5c] print:text-[14pt]">
              Accessible travel search — open maps, need match, on-chain trust
            </p>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="print:hidden inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#d2d2d7] px-5 text-[14px] font-medium hover:bg-[#f5f5f7]"
          >
            <Printer className="h-4 w-4" aria-hidden />
            Print / Save as PDF
          </button>
        </div>

        <section className="mt-10 print:mt-8">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#6e6e73]">Problem</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[#1d1d1f] print:text-[11pt]">
            Personal: I (and people close to me) have booked “accessible” stays that still had steps,
            no roll-in shower, or doors too narrow. Marketing labels waste hours and create real trip
            risk. Booking sites do not let me filter by the features that actually matter, and
            community tips disappear into threads.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#6e6e73]">Solution</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed print:text-[11pt]">
            <li>Search by real accessibility features — not vague “accessible” tags</li>
            <li>
              Merge <strong>OpenStreetMap / Wheelmap</strong> places — labeled separately from curated
              demo stays
            </li>
            <li>
              <strong>Access Match → Anchor</strong> — plain English needs → match bars → wallet write
              to Monad testnet
            </li>
            <li>
              <strong>On-chain trust</strong> — verification hashes live on contract{' '}
              <span className="font-mono text-[12px]">{CONTRACT.slice(0, 10)}…</span>
            </li>
            <li>Honest empty states — no fake listings or fake explorer hashes</li>
          </ul>
        </section>

        <section className="mt-8 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] p-5 print:border print:bg-transparent print:p-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#6e6e73]">
            90-second demo script
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed print:text-[11pt]">
            <li>
              Open <strong>Start judge demo</strong> on the landing page
            </li>
            <li>Search New York + roll-in shower — curated demo stays clearly labeled</li>
            <li>
              Type needs: <em>“roll-in shower and elevator”</em> → Rank → see match bars
            </li>
            <li>
              Tap <strong>Run verification</strong> with a Monad testnet wallet → Activity shows real
              explorer tx
            </li>
            <li>
              Open contract on MonadVision to confirm the write
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#6e6e73]">Live links</h2>
          <table className="mt-3 w-full text-left text-[14px] print:text-[10pt]">
            <tbody>
              {LINKS.map(({ label, path }) => (
                <tr key={path} className="border-b border-[#d2d2d7]">
                  <td className="py-2 pr-4 font-medium">{label}</td>
                  <td className="py-2 break-all text-[#0f4c5c]">
                    <a href={`${BASE}${path}`} className="print:no-underline">
                      {BASE}
                      {path}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 print:grid-cols-2">
          <div className="rounded-xl border border-[#d2d2d7] p-4 print:p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6e6e73]">Monad contract</p>
            <p className="mt-2 break-all font-mono text-[12px] print:text-[9pt]">{CONTRACT}</p>
            <a
              href={`https://testnet.monadvision.com/address/${CONTRACT}`}
              className="mt-2 inline-block text-[13px] text-[#0f4c5c] print:text-[9pt]"
            >
              testnet.monadvision.com
            </a>
          </div>
          <div className="rounded-xl border border-[#d2d2d7] p-4 print:p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6e6e73]">Proof points</p>
            <ul className="mt-2 space-y-1 text-[13px] print:text-[9pt]">
              <li>On-chain writes when contract live</li>
              <li>OSM enrichment labeled in results</li>
              <li>Curated demo stays labeled — not fake feed</li>
            </ul>
          </div>
        </section>

        <p className="mt-10 text-[12px] text-[#86868b] print:mt-8 print:text-[9pt]">
          {PRODUCT_NAME} · Restarto portfolio · July 2026
        </p>

        <div className="mt-8 flex gap-4 print:hidden">
          <Link
            to="/demo"
            className="inline-flex min-h-[44px] items-center rounded-full bg-[#0f4c5c] px-6 text-[15px] font-medium text-white hover:bg-[#0a3540]"
          >
            Open judge demo
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center rounded-full border border-[#d2d2d7] px-6 text-[15px] font-medium"
          >
            Home
          </Link>
        </div>
      </div>

      <style>{`
        @media print {
          .judge-brief { font-size: 11pt; }
          nav, .print\\:hidden { display: none !important; }
          a { color: #0f4c5c; }
        }
      `}</style>
    </div>
  );
}
