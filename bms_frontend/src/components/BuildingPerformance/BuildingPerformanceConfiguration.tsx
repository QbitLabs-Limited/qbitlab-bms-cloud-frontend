import type { ConfigurationReportData } from "./buildingPerformanceReport.types";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { BuildingPerformanceApi } from "@/api/buildingPerformance";
import { BmsButton, BmsCard, BmsSectionHeader, BmsSelect } from "@/components/UI";
import type { BuildingPerformanceRatingScope, BuildingPerformanceMeterAssignmentResponse } from "@/types/buildingPerformance";
import { useBuildingPerformanceConfiguration } from "./useBuildingPerformanceConfiguration";
import { BuildingPerformanceProfileForm } from "./BuildingPerformanceProfileForm";
import { BuildingPerformanceMeterAssignmentForm } from "./BuildingPerformanceMeterAssignmentForm";
import { BuildingPerformanceMeterAssignments } from "./BuildingPerformanceMeterAssignments";
import { formatMetric } from "./buildingPerformanceUi";

type Props = { onReportData?: (data: ConfigurationReportData | null) => void; siteId: string; onChanged: (scope: BuildingPerformanceRatingScope) => void };
export function BuildingPerformanceConfiguration({ siteId, onChanged, onReportData }: Props) {
  const user = useCurrentUser();
  const canWrite = (user?.roles ?? []).some(role => ["ADMIN", "BMS_ADMIN", "SITE_MANAGER", "FACILITY_MANAGER"].includes(role.replace(/^ROLE_/, "").toUpperCase()));
  const [scope, setScope] = useState<BuildingPerformanceRatingScope | "">("");
  const [busy, setBusy] = useState(false);
  return <BmsCard className="p-6 space-y-4">
    <BmsSectionHeader title="Building Performance configuration" subtitle="Configuration scope is independent of the applied reporting scope." />
    <BmsSelect label="Configuration rating scope" value={scope} disabled={busy} onChange={e => setScope(e.target.value as BuildingPerformanceRatingScope | "")}><option value="">Select configuration scope</option>{["BASE_BUILDING", "TENANCY", "WHOLE_BUILDING"].map(value => <option key={value} value={value}>{value}</option>)}</BmsSelect>
    {!canWrite && <p className="text-sm text-slate-400">Read-only configuration. Write controls require confirmed management permissions.</p>}
    {scope && <ScopeConfiguration key={`${siteId}:${scope}`} siteId={siteId} scope={scope} canWrite={canWrite} onChanged={onChanged} onBusy={setBusy} onReportData={onReportData} />}
  </BmsCard>;
}
function ScopeConfiguration({ siteId, scope, canWrite, onChanged, onBusy, onReportData }: Props & { scope: BuildingPerformanceRatingScope; canWrite: boolean; onBusy: (value: boolean) => void }) {
  const configuration = useBuildingPerformanceConfiguration(siteId, scope, canWrite, onChanged);
  useEffect(() => {
    onReportData?.({ siteId, scope, profile: configuration.profile, assignments: configuration.assignments, loading: configuration.loading, busy: configuration.busy, missing: configuration.missing, error: configuration.error, assignmentError: configuration.assignmentError });
  }, [siteId, scope, onReportData, configuration.profile, configuration.assignments, configuration.loading, configuration.busy, configuration.missing, configuration.error, configuration.assignmentError]);
  useEffect(() => () => onReportData?.(null), [onReportData]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editor, setEditor] = useState<{ assignment: BuildingPerformanceMeterAssignmentResponse | null } | null>(null);
  async function mutate(action: () => Promise<unknown>) {
    onBusy(true);
    try { return await configuration.mutate(action); } finally { onBusy(false); }
  }
  const profile = configuration.profile;
  return <div className="space-y-4">
    {configuration.success && <p role="status" className="text-emerald-200">{configuration.success}</p>}
    {configuration.loading && <p role="status">Loading configuration…</p>}
    {configuration.error && <div role="alert"><p>{configuration.error}</p><BmsButton onClick={() => { void configuration.refresh(); }} disabled={configuration.busy}>Retry configuration</BmsButton></div>}
    {!configuration.loading && configuration.missing && <div className="space-y-2"><p>No profile exists for this scope.</p>{canWrite && <BmsButton onClick={() => setProfileOpen(true)}>Create profile</BmsButton>}</div>}
    {profile && <section className="space-y-3">
      <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{profile.buildingName}</h3>{canWrite && <BmsButton disabled={configuration.busy || configuration.loading} onClick={() => setProfileOpen(true)}>Edit profile</BmsButton>}</div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">{[["Rating scope", profile.ratingScope], ["Rentable area", formatMetric(profile.rentableAreaM2, "m²")], ["Weekly occupancy hours", formatMetric(profile.weeklyOccupancyHours)], ["Computer count", formatMetric(profile.computerCount)], ["Target rating (target only)", formatMetric(profile.targetRating)], ["Assessment enabled", profile.assessmentEnabled ? "Yes" : "No"]].map(([label, value]) => <div key={label}><dt className="text-slate-400">{label}</dt><dd>{value}</dd></div>)}</dl>
      {configuration.assignmentError ? <div role="alert"><p>{configuration.assignmentError}</p><BmsButton onClick={() => { void configuration.refresh(); }}>Retry assignments</BmsButton></div> : !configuration.loading && <BuildingPerformanceMeterAssignments rows={configuration.assignments} canWrite={canWrite} busy={configuration.busy} onAdd={() => setEditor({ assignment: null })} onEdit={assignment => setEditor({ assignment })} onDelete={row => mutate(() => BuildingPerformanceApi.deleteMeterAssignment(siteId, row.id, { ratingScope: scope }))} />}
    </section>}
    {canWrite && profileOpen && <BuildingPerformanceProfileForm profile={profile} scope={scope} saving={configuration.busy} onClose={() => { if (!configuration.busy) setProfileOpen(false); }} onSave={request => mutate(() => profile ? BuildingPerformanceApi.updateProfile(siteId, request) : BuildingPerformanceApi.createProfile(siteId, request))} />}
    {canWrite && editor && <BuildingPerformanceMeterAssignmentForm siteId={siteId} assignment={editor.assignment} assignments={configuration.assignments} saving={configuration.busy} onClose={() => { if (!configuration.busy) setEditor(null); }} onSave={request => mutate(() => editor.assignment ? BuildingPerformanceApi.updateMeterAssignment(siteId, editor.assignment.id, { ratingScope: scope }, request) : BuildingPerformanceApi.createMeterAssignment(siteId, { ratingScope: scope }, request))} />}
  </div>;
}
