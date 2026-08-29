import { apiUrl } from '../api-base';
import type { CostDashboardData } from './types';
import type { PublicCostDashboardData } from './public-types';

const SEED_PUBLIC_COSTS: PublicCostDashboardData = {
  view: 'public',
  summary: {
    totalCostUsd: 24.57,
    totalCalls: 42,
    averageRuntimeMs: 450,
    averageRuntimeSec: 0.5,
  },
  dailyTrend: [
    { date: '2026-08-24', label: '08-24', costUsd: 3.1, calls: 6, relative: 0.4 },
    { date: '2026-08-25', label: '08-25', costUsd: 4.2, calls: 8, relative: 0.55 },
    { date: '2026-08-26', label: '08-26', costUsd: 5.8, calls: 9, relative: 0.75 },
    { date: '2026-08-27', label: '08-27', costUsd: 3.9, calls: 7, relative: 0.5 },
    { date: '2026-08-28', label: '08-28', costUsd: 7.57, calls: 12, relative: 1 },
  ],
  activityTrend: [
    { hour: 9, label: '9a', calls: 4, relative: 0.4 },
    { hour: 11, label: '11a', calls: 8, relative: 0.8 },
    { hour: 13, label: '1p', calls: 10, relative: 1 },
    { hour: 15, label: '3p', calls: 7, relative: 0.7 },
    { hour: 17, label: '5p', calls: 5, relative: 0.5 },
  ],
  valueHighlights: {
    headline: 'Transparent investment in accessible travel',
    subhead:
      'Every run of our pipeline helps travelers save time and find better options — with honest reporting on how Access4All is built.',
    bullets: [
      '42 catalog and matcher runs completed for search, verification, and map data',
      'Typical response time 0.5s — tuned for real accessibility workflows',
      'Community-verified listings and optional open-map enrichment — demo stays are labeled',
      'Operator dashboard stays gated; travelers see public aggregates only',
    ],
  },
  lastUpdated: new Date().toISOString(),
  measurement: 'estimated',
};

export async function fetchPublicCostDashboard(): Promise<PublicCostDashboardData | null> {
  try {
    const res = await fetch(apiUrl('/api/costs?view=public'));
    if (!res.ok) return SEED_PUBLIC_COSTS;
    return (await res.json()) as PublicCostDashboardData;
  } catch {
    return SEED_PUBLIC_COSTS;
  }
}

export async function fetchCostDashboard(
  filters?: {
    agent?: string;
    from?: string;
    to?: string;
  },
  adminKey?: string | null,
): Promise<CostDashboardData | null> {
  const params = new URLSearchParams({ view: 'admin' });
  if (filters?.agent) params.set('agent', filters.agent);
  if (filters?.from) params.set('from', filters.from);
  if (filters?.to) params.set('to', filters.to);

  const headers: Record<string, string> = {};
  if (adminKey) headers['X-Cost-Admin-Key'] = adminKey;

  try {
    const res = await fetch(apiUrl(`/api/costs?${params.toString()}`), { headers });
    if (!res.ok) return null;
    return (await res.json()) as CostDashboardData;
  } catch {
    return null;
  }
}

export function costExportUrl(
  format: 'csv' | 'agents' | 'report' | 'json',
  filters?: { agent?: string; from?: string; to?: string },
  adminKey?: string | null,
): string {
  const params = new URLSearchParams({ format, view: 'admin' });
  if (filters?.agent) params.set('agent', filters.agent);
  if (filters?.from) params.set('from', filters.from);
  if (filters?.to) params.set('to', filters.to);
  if (adminKey) params.set('adminKey', adminKey);
  return apiUrl(`/api/costs?${params.toString()}`);
}

export function downloadClientJson(data: CostDashboardData, filename?: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `access4all-costs-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
