import { useState, type FormEvent, type ReactNode } from "react";
import { BmsButton, BmsCard, BmsInput, BmsSectionHeader, BmsSelect } from "@/components/UI";
import type { BuildingPerformanceSummaryQuery, BuildingPerformanceEnergyBreakdownQuery, BuildingPerformancePeriodType, BuildingPerformanceRatingScope } from "@/types/buildingPerformance";
import { useBuildingPerformanceCharts } from "./useBuildingPerformanceCharts";
import { BuildingPerformanceTrendChart } from "./BuildingPerformanceTrendChart";
import { BuildingPerformanceBreakdownChart } from "./BuildingPerformanceBreakdownChart";
import { rangeError, validPeriod, type TrendPeriod } from "./buildingPerformanceChartData";

type Props = { siteId: string; applied: BuildingPerformanceSummaryQuery; configurationChange?: { scope: BuildingPerformanceRatingScope; revision: number } | null };

function RangeControls({ kind, onLoad }: { kind: TrendPeriod; onLoad: (from: string, to: string) => void }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = rangeError(from, to, kind);
    setError(message);
    if (!message) onLoad(from, to);
  }
  return <form onSubmit={submit} noValidate className="mb-5 space-y-3">
    <div className="grid gap-3 sm:grid-cols-2">
      <BmsInput id={`${kind}-from`} label="From" type={kind === "monthly" ? "month" : "text"} placeholder={kind === "monthly" ? "YYYY-MM" : "YYYY"} value={from} onChange={e => setFrom(e.target.value)} required />
      <BmsInput id={`${kind}-to`} label="To" type={kind === "monthly" ? "month" : "text"} placeholder={kind === "monthly" ? "YYYY-MM" : "YYYY"} value={to} onChange={e => setTo(e.target.value)} required />
    </div>
    <p className="text-xs text-slate-400">{kind === "monthly" ? "YYYY-MM; 1–24 months" : "YYYY; 1–5 years"}, inclusive, in ascending order.</p>
    {error && <p role="alert" className="text-sm text-rose-200">{error}</p>}
    <BmsButton type="submit">Load {kind} chart</BmsButton>
  </form>;
}

function ChartState({ loading, error, requested, hasData, retry, children }: { loading: boolean; error: string | null; requested: boolean; hasData: boolean; retry: () => void; children: ReactNode }) {
  if (loading) return <p role="status" className="animate-pulse">Loading chart data…</p>;
  if (error) return <div role="alert" className="space-y-3 text-rose-200"><p>{error}</p><BmsButton onClick={retry}>Retry chart</BmsButton></div>;
  if (!hasData) return <p className="text-slate-400">{requested ? "Chart data is unavailable." : "Choose a period and load this chart."}</p>;
  return <>{children}</>;
}

export function BuildingPerformanceCharts({ siteId, applied, configurationChange }: Props) {
  const charts = useBuildingPerformanceCharts(siteId, configurationChange);
  const [periodType, setPeriodType] = useState<BuildingPerformancePeriodType>("ROLLING_12_MONTH");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [endingMonth, setEndingMonth] = useState(applied.endingMonth);
  const [error, setError] = useState<string | null>(null);
  const common = { ratingScope: applied.ratingScope, timestampInterpretation: applied.timestampInterpretation, maxGap: applied.maxGap };
  function loadBreakdown(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = periodType === "ANNUAL" ? year : periodType === "MONTHLY" ? month : endingMonth;
    if (!validPeriod(value, periodType === "ANNUAL" ? "annual" : "monthly")) { setError(`Enter ${periodType === "ANNUAL" ? "YYYY" : "YYYY-MM"}.`); return; }
    setError(null);
    const query: BuildingPerformanceEnergyBreakdownQuery = periodType === "ANNUAL" ? { ...common, periodType, year }
      : periodType === "MONTHLY" ? { ...common, periodType, month } : { ...common, periodType, endingMonth };
    void charts.breakdown.load(query);
  }
  return <div className="space-y-6">
    <p className="text-sm text-slate-300">Chart calculation inputs: {applied.ratingScope} · {applied.timestampInterpretation} · maximum gap {applied.maxGap}. Each chart loads only when requested.</p>
    {(["monthly", "annual"] as const).map(kind => {
      const chart = charts[kind];
      return <BmsCard key={kind} className="p-6" aria-busy={chart.loading}>
        <BmsSectionHeader title={kind === "monthly" ? "Monthly performance" : "Annual performance"} />
        <RangeControls kind={kind} onLoad={(from, to) => { void chart.load({ ...common, from, to }); }} />
        {chart.query && <p className="mb-3 text-sm text-slate-400">Applied range: {chart.query.from} to {chart.query.to}. Edits apply only when loaded.</p>}
        <ChartState loading={chart.loading} error={chart.error} requested={chart.query !== null} hasData={chart.data !== null} retry={chart.retry}>
          {chart.data && chart.query && <BuildingPerformanceTrendChart results={chart.data} kind={kind} from={chart.query.from} to={chart.query.to} />}
        </ChartState>
      </BmsCard>;
    })}
    <BmsCard className="p-6" aria-busy={charts.breakdown.loading}>
      <BmsSectionHeader title="Energy breakdown" />
      <form onSubmit={loadBreakdown} noValidate className="mb-5 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <BmsSelect id="breakdown-period" label="Period type" value={periodType} onChange={e => { setPeriodType(e.target.value as BuildingPerformancePeriodType); setError(null); }}>
            <option value="MONTHLY">Monthly</option><option value="ANNUAL">Annual</option><option value="ROLLING_12_MONTH">Rolling twelve months</option>
          </BmsSelect>
          {periodType === "ANNUAL" ? <BmsInput id="breakdown-year" label="Year" placeholder="YYYY" value={year} onChange={e => setYear(e.target.value)} required />
            : periodType === "MONTHLY" ? <BmsInput id="breakdown-month" label="Month" type="month" value={month} onChange={e => setMonth(e.target.value)} required />
            : <BmsInput id="breakdown-ending" label="Ending month" type="month" value={endingMonth} onChange={e => setEndingMonth(e.target.value)} required />}
        </div>
        {error && <p role="alert" className="text-sm text-rose-200">{error}</p>}
        <BmsButton type="submit">Load breakdown</BmsButton>
      </form>
      {charts.breakdown.query && <p className="mb-3 text-sm text-slate-400">Applied period: {charts.breakdown.query.periodType} · {charts.breakdown.query.month ?? charts.breakdown.query.year ?? charts.breakdown.query.endingMonth}. Edits apply only when loaded.</p>}
      <ChartState loading={charts.breakdown.loading} error={charts.breakdown.error} requested={charts.breakdown.query !== null} hasData={charts.breakdown.data !== null} retry={charts.breakdown.retry}>
        {charts.breakdown.data && <BuildingPerformanceBreakdownChart result={charts.breakdown.data} />}
      </ChartState>
    </BmsCard>
  </div>;
}
