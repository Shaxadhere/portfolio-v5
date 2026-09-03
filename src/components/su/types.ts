import { TimelinePoint, CountryStat, CityStat, BreakdownStat } from "./AnalyticsCharts";
import { VisitorSessionRecord } from "./VisitorSessionDetailModal";

export type TimeRangeType = "24h" | "7d" | "30d" | "all";

export type VisitorFilterType =
  | "all"
  | "human"
  | "bot"
  | "resume_downloaded"
  | "has_query_params"
  | "mobile"
  | "desktop"
  | "projects_clicked";

export type DownloadFilterType = "all" | "human" | "bot" | "mobile" | "desktop";

export interface PaginationState {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnalyticsResponse {
  metrics: {
    totalDownloads: number;
    countLast24h: number;
    countLast7d: number;
    countLast30d: number;
    uniqueIpsCount: number;
    humanCount: number;
    botCount: number;
    humanRatio: number;
  };
  timeline: TimelinePoint[];
  countries: CountryStat[];
  cities: CityStat[];
  os: BreakdownStat[];
  browsers: BreakdownStat[];
  devices: BreakdownStat[];
  referrers: BreakdownStat[];
}

export interface VisitorsResponse {
  metrics: {
    totalSessions: number;
    totalPageViews: number;
    uniqueVisitors: number;
    avgDurationSeconds: number;
    avgScrollDepth: number;
    bounceRate: number;
    humanCount: number;
    botCount: number;
    humanRatio: number;
    totalProjectClicks: number;
    downloadedResumeCount?: number;
    resumeConversionRate?: number;
  };
  topProjects: Array<{ name: string; count: number }>;
  pageBreakdown: Array<{ path: string; count: number; percentage: number }>;
  sectionBreakdown: Array<{ section: string; count: number; percentage: number }>;
  campaignBreakdown?: Array<{ source: string; count: number; percentage: number }>;
  roleDistribution: Record<string, number>;
  timeline: TimelinePoint[];
  pagination: PaginationState;
  sessions: VisitorSessionRecord[];
}

export interface SuDashboardProps {
  username?: string;
  onLogout: () => void;
}
