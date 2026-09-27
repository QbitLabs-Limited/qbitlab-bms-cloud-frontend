import { useEffect, useRef, useState } from "react";
import { BuildingPerformanceApi } from "@/api/buildingPerformance";
import type { BuildingPerformanceMonthlyQuery, BuildingPerformanceAnnualQuery, BuildingPerformanceEnergyBreakdownQuery } from "@/types/buildingPerformance";
import { reportError } from "./buildingPerformanceUi";

function useChartRequest<Q, T>(request: (siteId: string, query: Q) => Promise<T>, siteId: string) {
  const [state, setState] = useState<{ loading: boolean; error: string | null; data: T | null; query: Q | null }>({ loading: false, error: null, data: null, query: null });
  const sequence = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; sequence.current++; };
  }, []);
  async function load(query: Q) {
    const snapshot = { ...query };
    const id = ++sequence.current;
    setState({ loading: true, error: null, data: null, query: snapshot });
    try {
      const data = await request(siteId, snapshot);
      if (mounted.current && id === sequence.current) setState({ loading: false, error: null, data: data ?? null, query: snapshot });
    } catch (error) {
      if (mounted.current && id === sequence.current) setState({ loading: false, error: reportError(error), data: null, query: snapshot });
    }
  }
  return { ...state, load, retry: () => { if (state.query) void load(state.query); } };
}

export function useBuildingPerformanceCharts(siteId: string) {
  const monthly = useChartRequest<BuildingPerformanceMonthlyQuery, Awaited<ReturnType<typeof BuildingPerformanceApi.getMonthlyPerformance>>>(BuildingPerformanceApi.getMonthlyPerformance, siteId);
  const annual = useChartRequest<BuildingPerformanceAnnualQuery, Awaited<ReturnType<typeof BuildingPerformanceApi.getAnnualPerformance>>>(BuildingPerformanceApi.getAnnualPerformance, siteId);
  const breakdown = useChartRequest<BuildingPerformanceEnergyBreakdownQuery, Awaited<ReturnType<typeof BuildingPerformanceApi.getEnergyBreakdown>>>(BuildingPerformanceApi.getEnergyBreakdown, siteId);
  return { monthly, annual, breakdown };
}
