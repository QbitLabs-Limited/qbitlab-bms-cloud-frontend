/** Wire values accepted by the Building Performance API. */
export type BuildingPerformanceRatingScope =
  | "BASE_BUILDING"
  | "TENANCY"
  | "WHOLE_BUILDING";

export type BuildingPerformanceTimestampInterpretation = "UTC" | "SITE_LOCAL";

/** Suggested known categories only; the API also accepts other category strings. */
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
  timestampInterpretation: BuildingPerformanceTimestampInterpretation;
  /** ISO-8601 duration, e.g. PT15M or PT1H; no frontend default. */
  maxGap: string;
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

export type TotalSource = "MAIN_METERS" | "CATEGORY_METERS" | "NO_INCLUDED_METERS";

export type QualityIssue =
  | "NO_INCLUDED_METERS"
  | "NO_TELEMETRY"
  | "NO_VALID_INTERVALS"
  | "INCOMPLETE_COVERAGE"
  | "UNCOVERED_START"
  | "UNCOVERED_END"
  | "GAP_EXCEEDS_MAXIMUM"
  | "COUNTER_RESET"
  | "INVALID_READING"
  | "CONFLICTING_TIMESTAMP"
  | "NON_INCREASING_TIMESTAMP"
  | "FUTURE_PERIOD"
  | "SITE_LOCAL_TIMESTAMPS";

export type CategoryResult = {
  energyKwh: number | null;
  dataCoveragePercent: number;
};

export type MeterResult = {
  energyMeterId: string;
  category: string;
  allocationPercent: number;
  energyKwh: number | null;
  dataCoveragePercent: number;
  resetCount: number;
  qualityIssues: QualityIssue[];
};

export type BuildingPerformanceCategories = Record<string, CategoryResult>;

export type EnergyConsumptionAggregationResult = {
  totalEnergyKwh: number | null;
  dataCoveragePercent: number;
  totalSource: TotalSource;
  categories: BuildingPerformanceCategories;
  meters: MeterResult[];
  qualityIssues: QualityIssue[];
};

export type BuildingPerformanceRatingStatus = "READY" | "NOT_READY" | "INSUFFICIENT_DATA";
export type Completeness = "COMPLETE" | "PARTIAL" | "UNAVAILABLE";
export type Outcome = "PASS" | "FAIL" | "WARNING" | "NOT_APPLICABLE" | "NOT_EVALUATED";
export type Blocking = "NONE" | "CONFIGURATION" | "DATA";

export type Requirement = {
  code: string;
  field: string;
  outcome: Outcome;
  blocking: Blocking;
  reason: string;
  energyMeterId: string | null;
};

export type Limitation = {
  code: string;
  reason: string;
};

export type Policy = {
  id: string;
  optionsSource: string;
  completenessRule: string;
  meaning: string;
};

export type MeterReadiness = MeterResult & {
  energyCompleteness: Completeness;
  gapFlags: QualityIssue[];
};

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
  consumption: EnergyConsumptionAggregationResult;
  rentableAreaM2: number;
  energyIntensityKwhPerM2: number | null;
  targetRating: number | null;
  estimatedRating: number | null;
};

export type BuildingPerformanceRatingResponse = {
  tenantId: string;
  siteId: string;
  profileId: string | null;
  ratingScope: BuildingPerformanceRatingScope;
  periodType: "ROLLING_12_MONTH";
  periodStart: string;
  /** Exclusive period boundary, YYYY-MM-DD. */
  periodEnd: string;
  siteTimezone: string | null;
  timestampInterpretation: BuildingPerformanceTimestampInterpretation;
  /** ISO-8601 duration */
  maxGap: string;
  /** Backend-provided label; currently "QbitLabs Data Readiness". */
  label: string;
  status: BuildingPerformanceRatingStatus;
  reason: string | null;
  /** Currently always null, including when readiness status is READY. */
  estimatedRating: number | null;
  targetRating: number | null;
  energyIntensityKwhPerM2: number | null;
  dataCoveragePercent: number | null;
  qualityIssues: QualityIssue[];
  readinessPolicy: Policy;
  energyCompleteness: Completeness;
  totalEnergyKwh: number | null;
  totalSource: TotalSource | null;
  gapFlags: QualityIssue[];
  meters: MeterReadiness[];
  requirements: Requirement[];
  limitations: Limitation[];
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
  totalSource: TotalSource;
  categories: BuildingPerformanceCategories;
  dataCoveragePercent: number;
  qualityIssues: QualityIssue[];
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
  consumptionCategory: string;
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
