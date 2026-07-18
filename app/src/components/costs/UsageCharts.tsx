import type { DailyRollup, HourlyBucket } from '../../lib/costs/types';

type DailyCostChartProps = {
  rollups: DailyRollup[];
};

export function DailyCostChart({ rollups }: DailyCostChartProps) {
  const sorted = [...rollups].sort((a, b) => a.date.localeCompare(b.date));
  const max = Math.max(...sorted.map((r) => r.summary.totalCostUsd), 0.01);
  const width = 640;
  const height = 220;
  const pad = { top: 24, right: 16, bottom: 36, left: 48 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const barW = chartW / Math.max(sorted.length, 1) - 12;

  return (
    <div className="rounded-2xl border border-[#d2d2d7] bg-white p-6">
      <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Daily cost trend</h3>
      <p className="mt-1 text-[13px] text-[#86868b]">USD spend per day across the Access4All build pipeline</p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-6 w-full max-w-full"
        role="img"
        aria-label="Daily cost bar chart"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = pad.top + chartH * (1 - t);
          const val = (max * t).toFixed(2);
          return (
            <g key={t}>
              <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="#f0f0f2" />
              <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#86868b">
                ${val}
              </text>
            </g>
          );
        })}
        {sorted.map((rollup, i) => {
          const cost = rollup.summary.totalCostUsd;
          const barH = (cost / max) * chartH;
          const x = pad.left + i * (chartW / sorted.length) + 6;
          const y = pad.top + chartH - barH;
          return (
            <g key={rollup.date}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={4}
                fill="#0f4c5c"
                opacity={0.85}
              />
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="10" fill="#0f4c5c" fontWeight="600">
                ${cost.toFixed(2)}
              </text>
              <text
                x={x + barW / 2}
                y={height - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#6e6e73"
              >
                {rollup.date.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

type HourlyUsageChartProps = {
  buckets: HourlyBucket[];
};

export function HourlyUsageChart({ buckets }: HourlyUsageChartProps) {
  const active = buckets.filter((b) => b.tokens > 0);
  const max = Math.max(...buckets.map((b) => b.tokens), 1);
  const width = 640;
  const height = 200;
  const pad = { top: 16, right: 12, bottom: 28, left: 40 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const step = chartW / 24;

  const points = buckets
    .map((b, i) => {
      const x = pad.left + i * step + step / 2;
      const y = pad.top + chartH - (b.tokens / max) * chartH;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="rounded-2xl border border-[#d2d2d7] bg-white p-6">
      <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Hourly token usage</h3>
      <p className="mt-1 text-[13px] text-[#86868b]">
        Tokens consumed by hour (UTC) — {active.length} active hours
      </p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-6 w-full" role="img" aria-label="Hourly token usage line chart">
        <polyline
          fill="none"
          stroke="#14b8a6"
          strokeWidth="2.5"
          points={points}
        />
        {buckets.map((b, i) => {
          if (!b.tokens) return null;
          const x = pad.left + i * step + step / 2;
          const y = pad.top + chartH - (b.tokens / max) * chartH;
          return <circle key={b.hour} cx={x} cy={y} r="3" fill="#0f4c5c" />;
        })}
        {[0, 6, 12, 18, 23].map((h) => (
          <text
            key={h}
            x={pad.left + h * step + step / 2}
            y={height - 6}
            textAnchor="middle"
            fontSize="9"
            fill="#86868b"
          >
            {h}:00
          </text>
        ))}
      </svg>
    </div>
  );
}
