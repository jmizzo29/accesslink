import { apiUrl } from '../api-base';
import type { CostDashboardData } from './types';
import type { PublicCostDashboardData } from './public-types';

export async function fetchPublicCostDashboard(): Promise<PublicCostDashboardData | null> {
  try {
    const res = await fetch(apiUrl('/api/costs?view=public'));
    if (!res.ok) return null;
    return (await res.json()) as PublicCostDashboardData;
  } catch {
    return null;
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
