export type CostSummaryDetail = {
  totalCostUsd: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  callCount: number;
  avgCostPerCall: number;
  avgRuntimeMs: number;
  totalRuntimeMs: number;
};

export type CostSummary = {
  totalCostUsd: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCalls: number;
  averageCostPerCall: number;
  totalRuntimeMs: number;
  averageRuntimeMs: number;
  minRuntimeMs: number | null;
  maxRuntimeMs: number | null;
  byProvider: Record<string, CostSummaryDetail>;
  byModel: Record<string, CostSummaryDetail>;
  byAgent: Record<string, CostSummaryDetail>;
};

export type CostEvent = {
  id: string;
  sessionId: string;
  agentRole: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  timestamp: string;
  date: string;
  purpose?: string;
  taskName?: string;
  runtimeMs?: number;
};

export type DailyRollup = {
  date: string;
  summary: CostSummary;
  events: CostEvent[];
};

export type HourlyBucket = {
  hour: number;
  label: string;
  calls: number;
  tokens: number;
  costUsd: number;
};

export type CostDashboardData = {
  summary: CostSummary;
  events: CostEvent[];
  dailyRollups: DailyRollup[];
  hourlyUsage: HourlyBucket[];
  agents: string[];
  lastUpdated: string;
  measurement: string;
};
