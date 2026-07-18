export type PublicCostSummary = {
  totalCostUsd: number;
  totalCalls: number;
  averageRuntimeMs: number;
  averageRuntimeSec: number;
};

export type PublicDailyPoint = {
  date: string;
  label: string;
  costUsd: number;
  calls: number;
  /** 0–1 normalized height for charts */
  relative: number;
};

export type PublicActivityPoint = {
  hour: number;
  label: string;
  calls: number;
  /** 0–1 normalized activity */
  relative: number;
};

export type PublicCostDashboardData = {
  view: 'public';
  summary: PublicCostSummary;
  dailyTrend: PublicDailyPoint[];
  activityTrend: PublicActivityPoint[];
  valueHighlights: {
    headline: string;
    subhead: string;
    bullets: string[];
  };
  lastUpdated: string;
  measurement: string;
};
