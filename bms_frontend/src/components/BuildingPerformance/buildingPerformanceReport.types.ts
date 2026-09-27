import type { BuildingPerformanceResult, BuildingPerformanceRatingResponse, BuildingPerformanceSummaryQuery, BuildingPerformanceMonthlyQuery, BuildingPerformanceAnnualQuery, BuildingPerformanceEnergyBreakdownQuery, BuildingPerformanceEnergyBreakdownResponse, BuildingPerformanceRatingScope, BuildingPerformanceProfileResponse, BuildingPerformanceMeterAssignmentResponse } from "@/types/buildingPerformance";

export type ReportSection<T, Q = never> = { data: T | null; loading: boolean; error: string | null; query?: Q | null };
export type ChartReportData = {
  siteId: string;
  appliedKey: string;
  monthly: ReportSection<BuildingPerformanceResult[], BuildingPerformanceMonthlyQuery>;
  annual: ReportSection<BuildingPerformanceResult[], BuildingPerformanceAnnualQuery>;
  breakdown: ReportSection<BuildingPerformanceEnergyBreakdownResponse, BuildingPerformanceEnergyBreakdownQuery>;
};
export type ConfigurationReportData = {
  siteId: string;
  scope: BuildingPerformanceRatingScope;
  profile: BuildingPerformanceProfileResponse | null;
  assignments: BuildingPerformanceMeterAssignmentResponse[];
  loading: boolean;
  busy: boolean;
  missing: boolean;
  error: string | null;
  assignmentError: string | null;
};
export type BuildingPerformanceReportSnapshot = {
  siteId: string;
  siteName?: string;
  generatedAt: string;
  applied: BuildingPerformanceSummaryQuery;
  summary: ReportSection<BuildingPerformanceResult>;
  readiness: ReportSection<BuildingPerformanceRatingResponse>;
  charts: ChartReportData | null;
  configuration: ConfigurationReportData | null;
};
