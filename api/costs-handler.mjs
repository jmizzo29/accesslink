import {
  AGENTS,
  COST_EVENTS,
  COST_SUMMARY,
  DAILY_ROLLUPS,
  agentsToCsv,
  buildHourlyUsage,
  buildMarkdownReport,
  eventsToCsv,
  filterEvents,
  summarizeEvents,
} from './costs-data.mjs';

const DEFAULT_ADMIN_KEY = 'access4all-ops';

function parseQuery(req) {
  const url = new URL(req.url || '/', 'http://localhost');
  return {
    format: url.searchParams.get('format') || 'json',
    view: url.searchParams.get('view') || 'public',
    agent: url.searchParams.get('agent') || undefined,
    from: url.searchParams.get('from') || undefined,
    to: url.searchParams.get('to') || undefined,
    date: url.searchParams.get('date') || '2026-07-14',
    adminKey:
      url.searchParams.get('adminKey') ||
      req.headers?.['x-cost-admin-key'] ||
      req.headers?.['X-Cost-Admin-Key'] ||
      undefined,
  };
}

function isAdminAuthorized(adminKey) {
  const expected = process.env.COST_ADMIN_KEY || DEFAULT_ADMIN_KEY;
  return Boolean(adminKey && adminKey === expected);
}

function buildPublicPayload(summary, dailyRollups, hourlyUsage) {
  const maxDaily = Math.max(...dailyRollups.map((r) => r.summary.totalCostUsd), 0.01);
  const maxHourly = Math.max(...hourlyUsage.map((b) => b.calls), 1);

  const dailyTrend = dailyRollups.map((r) => ({
    date: r.date,
    label: r.date.slice(5),
    costUsd: Math.round(r.summary.totalCostUsd * 100) / 100,
    calls: r.summary.totalCalls,
    relative: r.summary.totalCostUsd / maxDaily,
  }));

  const activityTrend = hourlyUsage.map((b) => ({
    hour: b.hour,
    label: b.label,
    calls: b.calls,
    relative: b.calls / maxHourly,
  }));

  return {
    view: 'public',
    summary: {
      totalCostUsd: Math.round(summary.totalCostUsd * 100) / 100,
      totalCalls: summary.totalCalls,
      averageRuntimeMs: Math.round(summary.averageRuntimeMs),
      averageRuntimeSec: Math.round((summary.averageRuntimeMs / 1000) * 10) / 10,
    },
    dailyTrend,
    activityTrend,
    valueHighlights: {
      headline: 'Transparent investment in accessible travel',
      subhead:
        'Every run of our pipeline helps travelers save time and find better options — with honest reporting on how Access4All is built.',
      bullets: [
        `${summary.totalCalls} manufacturing runs completed for search, verification, and map data`,
        `Typical response time ${(summary.averageRuntimeMs / 1000).toFixed(1)}s — tuned for real accessibility workflows`,
        'Community-verified listings and open data — no hidden mock results',
        'Full operational detail available to authorized Forge operators only',
      ],
    },
    lastUpdated: new Date().toISOString(),
    measurement: 'estimated',
  };
}

export async function handleAdminVerify(req) {
  let body = {};
  if (req.body) {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  const authorized = isAdminAuthorized(body.key);
  return {
    status: authorized ? 200 : 401,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: authorized }),
  };
}

export async function handleCosts(req) {
  const q = parseQuery(req);
  const filtered = filterEvents(COST_EVENTS, q);
  const summary = q.agent || q.from || q.to ? summarizeEvents(filtered) : COST_SUMMARY;
  const hourlyUsage = buildHourlyUsage(COST_EVENTS, q.date);
  const adminOk = isAdminAuthorized(q.adminKey);

  if (q.format === 'csv' || q.format === 'agents' || q.format === 'report') {
    if (!adminOk) {
      return {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Admin key required for exports' }),
      };
    }
    if (q.format === 'csv') {
      return {
        status: 200,
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="access4all-costs.csv"' },
        body: eventsToCsv(filtered),
      };
    }
    if (q.format === 'agents') {
      return {
        status: 200,
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="access4all-agents.csv"' },
        body: agentsToCsv(summary),
      };
    }
    return {
      status: 200,
      headers: { 'Content-Type': 'text/markdown', 'Content-Disposition': 'attachment; filename="access4all-cost-report.md"' },
      body: buildMarkdownReport(summary, filtered, DAILY_ROLLUPS),
    };
  }

  if (q.view === 'admin' && adminOk) {
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        view: 'admin',
        summary,
        events: filtered,
        dailyRollups: DAILY_ROLLUPS,
        hourlyUsage,
        agents: AGENTS,
        filters: { agent: q.agent ?? null, from: q.from ?? null, to: q.to ?? null },
        measurement: 'estimated',
        source: 'forge-llm-cost-tracker-sample',
        lastUpdated: new Date().toISOString(),
      }),
    };
  }

  if (q.view === 'admin' && !adminOk) {
    return {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Admin key required for internal cost view' }),
    };
  }

  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildPublicPayload(summary, DAILY_ROLLUPS, hourlyUsage)),
  };
}
