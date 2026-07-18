/**
 * Access4All / ForgeOS LLM cost sample data — drives /api/costs when no live tracker is wired.
 */

const AGENTS = [
  'ceo-agent',
  'architect-agent',
  'builder-agent',
  'qa-agent',
  'verification-agent',
  'designer-agent',
];

function emptyDetail() {
  return {
    totalCostUsd: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    callCount: 0,
    avgCostPerCall: 0,
    avgRuntimeMs: 0,
    totalRuntimeMs: 0,
  };
}

function addDetail(target, event) {
  target.totalCostUsd += event.estimatedCostUsd;
  target.inputTokens += event.inputTokens;
  target.outputTokens += event.outputTokens;
  target.totalTokens += event.inputTokens + event.outputTokens;
  target.callCount += 1;
  target.totalRuntimeMs += event.runtimeMs ?? 0;
  target.avgCostPerCall = target.totalCostUsd / target.callCount;
  target.avgRuntimeMs = target.totalRuntimeMs / target.callCount;
}

function summarizeEvents(events) {
  const byProvider = {};
  const byModel = {};
  const byAgent = {};

  let totalCostUsd = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalRuntimeMs = 0;
  let minRuntimeMs = null;
  let maxRuntimeMs = null;

  for (const e of events) {
    totalCostUsd += e.estimatedCostUsd;
    totalInputTokens += e.inputTokens;
    totalOutputTokens += e.outputTokens;
    totalRuntimeMs += e.runtimeMs ?? 0;
    if (e.runtimeMs != null) {
      minRuntimeMs = minRuntimeMs == null ? e.runtimeMs : Math.min(minRuntimeMs, e.runtimeMs);
      maxRuntimeMs = maxRuntimeMs == null ? e.runtimeMs : Math.max(maxRuntimeMs, e.runtimeMs);
    }

    if (!byProvider[e.provider]) byProvider[e.provider] = emptyDetail();
    if (!byModel[e.model]) byModel[e.model] = emptyDetail();
    if (!byAgent[e.agentRole]) byAgent[e.agentRole] = emptyDetail();

    addDetail(byProvider[e.provider], e);
    addDetail(byModel[e.model], e);
    addDetail(byAgent[e.agentRole], e);
  }

  const totalCalls = events.length;
  return {
    totalCostUsd,
    totalInputTokens,
    totalOutputTokens,
    totalTokens: totalInputTokens + totalOutputTokens,
    totalCalls,
    averageCostPerCall: totalCalls ? totalCostUsd / totalCalls : 0,
    totalRuntimeMs,
    averageRuntimeMs: totalCalls ? totalRuntimeMs / totalCalls : 0,
    minRuntimeMs,
    maxRuntimeMs,
    byProvider,
    byModel,
    byAgent,
  };
}

/** Rich event log — 7 days of Forge pipeline activity for Access4All */
export const COST_EVENTS = [
  { id: 'evt-101', sessionId: 'sess-access4all-0714', agentRole: 'ceo-agent', provider: 'anthropic', model: 'claude-opus-4-8', inputTokens: 4200, outputTokens: 1850, estimatedCostUsd: 0.34, timestamp: '2026-07-14T08:12:00.000Z', date: '2026-07-14', purpose: 'Frontier design + ceiling contract', taskName: 'access4all-planning', runtimeMs: 5120 },
  { id: 'evt-102', sessionId: 'sess-access4all-0714', agentRole: 'architect-agent', provider: 'anthropic', model: 'claude-sonnet-5-thinking-high', inputTokens: 3100, outputTokens: 1420, estimatedCostUsd: 0.13, timestamp: '2026-07-14T08:45:00.000Z', date: '2026-07-14', purpose: 'Supabase schema + API design', taskName: 'access4all-architecture', runtimeMs: 3890 },
  { id: 'evt-103', sessionId: 'sess-access4all-0714', agentRole: 'builder-agent', provider: 'anthropic', model: 'claude-sonnet-5-thinking-high', inputTokens: 8900, outputTokens: 4200, estimatedCostUsd: 0.39, timestamp: '2026-07-14T09:30:00.000Z', date: '2026-07-14', purpose: 'Search + property detail implementation', taskName: 'access4all-build', runtimeMs: 8450 },
  { id: 'evt-104', sessionId: 'sess-access4all-0714', agentRole: 'designer-agent', provider: 'openai', model: 'gpt-4o', inputTokens: 2400, outputTokens: 980, estimatedCostUsd: 0.11, timestamp: '2026-07-14T10:05:00.000Z', date: '2026-07-14', purpose: 'Access4All landing redesign', taskName: 'access4all-design', runtimeMs: 2980 },
  { id: 'evt-105', sessionId: 'sess-access4all-0714', agentRole: 'qa-agent', provider: 'openai', model: 'gpt-4o-mini', inputTokens: 5200, outputTokens: 1100, estimatedCostUsd: 0.04, timestamp: '2026-07-14T10:40:00.000Z', date: '2026-07-14', purpose: 'Consumer product + trial gate checks', taskName: 'access4all-qa', runtimeMs: 2100 },
  { id: 'evt-106', sessionId: 'sess-access4all-0714', agentRole: 'verification-agent', provider: 'anthropic', model: 'claude-haiku-4-5', inputTokens: 1800, outputTokens: 620, estimatedCostUsd: 0.01, timestamp: '2026-07-14T11:15:00.000Z', date: '2026-07-14', purpose: 'Proof layer evidence packaging', taskName: 'access4all-proof', runtimeMs: 1650 },
  { id: 'evt-107', sessionId: 'sess-access4all-0714', agentRole: 'builder-agent', provider: 'anthropic', model: 'claude-sonnet-5-thinking-high', inputTokens: 6400, outputTokens: 2800, estimatedCostUsd: 0.28, timestamp: '2026-07-14T13:20:00.000Z', date: '2026-07-14', purpose: 'Wheelmap + Monad integration', taskName: 'access4all-integrations', runtimeMs: 6200 },
  { id: 'evt-108', sessionId: 'sess-access4all-0714', agentRole: 'builder-agent', provider: 'xai', model: 'grok-beta', inputTokens: 2200, outputTokens: 890, estimatedCostUsd: 0.009, timestamp: '2026-07-14T15:00:00.000Z', date: '2026-07-14', purpose: 'Deploy + live URL verification', taskName: 'access4all-ship', runtimeMs: 2400 },

  { id: 'evt-091', sessionId: 'sess-access4all-0713', agentRole: 'ceo-agent', provider: 'anthropic', model: 'claude-opus-4-8', inputTokens: 3800, outputTokens: 1600, estimatedCostUsd: 0.31, timestamp: '2026-07-13T09:00:00.000Z', date: '2026-07-13', purpose: 'Vite migration planning', taskName: 'accesslink-migration', runtimeMs: 4800 },
  { id: 'evt-092', sessionId: 'sess-access4all-0713', agentRole: 'builder-agent', provider: 'anthropic', model: 'claude-sonnet-5-thinking-high', inputTokens: 12000, outputTokens: 5400, estimatedCostUsd: 0.52, timestamp: '2026-07-13T11:30:00.000Z', date: '2026-07-13', purpose: 'Next.js to Vite conversion', taskName: 'accesslink-vite', runtimeMs: 9200 },
  { id: 'evt-093', sessionId: 'sess-access4all-0713', agentRole: 'qa-agent', provider: 'openai', model: 'gpt-4o', inputTokens: 4100, outputTokens: 1200, estimatedCostUsd: 0.14, timestamp: '2026-07-13T14:00:00.000Z', date: '2026-07-13', purpose: 'Router + API regression', taskName: 'accesslink-api-qa', runtimeMs: 3400 },

  { id: 'evt-081', sessionId: 'sess-access4all-0712', agentRole: 'designer-agent', provider: 'openai', model: 'gpt-4o', inputTokens: 2900, outputTokens: 1100, estimatedCostUsd: 0.12, timestamp: '2026-07-12T10:00:00.000Z', date: '2026-07-12', purpose: 'Forge design tokens integration', taskName: 'accesslink-design', runtimeMs: 3100 },
  { id: 'evt-082', sessionId: 'sess-access4all-0712', agentRole: 'builder-agent', provider: 'anthropic', model: 'claude-haiku-4-5', inputTokens: 4500, outputTokens: 2100, estimatedCostUsd: 0.03, timestamp: '2026-07-12T15:30:00.000Z', date: '2026-07-12', purpose: 'Cost dashboard scaffold', taskName: 'cost-dashboard-v1', runtimeMs: 2800 },

  { id: 'evt-071', sessionId: 'sess-access4all-0711', agentRole: 'verification-agent', provider: 'anthropic', model: 'claude-sonnet-5-thinking-high', inputTokens: 5600, outputTokens: 2400, estimatedCostUsd: 0.22, timestamp: '2026-07-11T09:30:00.000Z', date: '2026-07-11', purpose: 'SE + design verify loop', taskName: 'accesslink-gates', runtimeMs: 5100 },
  { id: 'evt-072', sessionId: 'sess-access4all-0711', agentRole: 'architect-agent', provider: 'openai', model: 'gpt-4o-mini', inputTokens: 3200, outputTokens: 900, estimatedCostUsd: 0.02, timestamp: '2026-07-11T16:00:00.000Z', date: '2026-07-11', purpose: 'Monad contract interface review', taskName: 'monad-review', runtimeMs: 1900 },

  { id: 'evt-061', sessionId: 'sess-access4all-0710', agentRole: 'ceo-agent', provider: 'anthropic', model: 'claude-opus-4-8', inputTokens: 2900, outputTokens: 1300, estimatedCostUsd: 0.24, timestamp: '2026-07-10T08:00:00.000Z', date: '2026-07-10', purpose: 'Intake enrichment', taskName: 'accesslink-intake', runtimeMs: 4200 },
  { id: 'evt-062', sessionId: 'sess-access4all-0710', agentRole: 'builder-agent', provider: 'anthropic', model: 'claude-sonnet-5-thinking-high', inputTokens: 7800, outputTokens: 3600, estimatedCostUsd: 0.35, timestamp: '2026-07-10T12:00:00.000Z', date: '2026-07-10', purpose: 'Initial property search MVP', taskName: 'accesslink-mvp', runtimeMs: 7100 },
];

export const COST_SUMMARY = summarizeEvents(COST_EVENTS);

const DATES = ['2026-07-10', '2026-07-11', '2026-07-12', '2026-07-13', '2026-07-14'];

export const DAILY_ROLLUPS = DATES.map((date) => {
  const dayEvents = COST_EVENTS.filter((e) => e.date === date);
  return { date, summary: summarizeEvents(dayEvents), events: dayEvents };
});

/** Hourly token usage for the most recent day (real bucketing from events) */
export function buildHourlyUsage(events, date = '2026-07-14') {
  const buckets = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${hour.toString().padStart(2, '0')}:00`,
    calls: 0,
    tokens: 0,
    costUsd: 0,
  }));

  for (const e of events) {
    if (e.date !== date) continue;
    const hour = new Date(e.timestamp).getUTCHours();
    const b = buckets[hour];
    b.calls += 1;
    b.tokens += e.inputTokens + e.outputTokens;
    b.costUsd += e.estimatedCostUsd;
  }

  return buckets;
}

export function filterEvents(events, { agent, from, to } = {}) {
  return events.filter((e) => {
    if (agent && e.agentRole !== agent) return false;
    if (from && e.date < from) return false;
    if (to && e.date > to) return false;
    return true;
  });
}

export function eventsToCsv(events) {
  const header = [
    'id', 'timestamp', 'date', 'agentRole', 'provider', 'model',
    'inputTokens', 'outputTokens', 'estimatedCostUsd', 'runtimeMs',
    'purpose', 'taskName', 'sessionId',
  ].join(',');
  const rows = events.map((e) =>
    [
      e.id, e.timestamp, e.date, e.agentRole, e.provider, e.model,
      e.inputTokens, e.outputTokens, e.estimatedCostUsd.toFixed(6),
      e.runtimeMs ?? '', `"${(e.purpose ?? '').replace(/"/g, '""')}"`,
      `"${(e.taskName ?? '').replace(/"/g, '""')}"`, e.sessionId,
    ].join(','),
  );
  return [header, ...rows].join('\n');
}

export function agentsToCsv(summary) {
  const header = 'agent,totalCostUsd,callCount,totalTokens,inputTokens,outputTokens,avgCostPerCall,avgRuntimeMs';
  const rows = Object.entries(summary.byAgent).map(([agent, d]) =>
    [agent, d.totalCostUsd.toFixed(4), d.callCount, d.totalTokens, d.inputTokens, d.outputTokens, d.avgCostPerCall.toFixed(6), d.avgRuntimeMs.toFixed(0)].join(','),
  );
  return [header, ...rows].join('\n');
}

export function buildMarkdownReport(summary, events, dailyRollups) {
  const lines = [
    '# Access4All LLM Cost Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    `- Total cost: $${summary.totalCostUsd.toFixed(2)}`,
    `- Total calls: ${summary.totalCalls}`,
    `- Total tokens: ${summary.totalTokens.toLocaleString()}`,
    `- Avg latency: ${summary.averageRuntimeMs.toFixed(0)} ms`,
    '',
    '## Per-agent breakdown',
    '',
    '| Agent | Calls | Tokens | Cost | Avg/call |',
    '|-------|-------|--------|------|----------|',
  ];

  for (const [agent, d] of Object.entries(summary.byAgent).sort((a, b) => b[1].totalCostUsd - a[1].totalCostUsd)) {
    lines.push(`| ${agent} | ${d.callCount} | ${d.totalTokens.toLocaleString()} | $${d.totalCostUsd.toFixed(2)} | $${d.avgCostPerCall.toFixed(4)} |`);
  }

  lines.push('', '## Daily trend', '');
  for (const r of dailyRollups) {
    lines.push(`- ${r.date}: $${r.summary.totalCostUsd.toFixed(2)} (${r.summary.totalCalls} calls)`);
  }

  lines.push('', `## Recent events (${Math.min(events.length, 10)} shown)`, '');
  for (const e of events.slice(0, 10)) {
    lines.push(`- ${e.timestamp} **${e.agentRole}** ${e.model} — $${e.estimatedCostUsd.toFixed(4)} (${e.inputTokens + e.outputTokens} tokens)`);
  }

  return lines.join('\n');
}

export { AGENTS, summarizeEvents };
