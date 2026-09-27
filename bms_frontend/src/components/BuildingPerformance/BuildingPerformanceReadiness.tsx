import { BmsBadge, BmsButton, BmsCard, BmsSectionHeader } from "@/components/UI";
import type { BuildingPerformanceRatingResponse } from "@/types/buildingPerformance";
import type { ReportState } from "./useBuildingPerformanceReport";
import { displayText, statusVariant } from "./buildingPerformanceUi";

type Props = { state: ReportState<BuildingPerformanceRatingResponse>; requested: boolean; onRetry: () => void };

export function BuildingPerformanceReadiness({ state, requested, onRetry }: Props) {
  const { data, loading, error } = state;
  return (
    <BmsCard className="p-6" aria-busy={loading}>
      <BmsSectionHeader title={data ? displayText(data.label) : "Data readiness"} />
      {loading ? <p role="status" className="animate-pulse text-slate-300">Loading readiness…</p>
        : error ? <div role="alert" className="space-y-3 text-rose-200"><p>{error}</p><BmsButton onClick={onRetry}>Retry readiness</BmsButton></div>
        : !data ? <p className="text-slate-400">{requested ? "Readiness data is unavailable." : "Choose calculation inputs and load a report."}</p>
        : <div className="space-y-6">
          <p className="text-sm text-slate-300">{displayText(data.periodStart)} to {displayText(data.periodEnd)} (end exclusive) · Timezone: {displayText(data.siteTimezone)} · {displayText(data.ratingScope)}</p>
          <div className="flex flex-wrap items-center gap-3">
            <BmsBadge variant={statusVariant(data.status)}>{displayText(data.status)}</BmsBadge>
            <span className="text-sm">Energy completeness: <BmsBadge variant={statusVariant(data.energyCompleteness)}>{displayText(data.energyCompleteness)}</BmsBadge></span>
          </div>
          <p className="text-sm text-slate-200">{displayText(data.reason)}</p>
          <section className="space-y-2"><h3 className="font-semibold">Readiness policy</h3>
            <dl className="space-y-2 text-sm">
              {([
                ["Policy ID", data.readinessPolicy?.id],
                ["Options source", data.readinessPolicy?.optionsSource],
                ["Completeness rule", data.readinessPolicy?.completenessRule],
                ["Meaning", data.readinessPolicy?.meaning],
              ] as const).map(([label, value]) => <div key={label}><dt className="text-slate-400">{label}</dt><dd className="break-words">{displayText(value)}</dd></div>)}
            </dl>
          </section>
          <section><h3 className="mb-3 font-semibold">Requirements</h3>
            {data.requirements == null ? <p>Unavailable</p> : data.requirements.length === 0 ? <p className="text-sm text-slate-400">No requirements reported.</p> : <ul className="space-y-3">{data.requirements.map((item, index) => <li key={`${item.code}-${item.energyMeterId}-${index}`} className="rounded-2xl border border-slate-700/60 p-4">
              <div className="flex flex-wrap items-center gap-2"><span className="font-medium">{displayText(item.code)}</span><BmsBadge variant={statusVariant(item.outcome)}>{displayText(item.outcome)}</BmsBadge><BmsBadge variant="neutral">Blocking: {displayText(item.blocking)}</BmsBadge></div>
              <p className="mt-2 text-sm text-slate-400">Field: {displayText(item.field)}{item.energyMeterId != null && ` · Meter: ${item.energyMeterId}`}</p>
              <p className="mt-2 text-sm">{displayText(item.reason)}</p>
            </li>)}</ul>}
          </section>
          <section><h3 className="mb-2 font-semibold">Limitations</h3>
            {data.limitations == null ? <p>Unavailable</p> : data.limitations.length === 0 ? <p className="text-sm text-slate-400">No limitations reported.</p> : <ul className="space-y-2">{data.limitations.map((item, index) => <li key={`${item.code}-${index}`} className="text-sm"><span className="font-medium">{displayText(item.code)}</span>: {displayText(item.reason)}</li>)}</ul>}
          </section>
          {([ ["Readiness quality issues", data.qualityIssues], ["Gap flags", data.gapFlags] ] as const).map(([title, issues]) => <section key={title}><h3 className="mb-2 font-semibold">{title}</h3>
            {issues == null ? <p>Unavailable</p> : issues.length === 0 ? <p className="text-sm text-slate-400">{title === "Gap flags" ? "No gap flags reported." : "No quality issues reported."}</p> : <ul className="flex flex-wrap gap-2">{issues.map((issue) => <li key={issue}><BmsBadge variant="neutral">{issue}</BmsBadge></li>)}</ul>}
          </section>)}
        </div>}
    </BmsCard>
  );
}
