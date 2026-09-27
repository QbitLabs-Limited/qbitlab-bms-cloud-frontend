import { BmsBadge, BmsButton, BmsCard, BmsSectionHeader } from "@/components/UI";
import type { BuildingPerformanceResult } from "@/types/buildingPerformance";
import type { ReportState } from "./useBuildingPerformanceReport";
import { displayText, formatMetric } from "./buildingPerformanceUi";

type Props = { state: ReportState<BuildingPerformanceResult>; requested: boolean; onRetry: () => void };

export function BuildingPerformanceSummary({ state, requested, onRetry }: Props) {
  const { data, loading, error } = state;
  const metrics = data ? [
    ["Total energy", formatMetric(data.consumption?.totalEnergyKwh, "kWh")],
    ["Energy intensity", formatMetric(data.energyIntensityKwhPerM2, "kWh/m²")],
    ["Target rating (target only)", formatMetric(data.targetRating)],
    ["Data coverage", formatMetric(data.consumption?.dataCoveragePercent, "%")],
    ["Total source", displayText(data.consumption?.totalSource)],
  ] : [];
  return (
    <BmsCard className="p-6" aria-busy={loading}>
      <BmsSectionHeader title="Rolling twelve-month summary" />
      {loading ? <p role="status" className="animate-pulse text-slate-300">Loading summary…</p>
        : error ? <div role="alert" className="space-y-3 text-rose-200"><p>{error}</p><BmsButton onClick={onRetry}>Retry summary</BmsButton></div>
        : !data ? <p className="text-slate-400">{requested ? "Summary data is unavailable." : "Choose calculation inputs and load a report."}</p>
        : <div className="space-y-5">
          <p className="text-sm text-slate-300">{displayText(data.periodStart)} to {displayText(data.periodEnd)} (end exclusive) · Timezone: {displayText(data.siteTimezone)} · {displayText(data.ratingScope)}</p>
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-700/60 p-4"><dt className="text-sm text-slate-400">{label}</dt><dd className="mt-2 break-words text-xl font-semibold text-slate-100">{value}</dd></div>)}
          </dl>
          <div><h3 className="mb-2 font-semibold">Summary quality issues</h3>
            {data.consumption?.qualityIssues == null ? <p>Unavailable</p> : data.consumption.qualityIssues.length === 0 ? <p className="text-sm text-slate-400">No quality issues reported.</p> : <ul className="flex flex-wrap gap-2">{data.consumption.qualityIssues.map((issue) => <li key={issue}><BmsBadge variant="neutral">{issue}</BmsBadge></li>)}</ul>}
          </div>
        </div>}
    </BmsCard>
  );
}
