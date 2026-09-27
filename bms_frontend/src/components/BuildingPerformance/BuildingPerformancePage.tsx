import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { keycloak } from "@/keycloak";
import { BmsButton, BmsCard, BmsPageShell, BmsSectionHeader } from "@/components/UI";

type BuildingPerformancePageProps = {
  tenantId: string;
  siteId: string;
  siteName?: string;
};

export function BuildingPerformancePage({
  tenantId,
  siteId,
  siteName,
}: BuildingPerformancePageProps) {
  const navigate = useNavigate();
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
      <BmsCard className="p-6">
        <BmsSectionHeader
          title="Building performance reporting"
          subtitle="Performance reporting and configuration will be available in a future update."
        />
        <p className="text-sm leading-6 text-slate-300">
          This page will bring together energy performance, data coverage,
          rating readiness, building profiles, and energy meter assignments.
        </p>
      </BmsCard>
    </BmsPageShell>
  );
}
