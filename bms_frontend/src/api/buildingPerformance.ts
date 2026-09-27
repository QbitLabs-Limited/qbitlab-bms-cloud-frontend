import { api } from "./http";
import type {
  BuildingPerformanceAnnualQuery,
  BuildingPerformanceCalculationQuery,
  BuildingPerformanceEnergyBreakdownQuery,
  BuildingPerformanceEnergyBreakdownResponse,
  BuildingPerformanceMeterAssignmentRequest,
  BuildingPerformanceMeterAssignmentResponse,
  BuildingPerformanceMonthlyQuery,
  BuildingPerformanceProfileRequest,
  BuildingPerformanceProfileResponse,
  BuildingPerformanceRatingQuery,
  BuildingPerformanceRatingResponse,
  BuildingPerformanceResult,
  BuildingPerformanceScopeQuery,
  BuildingPerformanceSummaryQuery,
} from "@/types/buildingPerformance";

function basePath(siteId: string): string {
  return `/api/sites/${encodeURIComponent(siteId)}/building-performance`;
}

function scopeParams(query: BuildingPerformanceScopeQuery): URLSearchParams {
  return new URLSearchParams({ ratingScope: query.ratingScope });
}

function calculationParams(query: BuildingPerformanceCalculationQuery): URLSearchParams {
  const params = scopeParams(query);
  if (query.timestampInterpretation !== undefined) {
    params.set("timestampInterpretation", query.timestampInterpretation);
  }
  if (query.maxGap !== undefined) params.set("maxGap", query.maxGap);
  return params;
}

function summaryParams(query: BuildingPerformanceSummaryQuery): URLSearchParams {
  const params = calculationParams(query);
  params.set("endingMonth", query.endingMonth);
  return params;
}

// Explicit wire bodies prevent navigation context or extra properties leaking into requests.
function profileBody(request: BuildingPerformanceProfileRequest): string {
  return JSON.stringify({
    buildingName: request.buildingName,
    ratingScope: request.ratingScope,
    rentableAreaM2: request.rentableAreaM2,
    weeklyOccupancyHours: request.weeklyOccupancyHours,
    computerCount: request.computerCount,
    targetRating: request.targetRating,
    assessmentEnabled: request.assessmentEnabled,
  });
}

function assignmentBody(request: BuildingPerformanceMeterAssignmentRequest): string {
  return JSON.stringify({
    energyMeterId: request.energyMeterId,
    consumptionCategory: request.consumptionCategory,
    included: request.included,
    allocationPercent: request.allocationPercent,
    notes: request.notes,
  });
}

export const BuildingPerformanceApi = {
  getProfile(siteId: string, query: BuildingPerformanceScopeQuery) {
    return api<BuildingPerformanceProfileResponse>(
      `${basePath(siteId)}/profile?${scopeParams(query)}`,
      { handle403Redirect: false }
    );
  },

  createProfile(siteId: string, request: BuildingPerformanceProfileRequest) {
    return api<BuildingPerformanceProfileResponse>(`${basePath(siteId)}/profile`, {
      method: "POST",
      body: profileBody(request),
      handle403Redirect: false,
    });
  },

  updateProfile(siteId: string, request: BuildingPerformanceProfileRequest) {
    return api<BuildingPerformanceProfileResponse>(
      `${basePath(siteId)}/profile?${scopeParams(request)}`,
      { method: "PUT", body: profileBody(request), handle403Redirect: false }
    );
  },

  getMeterAssignments(siteId: string, query: BuildingPerformanceScopeQuery) {
    return api<BuildingPerformanceMeterAssignmentResponse[]>(
      `${basePath(siteId)}/meters?${scopeParams(query)}`,
      { handle403Redirect: false }
    );
  },

  createMeterAssignment(
    siteId: string,
    query: BuildingPerformanceScopeQuery,
    request: BuildingPerformanceMeterAssignmentRequest
  ) {
    return api<BuildingPerformanceMeterAssignmentResponse>(
      `${basePath(siteId)}/meters?${scopeParams(query)}`,
      { method: "POST", body: assignmentBody(request), handle403Redirect: false }
    );
  },

  updateMeterAssignment(
    siteId: string,
    assignmentId: string,
    query: BuildingPerformanceScopeQuery,
    request: BuildingPerformanceMeterAssignmentRequest
  ) {
    return api<BuildingPerformanceMeterAssignmentResponse>(
      `${basePath(siteId)}/meters/${encodeURIComponent(assignmentId)}?${scopeParams(query)}`,
      { method: "PUT", body: assignmentBody(request), handle403Redirect: false }
    );
  },

  deleteMeterAssignment(
    siteId: string,
    assignmentId: string,
    query: BuildingPerformanceScopeQuery
  ) {
    return api<void>(
      `${basePath(siteId)}/meters/${encodeURIComponent(assignmentId)}?${scopeParams(query)}`,
      { method: "DELETE", handle403Redirect: false }
    );
  },

  getSummary(siteId: string, query: BuildingPerformanceSummaryQuery) {
    return api<BuildingPerformanceResult>(
      `${basePath(siteId)}/summary?${summaryParams(query)}`,
      { handle403Redirect: false }
    );
  },

  getMonthlyPerformance(siteId: string, query: BuildingPerformanceMonthlyQuery) {
    const params = calculationParams(query);
    params.set("from", query.from);
    params.set("to", query.to);
    return api<BuildingPerformanceResult[]>(
      `${basePath(siteId)}/monthly?${params}`,
      { handle403Redirect: false }
    );
  },

  getAnnualPerformance(siteId: string, query: BuildingPerformanceAnnualQuery) {
    const params = calculationParams(query);
    params.set("from", query.from);
    params.set("to", query.to);
    return api<BuildingPerformanceResult[]>(
      `${basePath(siteId)}/annual?${params}`,
      { handle403Redirect: false }
    );
  },

  getRating(siteId: string, query: BuildingPerformanceRatingQuery) {
    return api<BuildingPerformanceRatingResponse>(
      `${basePath(siteId)}/rating?${summaryParams(query)}`,
      { handle403Redirect: false }
    );
  },

  getEnergyBreakdown(siteId: string, query: BuildingPerformanceEnergyBreakdownQuery) {
    const params = calculationParams(query);
    params.set("periodType", query.periodType);
    switch (query.periodType) {
      case "MONTHLY":
        params.set("month", query.month);
        break;
      case "ANNUAL":
        params.set("year", query.year);
        break;
      case "ROLLING_12_MONTH":
        params.set("endingMonth", query.endingMonth);
        break;
    }
    return api<BuildingPerformanceEnergyBreakdownResponse>(
      `${basePath(siteId)}/energy-breakdown?${params}`,
      { handle403Redirect: false }
    );
  },
};
