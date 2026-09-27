import { useId, type ReactElement } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BuildingPerformanceEnergyBreakdownResponse } from "@/types/buildingPerformance";
import { breakdownRows } from "./buildingPerformanceChartData";
import { displayText, formatMetric } from "./buildingPerformanceUi";

export function BuildingPerformanceBreakdownChart({ result, printMode = false }: { result: BuildingPerformanceEnergyBreakdownResponse; printMode?: boolean }) {
  const id = useId();
  const rows = breakdownRows(result);
  return <div className="space-y-4">
    <p id={id} className="text-sm text-slate-300">{displayText(result.periodStart)} to {displayText(result.periodEnd)} (end exclusive) · Timezone: {displayText(result.siteTimezone)} · Energy in kWh.</p>
    <p className="text-sm">Backend total: {formatMetric(result.totalEnergyKwh, "kWh")} · Source: {displayText(result.totalSource)} · Coverage: {formatMetric(result.dataCoveragePercent, "%")}</p>
    <p className="text-sm text-slate-400">Categories can overlap. MAIN and submeter values are not added together.</p>
    {rows.length === 0 ? <p role="status">No category data returned.</p> : !rows.some(row => row.energy !== null) ? <p role="status">Energy is unavailable for all categories.</p> :
      <div role="group" aria-label="Category energy chart" aria-describedby={id} style={{ height: Math.max(280, rows.length * 48) }}>
        <ReportChartContainer printMode={printMode}>
          <BarChart width={printMode ? 680 : undefined} height={printMode ? Math.max(280, rows.length * 48) : undefined} data={rows} layout="vertical" accessibilityLayer={!printMode} margin={{ top: 12, right: 30, bottom: 24, left: 16 }}>
            <CartesianGrid stroke={printMode ? "#cbd5e1" : "rgba(255,255,255,0.08)"} strokeDasharray="3 3" />
            <XAxis type="number" stroke={printMode ? "#334155" : "#cbd5e1"} label={{ value: "kWh", position: "bottom", fill: printMode ? "#334155" : "#cbd5e1" }} />
            <YAxis type="category" dataKey="category" width={115} stroke={printMode ? "#334155" : "#cbd5e1"} />
            {!printMode && <Tooltip filterNull={false} content={({ active, payload }) => {
              const row = payload?.[0]?.payload as (typeof rows)[number] | undefined;
              return active && row ? <div className="rounded-xl border border-slate-600 bg-slate-950 p-3 text-sm text-slate-100"><p>{row.category}: {formatMetric(row.energy, "kWh")}</p><p>Coverage: {formatMetric(row.coverage, "%")}</p><p>{displayText(result.periodStart)} to {displayText(result.periodEnd)} (end exclusive)</p><p>Timezone: {displayText(result.siteTimezone)}</p></div> : null;
            }} />}
            <Bar dataKey="energy" name="Energy (kWh)" fill={printMode ? "#0369a1" : "#22d3ee"} isAnimationActive={false} />
          </BarChart>
        </ReportChartContainer>
      </div>}
    <div className="bms-table-wrap overflow-x-auto"><table className="bms-table w-full">
      <caption className="p-3 text-left text-sm">Category energy values for the reporting period above.</caption>
      <thead><tr><th scope="col">Category</th><th scope="col">Energy (kWh)</th><th scope="col">Coverage (%)</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.category}><th scope="row">{row.category}</th><td>{formatMetric(row.energy)}</td><td>{formatMetric(row.coverage)}</td></tr>)}</tbody>
    </table></div>
  </div>;
}

function ReportChartContainer({ printMode, children }: { printMode: boolean; children: ReactElement }) {
  return printMode ? <div className="bp-report-chart">{children}</div> : <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>;
}
