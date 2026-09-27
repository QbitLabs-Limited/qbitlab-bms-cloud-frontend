import { useId } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BuildingPerformanceResult } from "@/types/buildingPerformance";
import { displayText, formatMetric } from "./buildingPerformanceUi";
import { trendRows, type TrendPeriod } from "./buildingPerformanceChartData";

type Props = { results: BuildingPerformanceResult[]; from: string; to: string; kind: TrendPeriod };
export function BuildingPerformanceTrendChart({ results, from, to, kind }: Props) {
  const id = useId();
  const rows = trendRows(results, from, to, kind);
  const title = kind === "monthly" ? "Monthly energy" : "Annual energy";
  const available = rows.some(row => row.energy !== null);
  return <div className="space-y-4">
    <p id={id} className="text-sm text-slate-300">{title} in kWh, {from} to {to}. Returned end dates are exclusive. Missing values are gaps; values are also listed in the table.</p>
    {results.length === 0 ? <p role="status">No periods returned by the backend.</p> : !available ? <p role="status">Energy is unavailable for all returned periods.</p> :
      <div role="group" aria-label={`${title} chart`} aria-describedby={id} className="h-72 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} accessibilityLayer margin={{ top: 12, right: 24, bottom: 12, left: 16 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
            <XAxis dataKey="period" stroke="#cbd5e1" />
            <YAxis stroke="#cbd5e1" label={{ value: "kWh", angle: -90, position: "insideLeft", fill: "#cbd5e1" }} />
            <Tooltip filterNull={false} content={({ active, payload }) => {
              const row = payload?.[0]?.payload as (typeof rows)[number] | undefined;
              return active && row ? <div className="rounded-xl border border-slate-600 bg-slate-950 p-3 text-sm text-slate-100"><p>{row.period}: {formatMetric(row.energy, "kWh")}</p><p>{displayText(row.start)} to {displayText(row.end)} (end exclusive)</p><p>Timezone: {displayText(row.timezone)}</p><p>Coverage: {formatMetric(row.coverage, "%")}</p></div> : null;
            }} />
            <Line type="linear" dataKey="energy" name="Energy (kWh)" stroke="#22d3ee" dot={{ r: 3 }} connectNulls={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>}
    <div className="bms-table-wrap overflow-x-auto"><table className="bms-table w-full">
      <caption className="p-3 text-left text-sm">{title} values — unavailable periods contain no inferred energy or backend boundaries.</caption>
      <thead><tr>{["Period", "Start", "End (exclusive)", "Timezone", "Energy (kWh)", "Coverage (%)"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
      <tbody>{rows.map(row => <tr key={row.period}><th scope="row">{row.period}</th><td>{displayText(row.start)}</td><td>{displayText(row.end)}</td><td>{displayText(row.timezone)}</td><td>{formatMetric(row.energy)}</td><td>{formatMetric(row.coverage)}</td></tr>)}</tbody>
    </table></div>
  </div>;
}
