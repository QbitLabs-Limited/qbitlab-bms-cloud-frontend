import { BuildingPerformancePrint } from "./BuildingPerformancePrint";
import type { ChartReportData, ConfigurationReportData, BuildingPerformanceReportSnapshot } from "./buildingPerformanceReport.types";
import { useRef, useState } from "react";
import type { BuildingPerformanceRatingScope } from "@/types/buildingPerformance";
import { BuildingPerformanceConfiguration } from "./BuildingPerformanceConfiguration";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { keycloak } from "@/keycloak";
import { BmsButton, BmsCard, BmsPageShell, BmsSectionHeader } from "@/components/UI";

import { BuildingPerformanceControls } from "./BuildingPerformanceControls";
import { BuildingPerformanceSummary } from "./BuildingPerformanceSummary";
import { BuildingPerformanceReadiness } from "./BuildingPerformanceReadiness";
import { BuildingPerformanceCharts } from "./BuildingPerformanceCharts";
import { useBuildingPerformanceReport } from "./useBuildingPerformanceReport";

type BuildingPerformancePageProps = {
  tenantId: string;
  siteId: string;
  siteName?: string;
};

export function BuildingPerformancePage(props: BuildingPerformancePageProps) {
  // Remount the report on site changes so inputs, requests, and results stay site-scoped.
  return <SiteBuildingPerformancePage key={`${props.tenantId}:${props.siteId}`} {...props} />;
}

function SiteBuildingPerformancePage({
  tenantId,
  siteId,
  siteName,
}: BuildingPerformancePageProps) {
  const navigate = useNavigate();
  const report = useBuildingPerformanceReport(siteId);
  const [chartReportData, setChartReportData] = useState<ChartReportData | null>(null);
  const [configurationReportData, setConfigurationReportData] = useState<ConfigurationReportData | null>(null);
  const matchingCharts = chartReportData?.siteId === siteId && chartReportData.appliedKey === JSON.stringify(report.applied) ? chartReportData : null;
  const matchingConfiguration = configurationReportData?.siteId === siteId && configurationReportData.scope === report.applied?.ratingScope ? configurationReportData : null;
  const printDisabled = !report.applied || (!report.summary.data && !report.readiness.data) || report.summary.loading || report.readiness.loading || !!configurationReportData?.busy || !!matchingConfiguration?.loading || !!(matchingCharts?.monthly.loading || matchingCharts?.annual.loading || matchingCharts?.breakdown.loading);
  function captureReport(): BuildingPerformanceReportSnapshot {
    if (!report.applied) throw new Error("Load reporting data before printing.");
    return { siteId, siteName, generatedAt: new Date().toISOString(), applied: report.applied, summary: report.summary, readiness: report.readiness, charts: matchingCharts, configuration: matchingConfiguration };
  }
  const latestReport = useRef(report);
  latestReport.current = report;
  const [configurationChange, setConfigurationChange] = useState<{ scope: BuildingPerformanceRatingScope; revision: number } | null>(null);
  function configurationChanged(scope: BuildingPerformanceRatingScope) {
    const current = latestReport.current;
    if (current.applied?.ratingScope === scope) current.load(current.applied);
    setConfigurationChange(previous => ({ scope, revision: (previous?.revision ?? 0) + 1 }));
  }
  const canViewSites = ["ADMIN", "BMS_ADMIN", "TECHNICIAN"].some((role) =>
    keycloak.hasRealmRole(role)
  );
  const backAction = canViewSites
    ? { label: "Back to Sites", path: `/user/tenants/${encodeURIComponent(tenantId)}/sites` }
    : keycloak.hasRealmRole("SITE_MANAGER")
      ? { label: "Back to Dashboard", path: "/dashboard" }
      : null;

  return (
    <BmsPageShell contentClassName="space-y-6">
      {backAction && (
        <BmsButton variant="ghost" onClick={() => navigate(backAction.path)}>
          <ArrowLeft className="h-4 w-4" />
          {backAction.label}
        </BmsButton>
      )}
      <BmsCard variant="section" className="p-6">
        <BmsSectionHeader title="Building Performance" subtitle="NABERSNZ" />
        <p className="text-sm text-slate-200">{siteName?.trim() || siteId}</p>
        {siteName?.trim() && (
          <p className="mt-1 text-xs text-slate-400">Site ID: {siteId}</p>
        )}
      </BmsCard>
      <BuildingPerformancePrint disabled={printDisabled} capture={captureReport} />
      <BuildingPerformanceConfiguration siteId={siteId} onChanged={configurationChanged} onReportData={setConfigurationReportData} />
      <BuildingPerformanceControls applied={report.applied} onLoad={report.load} />
      <BuildingPerformanceSummary state={report.summary} requested={report.applied !== null} onRetry={report.retrySummary} />
      <BuildingPerformanceReadiness state={report.readiness} requested={report.applied !== null} onRetry={report.retryReadiness} />
      {report.applied && (
        <BuildingPerformanceCharts
          key={JSON.stringify([siteId, report.applied])}
          siteId={siteId}
          applied={report.applied}
          configurationChange={configurationChange}
          onReportData={setChartReportData}
        />
      )}
    </BmsPageShell>
  );
}
