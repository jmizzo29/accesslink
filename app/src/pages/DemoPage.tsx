import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2,
  MapPinned,
  Shield,
  Sparkles,
  Database,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppNav } from '../components/AppNav';
import { fetchMonadStatus, runDemoVerify } from '../lib/monad/client';
import { monadExplorerTxUrl } from '../lib/monad/explorer';
import type { MonadChainStatus } from '../lib/monad/types';

type Preflight = {
  monad: 'live' | 'wallet' | 'logged' | 'offline';
  osm: 'ready' | 'unknown';
  demoCorpus: true;
};

const STEPS = [
  {
    id: 'search',
    title: 'Search with real filters',
    body: 'New York + roll-in shower — curated demo stays plus live OpenStreetMap wheelchair-tagged places, each labeled.',
    href: '/search?demo=1&location=New%20York%2C%20NY&rollInShower=1',
    cta: 'Open search',
  },
  {
    id: 'property',
    title: 'Inspect a verified stay',
    body: 'Harborview Hotel — checklist, open-map badges when present, and Monad anchor action.',
    href: '/property/prop-001?demo=1',
    cta: 'View Harborview',
  },
  {
    id: 'match',
    title: 'AI needs matcher',
    body: 'Plain-English needs ranked with feature-by-feature match bars — then Anchor on Monad.',
    href: '/search?demo=1&needs=roll-in%20shower%20and%20elevator&location=New%20York%2C%20NY',
    cta: 'Try matcher',
  },
  {
    id: 'monad',
    title: 'Anchor trust on Monad',
    body: 'One-click demo verification — writes a real transaction when the contract is live; otherwise shows an honest seam.',
    action: 'verify',
    cta: 'Run verification',
  },
  {
    id: 'transparency',
    title: 'Honest AI transparency',
    body: 'Public aggregates for travelers; full operator dashboard behind gate.',
    href: '/costs',
    cta: 'Transparency view',
  },
] as const;

export function DemoPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<MonadChainStatus | null>(null);
  const [preflight, setPreflight] = useState<Preflight | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [lastTx, setLastTx] = useState<string | null>(null);
  const [lastOnChain, setLastOnChain] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const monad = await fetchMonadStatus();
      if (cancelled) return;
      setStatus(monad);
      setPreflight({
        monad: !monad
          ? 'offline'
          : monad.writeEnabled && monad.contractAddress
            ? 'wallet'
            : monad.contractAddress
              ? 'logged'
              : 'offline',
        osm: 'ready',
        demoCorpus: true,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const runVerify = useCallback(async () => {
    setVerifying(true);
    try {
      const { record, mode } = await runDemoVerify();
      setCompleted((c) => ({ ...c, monad: true }));
      const tx = record.txHash || null;
      const onChain = Boolean(record.onChain);
      setLastTx(tx);
      setLastOnChain(onChain);
      if (onChain && tx) {
        toast.success(
          mode === 'wallet'
            ? 'Wallet confirmed on Monad testnet — open Activity for the explorer link.'
            : 'Verified on Monad testnet — open Activity to see the tx.',
        );
      } else {
        toast.message('Saved locally — not on-chain yet', {
          description:
            'Connect MetaMask to Monad testnet, then run verification again for a real transaction.',
        });
      }
      navigate('/activity');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  }, [navigate]);

  const explorer = status?.explorer || 'https://testnet.monadvision.com';

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <AppNav variant="app" />

      <div className="mx-auto max-w-[720px] px-6 py-14 sm:px-8 sm:py-20">
        <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-[#6e6e73]">
          Spark judge path · ~90 seconds
        </p>
        <h1 className="mt-4 font-display text-[40px] font-semibold tracking-tight sm:text-[48px]">
          The trip I could not plan with confidence
        </h1>
        <p className="mt-4 text-[19px] leading-relaxed text-[#6e6e73]">
          I kept booking “accessible” hotels that were not — missing roll-in showers, mystery steps at
          the door. Access4All is the checklist I wish I had: filter by real features, match plain
          English needs, then anchor a verification on Monad so the trust record is not stuck in a
          review thread.
        </p>

        {preflight && (
          <div
            className="mt-8 rounded-2xl border border-[#d2d2d7] bg-white p-5 sm:p-6"
            role="status"
            aria-label="Demo preflight status"
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#6e6e73]">
              Preflight — what is live right now
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              <li className="flex items-start gap-2 text-[13px] leading-snug">
                <Shield
                  className={[
                    'mt-0.5 h-4 w-4 shrink-0',
                    preflight.monad === 'wallet' || preflight.monad === 'live'
                      ? 'text-emerald-700'
                      : 'text-amber-700',
                  ].join(' ')}
                  aria-hidden
                />
                <span>
                  <strong className="block text-[#1d1d1f]">Monad</strong>
                  {preflight.monad === 'wallet' || preflight.monad === 'live'
                    ? `${status?.network ?? 'testnet'} · wallet ready for on-chain write`
                    : preflight.monad === 'logged'
                      ? 'Contract readable — connect a wallet to write on-chain'
                      : 'Status unreachable — install a wallet for demo verify'}
                </span>
              </li>
              <li className="flex items-start gap-2 text-[13px] leading-snug">
                <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" aria-hidden />
                <span>
                  <strong className="block text-[#1d1d1f]">Open maps</strong>
                  OSM / Wheelmap enrichment ready on search
                </span>
              </li>
              <li className="flex items-start gap-2 text-[13px] leading-snug">
                <Database className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" aria-hidden />
                <span>
                  <strong className="block text-[#1d1d1f]">Demo corpus</strong>
                  Harborview + curated stays labeled “Demo stay”
                </span>
              </li>
            </ul>
          </div>
        )}

        <ol className="mt-12 space-y-4">
          {STEPS.map((step, index) => {
            const done = completed[step.id];
            return (
              <li
                key={step.id}
                className="rounded-2xl border border-[#d2d2d7] bg-white p-6 sm:p-8"
              >
                <div className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f4c5c]/10 text-[14px] font-semibold text-[#0f4c5c]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-[#0f4c5c]" aria-hidden />
                      ) : (
                        <Circle className="h-5 w-5 text-[#d2d2d7]" aria-hidden />
                      )}
                      <h2 className="text-[21px] font-semibold tracking-tight">{step.title}</h2>
                    </div>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#6e6e73]">{step.body}</p>
                    <div className="mt-5">
                      {'href' in step && step.href ? (
                        <Link
                          to={step.href}
                          onClick={() => setCompleted((c) => ({ ...c, [step.id]: true }))}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#0f4c5c] px-6 text-[15px] font-medium text-white hover:bg-[#0a3540]"
                        >
                          {step.cta}
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={runVerify}
                          disabled={verifying}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#0f4c5c] px-6 text-[15px] font-medium text-white hover:bg-[#0a3540] disabled:opacity-60"
                        >
                          {verifying ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                              Verifying…
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" aria-hidden />
                              {step.cta}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {step.id === 'monad' && lastTx && (
                      <div className="mt-3 space-y-1">
                        {lastOnChain === false && (
                          <p className="text-[13px] text-amber-800">
                            Logged only — not a live on-chain transaction.
                          </p>
                        )}
                        {lastOnChain && (
                          <a
                            href={monadExplorerTxUrl(explorer, lastTx)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-[13px] font-medium text-[#0f4c5c] underline"
                          >
                            View last transaction on MonadVision
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 rounded-2xl bg-[#0f4c5c] p-8 text-center text-white">
          <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-white/70">
            Start here for judges
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/search?demo=1&location=New%20York%2C%20NY&rollInShower=1"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-8 text-[17px] font-medium text-[#0f4c5c]"
            >
              Run full demo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/judge"
              className="inline-flex min-h-[48px] items-center rounded-full border border-white/40 px-8 text-[17px] font-medium text-white hover:bg-white/10"
            >
              One-page brief (PDF)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
