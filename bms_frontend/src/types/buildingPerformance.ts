/** Wire values accepted by the Building Performance API. */
export type BuildingPerformanceRatingScope =
  | "BASE_BUILDING"
  | "TENANCY"
  | "WHOLE_BUILDING";

export type BuildingPerformanceTimestampInterpretation = "UTC" | "SITE_LOCAL";

export type BuildingPerformanceConsumptionCategory =
  | "MAIN"
  | "HVAC"
  | "LIGHTING"
  | "LIFTS"
  | "TENANT"
  | "COMMON_AREA"
  | "DATA_CENTRE"
  | "OTHER";

export type BuildingPerformancePeriodType =
  | "MONTHLY"
  | "ANNUAL"
  | "ROLLING_12_MONTH";

export type BuildingPerformanceScopeQuery = {
  ratingScope: BuildingPerformanceRatingScope;
};

export type BuildingPerformanceCalculationQuery = BuildingPerformanceScopeQuery & {
  timestampInterpretation?: BuildingPerformanceTimestampInterpretation;
  /** ISO-8601 duration, e.g. PT15M or PT1H; no frontend default. */
  maxGap?: string;
};

export type BuildingPerformanceSummaryQuery = BuildingPerformanceCalculationQuery & {
  /** YYYY-MM */
  endingMonth: string;
};

export type BuildingPerformanceRatingQuery = BuildingPerformanceSummaryQuery;

export type BuildingPerformanceMonthlyQuery = BuildingPerformanceCalculationQuery & {
  /** YYYY-MM */
  from: string;
  /** YYYY-MM */
  to: string;
};

export type BuildingPerformanceAnnualQuery = BuildingPerformanceCalculationQuery & {
  /** YYYY */
  from: string;
  /** YYYY */
  to: string;
};

export type BuildingPerformanceEnergyBreakdownQuery =
  BuildingPerformanceCalculationQuery & (
    | { periodType: "MONTHLY"; month: string; year?: never; endingMonth?: never }
    | { periodType: "ANNUAL"; year: string; month?: never; endingMonth?: never }
    | { periodType: "ROLLING_12_MONTH"; endingMonth: string; month?: never; year?: never }
  );

/** Nested detail contracts are not yet confirmed; preserve their wire values. */
export type BuildingPerformanceCategories = Record<string, unknown>;

export type BuildingPerformanceResult = {
  tenantId: string;
  siteId: string;
  profileId: string;
  ratingScope: BuildingPerformanceRatingScope;
  periodType: BuildingPerformancePeriodType;
  /** YYYY-MM-DD */
  periodStart: string;
  /** YYYY-MM-DD */
  periodEnd: string;
  siteTimezone: string;
  options: {
    timestampInterpretation: BuildingPerformanceTimestampInterpretation;
    /** ISO-8601 duration */
    maxGap: string;
  };
  consumption: {
    totalEnergyKwh: number | null;
    dataCoveragePercent: number;
    totalSource: string;
    categories: BuildingPerformanceCategories;
    meters: unknown[];
    qualityIssues: unknown[];
  };
  rentableAreaM2: number;
  energyIntensityKwhPerM2: number | null;
  targetRating: number | null;
  estimatedRating: number | null;
};

export type BuildingPerformanceRatingResponse = {
  tenantId: string;
  siteId: string;
  profileId: string;
  ratingScope: BuildingPerformanceRatingScope;
  periodType: "ROLLING_12_MONTH";
  periodStart: string;
  periodEnd: string;
  siteTimezone: string;
  timestampInterpretation: BuildingPerformanceTimestampInterpretation;
  /** ISO-8601 duration */
  maxGap: string;
  label: string;
  status: string;
  reason: string | null;
  estimatedRating: number | null;
  targetRating: number | null;
  energyIntensityKwhPerM2: number | null;
  dataCoveragePercent: number;
  qualityIssues: unknown[];
};

export type BuildingPerformanceEnergyBreakdownResponse = {
  tenantId: string;
  siteId: string;
  profileId: string;
  ratingScope: BuildingPerformanceRatingScope;
  periodType: BuildingPerformancePeriodType;
  periodStart: string;
  periodEnd: string;
  siteTimezone: string;
  timestampInterpretation: BuildingPerformanceTimestampInterpretation;
  /** ISO-8601 duration */
  maxGap: string;
  totalEnergyKwh: number | null;
  totalSource: string;
  categories: BuildingPerformanceCategories;
  dataCoveragePercent: number;
  qualityIssues: unknown[];
};

export type BuildingPerformanceProfileRequest = {
  buildingName: string;
  ratingScope: BuildingPerformanceRatingScope;
  rentableAreaM2: number;
  weeklyOccupancyHours: number | null;
  computerCount: number | null;
  targetRating: number | null;
  assessmentEnabled: boolean;
};

export type BuildingPerformanceProfileResponse = BuildingPerformanceProfileRequest & {
  id: string;
  tenantId: string;
  siteId: string;
  createdAt: string;
  updatedAt: string;
};

export type BuildingPerformanceMeterAssignmentRequest = {
  energyMeterId: string;
  consumptionCategory: BuildingPerformanceConsumptionCategory;
  included: boolean;
  allocationPercent: number;
  notes: string | null;
};

export type BuildingPerformanceMeterAssignmentResponse = {
  id: string;
  profileId: string;
  energyMeterId: string;
  consumptionCategory: string;
  ratingScope: BuildingPerformanceRatingScope;
  included: boolean;
  allocationPercent: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
