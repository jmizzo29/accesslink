import type { CostSummary } from '../../lib/costs/types';

const AGENT_COLORS = [
  '#0f4c5c',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#ec4899',
  '#84cc16',
];

type AgentBreakdownProps = {
  summary: CostSummary;
};

export function AgentBreakdown({ summary }: AgentBreakdownProps) {
  const entries = Object.entries(summary.byAgent).sort((a, b) => b[1].totalCostUsd - a[1].totalCostUsd);
  const max = Math.max(...entries.map(([, d]) => d.totalCostUsd), 0.01);
  const total = entries.reduce((s, [, d]) => s + d.totalCostUsd, 0);

  return (
    <div className="rounded-2xl border border-[#d2d2d7] bg-white p-6 sm:p-8">
      <h3 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f]">Per-agent cost breakdown</h3>
      <p className="mt-2 text-[14px] text-[#6e6e73]">
        Share of pipeline spend by Forge agent role
      </p>

      <div className="mt-8 space-y-4">
        {entries.map(([agent, detail], idx) => {
          const pct = total > 0 ? (detail.totalCostUsd / total) * 100 : 0;
          const widthPct = (detail.totalCostUsd / max) * 100;
          return (
            <div key={agent}>
              <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[14px] font-medium text-[#1d1d1f]">{agent}</span>
                <span className="text-[13px] text-[#6e6e73]">
                  ${detail.totalCostUsd.toFixed(2)} · {detail.callCount} calls · {pct.toFixed(0)}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#f5f5f7]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: AGENT_COLORS[idx % AGENT_COLORS.length],
                  }}
                />
              </div>
              <p className="mt-1 text-[12px] text-[#86868b]">
                {detail.totalTokens.toLocaleString()} tokens · avg {detail.avgRuntimeMs.toFixed(0)} ms
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#d2d2d7] text-[12px] uppercase tracking-wide text-[#86868b]">
              <th className="pb-3 pr-4 font-medium">Agent</th>
              <th className="pb-3 pr-4 text-right font-medium">Calls</th>
              <th className="pb-3 pr-4 text-right font-medium">Tokens</th>
              <th className="pb-3 pr-4 text-right font-medium">Cost</th>
              <th className="pb-3 text-right font-medium">Avg latency</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([agent, d]) => (
              <tr key={agent} className="border-b border-[#f0f0f2] last:border-0">
                <td className="py-3 pr-4 font-medium">{agent}</td>
                <td className="py-3 pr-4 text-right tabular-nums">{d.callCount}</td>
                <td className="py-3 pr-4 text-right tabular-nums">{d.totalTokens.toLocaleString()}</td>
                <td className="py-3 pr-4 text-right font-medium tabular-nums text-[#0f4c5c]">
                  ${d.totalCostUsd.toFixed(2)}
                </td>
                <td className="py-3 text-right tabular-nums">{d.avgRuntimeMs.toFixed(0)} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
