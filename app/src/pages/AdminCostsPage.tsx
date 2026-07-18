import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Clock, Zap, BarChart3, LogOut } from 'lucide-react';
import { AppNav } from '../components/AppNav';
import { AdminGate } from '../components/costs/AdminGate';
import { AgentBreakdown } from '../components/costs/AgentBreakdown';
import { DailyCostChart, HourlyUsageChart } from '../components/costs/UsageCharts';
import { ExportPanel } from '../components/costs/ExportPanel';
import { fetchCostDashboard } from '../lib/costs/client';
import { useCostAdmin } from '../lib/costs/useCostAdmin';
import type { CostDashboardData } from '../lib/costs/types';

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof DollarSign;
}) {
  return (
    <div className="rounded-2xl border border-[#d2d2d7] bg-white p-6">
      <div className="flex items-center gap-2 text-[#0f4c5c]">
        <Icon className="h-4 w-4" aria-hidden />
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[#86868b]">{label}</span>
      </div>
      <p className="mt-3 text-[32px] font-semibold tabular-nums tracking-tight text-[#1d1d1f]">{value}</p>
      {hint && <p className="mt-2 text-[13px] text-[#6e6e73]">{hint}</p>}
    </div>
  );
}

export function AdminCostsPage() {
  const { unlocked, adminKey, unlock, lock } = useCostAdmin();
  const [data, setData] = useState<CostDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentFilter, setAgentFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const load = useCallback(async () => {
    if (!adminKey) return;
    setLoading(true);
    const result = await fetchCostDashboard(
      {
        agent: agentFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      },
      adminKey,
    );
    if (!result) {
      setError('Could not load internal cost data');
      setData(null);
    } else {
      setError(null);
      setData(result);
    }
    setLoading(false);
  }, [adminKey, agentFilter, fromDate, toDate]);

  useEffect(() => {
    if (unlocked) load();
    if (!unlocked) return;
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [load, unlocked]);

  const summary = data?.summary;

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#f5f5f7]">
        <AppNav variant="app" />
        <div className="mx-auto px-6 py-20 sm:px-8">
          <AdminGate onUnlock={unlock} />
          <p className="mt-8 text-center text-[14px] text-[#86868b]">
            <Link to="/costs" className="text-[#0f4c5c] hover:underline">
              Back to public transparency view
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
      <AppNav variant="app" />

      <div className="mx-auto max-w-[1080px] px-6 py-12 sm:px-8 sm:py-16">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#0f4c5c]">
              Forge pipeline · Internal
            </p>
            <h1 className="mt-2 text-[40px] font-semibold tracking-tight sm:text-[48px]">Operator dashboard</h1>
            <p className="mt-4 max-w-2xl text-[19px] leading-relaxed text-[#6e6e73]">
              Per-agent spend, token logs, exports, and full manufacturing metrics.
            </p>
          </div>
          <button
            type="button"
            onClick={lock}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#d2d2d7] px-5 text-[14px] font-medium text-[#6e6e73] hover:bg-white"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </header>

        {loading && !data && <p className="mt-12 text-[17px] text-[#6e6e73]">Loading internal metrics…</p>}
        {error && (
          <p className="mt-12 rounded-2xl border border-[#d2d2d7] bg-white px-6 py-8 text-[#6e6e73]" role="alert">
            {error}
          </p>
        )}

        {summary && data && (
          <div className="mt-12 space-y-10">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total cost"
                value={`$${summary.totalCostUsd.toFixed(2)}`}
                hint={`$${summary.averageCostPerCall.toFixed(4)} per call`}
                icon={DollarSign}
              />
              <StatCard
                label="Total calls"
                value={summary.totalCalls.toLocaleString()}
                hint={`${summary.totalTokens.toLocaleString()} tokens`}
                icon={BarChart3}
              />
              <StatCard
                label="Avg latency"
                value={`${summary.averageRuntimeMs.toFixed(0)} ms`}
                hint={`${summary.minRuntimeMs ?? '—'}–${summary.maxRuntimeMs ?? '—'} ms range`}
                icon={Clock}
              />
              <StatCard
                label="Efficiency"
                value={`${(summary.totalTokens / Math.max(summary.totalCalls, 1)).toFixed(0)}`}
                hint="tokens per call"
                icon={Zap}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <DailyCostChart rollups={data.dailyRollups} />
              <HourlyUsageChart buckets={data.hourlyUsage} />
            </div>

            <AgentBreakdown summary={summary} />

            <ExportPanel
              data={data}
              adminKey={adminKey}
              agentFilter={agentFilter}
              fromDate={fromDate}
              toDate={toDate}
              onAgentChange={setAgentFilter}
              onFromChange={setFromDate}
              onToChange={setToDate}
            />

            <section className="rounded-2xl border border-[#d2d2d7] bg-white p-6 sm:p-8">
              <h3 className="text-[20px] font-semibold">Recent events</h3>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-[#d2d2d7] text-[12px] uppercase tracking-wide text-[#86868b]">
                      <th className="pb-3 pr-4">Time</th>
                      <th className="pb-3 pr-4">Agent</th>
                      <th className="pb-3 pr-4">Model</th>
                      <th className="pb-3 pr-4 text-right">Tokens</th>
                      <th className="pb-3 pr-4 text-right">Cost</th>
                      <th className="pb-3 text-right">Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.events.slice(0, 12).map((e) => (
                      <tr key={e.id} className="border-b border-[#f0f0f2] last:border-0">
                        <td className="py-3 pr-4 text-[#6e6e73]">{new Date(e.timestamp).toLocaleString()}</td>
                        <td className="py-3 pr-4 font-medium">{e.agentRole}</td>
                        <td className="py-3 pr-4 text-[#6e6e73]">{e.model}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {(e.inputTokens + e.outputTokens).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4 text-right font-medium tabular-nums text-[#0f4c5c]">
                          ${e.estimatedCostUsd.toFixed(4)}
                        </td>
                        <td className="py-3 text-right tabular-nums">{e.runtimeMs ?? '—'} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
