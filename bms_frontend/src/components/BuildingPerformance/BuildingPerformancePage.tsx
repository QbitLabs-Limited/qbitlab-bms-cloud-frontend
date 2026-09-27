import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { keycloak } from "@/keycloak";
import { BmsButton, BmsCard, BmsPageShell, BmsSectionHeader } from "@/components/UI";

import { BuildingPerformanceControls } from "./BuildingPerformanceControls";
import { BuildingPerformanceSummary } from "./BuildingPerformanceSummary";
import { BuildingPerformanceReadiness } from "./BuildingPerformanceReadiness";
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
      <BuildingPerformanceControls applied={report.applied} onLoad={report.load} />
      <BuildingPerformanceSummary state={report.summary} requested={report.applied !== null} onRetry={report.retrySummary} />
      <BuildingPerformanceReadiness state={report.readiness} requested={report.applied !== null} onRetry={report.retryReadiness} />
    </BmsPageShell>
  );
}
