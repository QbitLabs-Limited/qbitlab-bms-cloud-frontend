import { useCallback, useEffect, useRef, useState } from "react";
import { BuildingPerformanceApi } from "@/api/buildingPerformance";
import type { BuildingPerformanceRatingScope, BuildingPerformanceProfileResponse, BuildingPerformanceMeterAssignmentResponse } from "@/types/buildingPerformance";
import { reportError } from "./buildingPerformanceUi";

export function useBuildingPerformanceConfiguration(siteId: string, scope: BuildingPerformanceRatingScope, canWrite: boolean, onChanged: (scope: BuildingPerformanceRatingScope) => void) {
  const [profile, setProfile] = useState<BuildingPerformanceProfileResponse | null>(null);
  const [assignments, setAssignments] = useState<BuildingPerformanceMeterAssignmentResponse[]>([]);
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const mounted = useRef(true);
  const sequence = useRef(0);
  const mutation = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; sequence.current++; }; }, []);
  const refresh = useCallback(async () => {
    const id = ++sequence.current;
    setLoading(true); setError(null); setAssignmentError(null); setMissing(false); setProfile(null); setAssignments([]);
    const valid = () => mounted.current && sequence.current === id;
    try {
      const value = await BuildingPerformanceApi.getProfile(siteId, { ratingScope: scope });
      if (!valid()) return;
      setProfile(value);
      try {
        const rows = await BuildingPerformanceApi.getMeterAssignments(siteId, { ratingScope: scope });
        if (valid()) setAssignments(rows);
      } catch (failure) { if (valid()) setAssignmentError(reportError(failure)); }
    } catch (failure) {
      if (!valid()) return;
      // A generic 404 can mean a missing site, not an absent profile.
      const absent = failure && typeof failure === "object" && "status" in failure && failure.status === 404 && reportError(failure) === "Building performance profile not found";
      if (absent) setMissing(true); else setError(reportError(failure));
    } finally { if (valid()) setLoading(false); }
  }, [siteId, scope]);
  useEffect(() => { void refresh(); }, [refresh]);
  async function mutate(action: () => Promise<unknown>): Promise<boolean> {
    if (!canWrite) throw new Error("Configuration changes require a management role.");
    if (mutation.current) return false;
    mutation.current = true; setBusy(true); setSuccess(null);
    try {
      await action();
      if (mounted.current) {
        setSuccess("Configuration saved successfully.");
        onChanged(scope);
        void refresh();
      }
      return true;
    } finally {
      mutation.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return { profile, assignments, missing, loading, error, assignmentError, busy, success, refresh, mutate };
}
