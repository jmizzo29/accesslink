import type { PublicActivityPoint, PublicDailyPoint } from '../../lib/costs/public-types';

type PublicDailyChartProps = {
  points: PublicDailyPoint[];
};

export function PublicDailyChart({ points }: PublicDailyChartProps) {
  const width = 720;
  const height = 240;
  const pad = { top: 28, right: 20, bottom: 40, left: 24 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const barW = chartW / Math.max(points.length, 1) - 16;

  return (
    <div className="overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/[0.04]">
      <h3 className="text-[22px] font-semibold tracking-tight text-[#1d1d1f]">Build activity</h3>
      <p className="mt-2 text-[15px] text-[#6e6e73]">Daily investment in making Access4All faster and more reliable</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-8 w-full" role="img" aria-label="Daily build activity chart">
        {points.map((p, i) => {
          const barH = Math.max(p.relative * chartH, 4);
          const x = pad.left + i * (chartW / points.length) + 8;
          const y = pad.top + chartH - barH;
          return (
            <g key={p.date}>
              <rect x={x} y={y} width={barW} height={barH} rx={6} fill="#0f4c5c" opacity={0.88} />
              <text x={x + barW / 2} y={height - 12} textAnchor="middle" fontSize="11" fill="#86868b">
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

type PublicActivityChartProps = {
  points: PublicActivityPoint[];
};

export function PublicActivityChart({ points }: PublicActivityChartProps) {
  const active = points.filter((p) => p.relative > 0);
  const width = 720;
  const height = 200;
  const pad = { top: 20, right: 16, bottom: 32, left: 20 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const step = chartW / 24;

  const linePoints = points
    .map((p, i) => {
      const x = pad.left + i * step + step / 2;
      const y = pad.top + chartH - p.relative * chartH;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/[0.04]">
      <h3 className="text-[22px] font-semibold tracking-tight text-[#1d1d1f]">Pipeline rhythm</h3>
      <p className="mt-2 text-[15px] text-[#6e6e73]">
        When our team ships improvements — {active.length} active hours today
      </p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-8 w-full" role="img" aria-label="Pipeline activity rhythm chart">
        <defs>
          <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline fill="none" stroke="#14b8a6" strokeWidth="2.5" points={linePoints} />
        {points.map((p, i) => {
          if (!p.relative) return null;
          const x = pad.left + i * step + step / 2;
          const y = pad.top + chartH - p.relative * chartH;
          return <circle key={p.hour} cx={x} cy={y} r="3.5" fill="#0f4c5c" />;
        })}
      </svg>
    </div>
  );
}
