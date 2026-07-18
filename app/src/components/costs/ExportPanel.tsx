import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { costExportUrl, downloadClientJson } from '../../lib/costs/client';
import type { CostDashboardData } from '../../lib/costs/types';

type ExportPanelProps = {
  data: CostDashboardData;
  adminKey?: string | null;
  agentFilter: string;
  fromDate: string;
  toDate: string;
  onAgentChange: (v: string) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
};

export function ExportPanel({
  data,
  adminKey,
  agentFilter,
  fromDate,
  toDate,
  onAgentChange,
  onFromChange,
  onToChange,
}: ExportPanelProps) {
  const filters = {
    agent: agentFilter || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
  };

  return (
    <section className="rounded-2xl border border-[#d2d2d7] bg-white p-6 sm:p-8">
      <h3 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f]">Export & filters</h3>
      <p className="mt-2 text-[14px] text-[#6e6e73]">
        Download full event logs, per-agent summaries, or markdown reports. Filters apply to exports and charts.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-[13px] font-medium text-[#6e6e73]">Agent</span>
          <select
            value={agentFilter}
            onChange={(e) => onAgentChange(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-[15px]"
          >
            <option value="">All agents</option>
            {data.agents.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-[#6e6e73]">From</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromChange(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-[15px]"
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-[#6e6e73]">To</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToChange(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-[15px]"
          />
        </label>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={costExportUrl('csv', filters, adminKey)}
          download
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#d2d2d7] px-5 text-[14px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7]"
        >
          <FileSpreadsheet className="h-4 w-4" aria-hidden />
          Events CSV
        </a>
        <a
          href={costExportUrl('agents', filters, adminKey)}
          download
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#d2d2d7] px-5 text-[14px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7]"
        >
          <FileSpreadsheet className="h-4 w-4" aria-hidden />
          Agents CSV
        </a>
        <a
          href={costExportUrl('report', filters, adminKey)}
          download
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#d2d2d7] px-5 text-[14px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7]"
        >
          <FileText className="h-4 w-4" aria-hidden />
          Markdown report
        </a>
        <button
          type="button"
          onClick={() => downloadClientJson(data)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#0f4c5c] px-5 text-[14px] font-medium text-white hover:bg-[#0a3540]"
        >
          <Download className="h-4 w-4" aria-hidden />
          Full JSON
        </button>
      </div>
    </section>
  );
}
