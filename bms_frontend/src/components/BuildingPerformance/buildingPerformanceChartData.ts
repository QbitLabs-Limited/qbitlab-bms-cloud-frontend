import type { BuildingPerformanceResult, BuildingPerformanceEnergyBreakdownResponse } from "@/types/buildingPerformance";

export type TrendPeriod = "monthly" | "annual";
export type TrendRow = {
  period: string;
  energy: number | null;
  coverage: number | null;
  start: string | null;
  end: string | null;
  timezone: string | null;
};

function numeric(value: number | null | undefined): number | null {
  return value != null && Number.isFinite(value) ? value : null;
}

export function validPeriod(value: string, kind: TrendPeriod): boolean {
  return (kind === "monthly" ? /^\d{4}-(0[1-9]|1[0-2])$/ : /^\d{4}$/).test(value);
}

function ordinal(value: string, kind: TrendPeriod): number {
  return kind === "annual" ? Number(value) : Number(value.slice(0, 4)) * 12 + Number(value.slice(5)) - 1;
}

export function rangeError(from: string, to: string, kind: TrendPeriod): string | null {
  if (!validPeriod(from, kind) || !validPeriod(to, kind)) return `Enter both periods in ${kind === "monthly" ? "YYYY-MM" : "YYYY"} format.`;
  const count = ordinal(to, kind) - ordinal(from, kind) + 1;
  const maximum = kind === "monthly" ? 24 : 5;
  return count < 1 || count > maximum ? `Select an ascending range of 1–${maximum} ${kind === "monthly" ? "months" : "years"}, as required by the backend.` : null;
}

export function trendRows(results: BuildingPerformanceResult[], from: string, to: string, kind: TrendPeriod): TrendRow[] {
  if (rangeError(from, to, kind)) return [];
  const byPeriod = new Map(results.map(result => [result.periodStart.slice(0, kind === "annual" ? 4 : 7), result]));
  const rows: TrendRow[] = [];
  for (let index = ordinal(from, kind); index <= ordinal(to, kind); index++) {
    const period = kind === "annual" ? String(index).padStart(4, "0")
      : `${String(Math.floor(index / 12)).padStart(4, "0")}-${String(index % 12 + 1).padStart(2, "0")}`;
    const result = byPeriod.get(period);
    // Annual rows are yearly backend totals, never reconstructed from monthly data.
    rows.push({ period, energy: numeric(result?.consumption?.totalEnergyKwh), coverage: numeric(result?.consumption?.dataCoveragePercent), start: result?.periodStart ?? null, end: result?.periodEnd ?? null, timezone: result?.siteTimezone ?? null });
  }
  return rows;
}

export function breakdownRows(result: BuildingPerformanceEnergyBreakdownResponse) {
  return Object.entries(result.categories ?? {}).map(([category, value]) => ({
    category, energy: numeric(value?.energyKwh), coverage: numeric(value?.dataCoveragePercent),
  }));
}
