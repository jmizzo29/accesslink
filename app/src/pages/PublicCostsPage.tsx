import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { AppNav } from '../components/AppNav';
import { PublicActivityChart, PublicDailyChart } from '../components/costs/PublicCostCharts';
import { fetchPublicCostDashboard } from '../lib/costs/client';
import type { PublicCostDashboardData } from '../lib/costs/public-types';

function MetricTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/[0.04]">
      <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#86868b]">{label}</p>
      <p className="mt-4 text-[48px] font-semibold leading-none tracking-tight text-[#1d1d1f] sm:text-[56px]">
        {value}
      </p>
      {hint && <p className="mt-4 text-[15px] leading-relaxed text-[#6e6e73]">{hint}</p>}
    </div>
  );
}

export function PublicCostsPage() {
  const [data, setData] = useState<PublicCostDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicCostDashboard()
      .then(setData)
      .finally(() => setLoading(false));
    const timer = setInterval(() => fetchPublicCostDashboard().then(setData), 30000);
    return () => clearInterval(timer);
  }, []);

  const summary = data?.summary;

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1d1d1f] antialiased">
      <AppNav variant="app" />

      <section className="border-b border-black/[0.04] bg-white">
        <div className="mx-auto max-w-[1080px] px-6 py-16 sm:px-8 sm:py-24">
          <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-[#0f4c5c]">
            Transparency
          </p>
          <h1 className="mt-4 max-w-3xl text-[44px] font-semibold leading-[1.05] tracking-tight sm:text-[56px]">
            Built with care.
            <span className="block text-[#6e6e73]">Measured with honesty.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[19px] leading-relaxed text-[#6e6e73]">
            {data?.valueHighlights.subhead ??
              'Helping travelers save time and find better accessible options — with clear reporting on how Access4All is made.'}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1080px] px-6 py-12 sm:px-8 sm:py-16">
        {loading && !data && (
          <p className="text-[17px] text-[#6e6e73]">Loading transparency metrics…</p>
        )}

        {summary && data && (
          <div className="space-y-12">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <MetricTile
                label="Total investment"
                value={`$${summary.totalCostUsd.toFixed(2)}`}
                hint="Estimated spend to build and improve Access4All"
              />
              <MetricTile
                label="Pipeline runs"
                value={summary.totalCalls.toLocaleString()}
                hint="End-to-end manufacturing cycles completed"
              />
              <MetricTile
                label="Avg response"
                value={`${summary.averageRuntimeSec}s`}
                hint="Typical time to deliver a pipeline step"
              />
              <MetricTile
                label="Focus"
                value="Travelers"
                hint="Every run supports search, verification, and honest empty states"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <PublicDailyChart points={data.dailyTrend} />
              <PublicActivityChart points={data.activityTrend} />
            </div>

            <section className="rounded-3xl bg-[#0f4c5c] p-8 text-white sm:p-12">
              <div className="flex items-start gap-4">
                <Heart className="mt-1 h-6 w-6 shrink-0 opacity-90" aria-hidden />
                <div>
                  <h2 className="text-[28px] font-semibold tracking-tight sm:text-[32px]">
                    {data.valueHighlights.headline}
                  </h2>
                  <ul className="mt-6 space-y-4">
                    {data.valueHighlights.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-[16px] leading-relaxed text-white/90">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 opacity-80" aria-hidden />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/[0.04]">
                <TrendingUp className="h-5 w-5 text-[#0f4c5c]" aria-hidden />
                <p className="mt-4 text-[17px] font-semibold">Better matches</p>
                <p className="mt-2 text-[14px] leading-relaxed text-[#6e6e73]">
                  Smarter pipelines mean travelers spend less time guessing whether a stay will work.
                </p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/[0.04]">
                <Clock className="h-5 w-5 text-[#0f4c5c]" aria-hidden />
                <p className="mt-4 text-[17px] font-semibold">Faster answers</p>
                <p className="mt-2 text-[14px] leading-relaxed text-[#6e6e73]">
                  Response times are tuned for real search and report workflows — not demo fluff.
                </p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/[0.04]">
                <Heart className="h-5 w-5 text-[#0f4c5c]" aria-hidden />
                <p className="mt-4 text-[17px] font-semibold">Community first</p>
                <p className="mt-2 text-[14px] leading-relaxed text-[#6e6e73]">
                  Verified accessibility data and open Wheelmap enrichment — never fake listings.
                </p>
              </div>
            </div>

            <p className="text-center text-[13px] text-[#86868b]">
              Updated {new Date(data.lastUpdated).toLocaleString()} · {data.measurement} figures ·{' '}
              <Link to="/monitoring/costs" className="text-[#0f4c5c] hover:underline">
                Operator sign-in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
