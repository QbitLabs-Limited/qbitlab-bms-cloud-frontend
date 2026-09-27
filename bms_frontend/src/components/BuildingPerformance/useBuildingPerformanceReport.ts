import { useEffect, useRef, useState } from "react";
import { BuildingPerformanceApi } from "@/api/buildingPerformance";
import type {
  BuildingPerformanceResult,
  BuildingPerformanceRatingResponse,
  BuildingPerformanceSummaryQuery,
} from "@/types/buildingPerformance";
import { reportError } from "./buildingPerformanceUi";

export type ReportState<T> = {
  loading: boolean;
  data: T | null;
  error: string | null;
};

function empty<T>(): ReportState<T> {
  return { loading: false, data: null, error: null };
}

export function useBuildingPerformanceReport(siteId: string) {
  const [applied, setApplied] = useState<BuildingPerformanceSummaryQuery | null>(null);
  const [summary, setSummary] = useState<ReportState<BuildingPerformanceResult>>(empty);
  const [readiness, setReadiness] = useState<ReportState<BuildingPerformanceRatingResponse>>(empty);
  const generation = useRef(0);
  const summaryRequest = useRef(0);
  const readinessRequest = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current++;
    };
  }, []);

  async function loadSummary(query: BuildingPerformanceSummaryQuery, version: number) {
    const request = ++summaryRequest.current;
    setSummary({ loading: true, data: null, error: null });
    try {
      const data = await BuildingPerformanceApi.getSummary(siteId, query);
      if (mounted.current && version === generation.current && request === summaryRequest.current) {
        setSummary({ loading: false, data: data ?? null, error: null });
      }
    } catch (error) {
      if (mounted.current && version === generation.current && request === summaryRequest.current) {
        setSummary({ loading: false, data: null, error: reportError(error) });
      }
    }
  }

  async function loadReadiness(query: BuildingPerformanceSummaryQuery, version: number) {
    const request = ++readinessRequest.current;
    setReadiness({ loading: true, data: null, error: null });
    try {
      const data = await BuildingPerformanceApi.getRating(siteId, query);
      if (mounted.current && version === generation.current && request === readinessRequest.current) {
        setReadiness({ loading: false, data: data ?? null, error: null });
      }
    } catch (error) {
      if (mounted.current && version === generation.current && request === readinessRequest.current) {
        setReadiness({ loading: false, data: null, error: reportError(error) });
      }
    }
  }

  function load(query: BuildingPerformanceSummaryQuery) {
    const snapshot = { ...query };
    const version = ++generation.current;
    setApplied(snapshot);
    void loadSummary(snapshot, version);
    void loadReadiness(snapshot, version);
  }

  return {
    applied, summary, readiness, load,
    retrySummary: () => { if (applied) void loadSummary(applied, generation.current); },
    retryReadiness: () => { if (applied) void loadReadiness(applied, generation.current); },
  };
}
