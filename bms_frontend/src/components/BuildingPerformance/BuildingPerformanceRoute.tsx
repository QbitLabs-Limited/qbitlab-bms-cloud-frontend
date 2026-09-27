import { Navigate, useLocation, useParams } from "react-router-dom";
import { BuildingPerformancePage } from "./BuildingPerformancePage";

export function BuildingPerformanceRoute() {
  const { tenantId, siteId } = useParams<{ tenantId: string; siteId: string }>();
  const { state } = useLocation();
  const siteName =
    state && typeof state.siteName === "string" ? state.siteName : undefined;

  if (!tenantId?.trim() || !siteId?.trim()) {
    return <Navigate to="/access-denied" replace />;
  }

  return (
    <BuildingPerformancePage tenantId={tenantId} siteId={siteId} siteName={siteName} />
  );
}
