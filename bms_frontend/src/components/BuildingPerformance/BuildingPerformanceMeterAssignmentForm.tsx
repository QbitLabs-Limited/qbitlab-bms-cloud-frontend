import { useEffect, useState, type FormEvent } from "react";
import { EnergyApi, type EnergyMeterSummaryDto } from "@/api/energy";
import { BmsButton, BmsFormModal, BmsFormModalFooter, BmsInput, BmsSelect, BmsTextarea, BmsModalMessage } from "@/components/UI";
import type { BuildingPerformanceMeterAssignmentRequest, BuildingPerformanceMeterAssignmentResponse } from "@/types/buildingPerformance";
import { reportError } from "./buildingPerformanceUi";

type Props = { siteId: string; assignment: BuildingPerformanceMeterAssignmentResponse | null; assignments: BuildingPerformanceMeterAssignmentResponse[]; saving: boolean; onClose: () => void; onSave: (request: BuildingPerformanceMeterAssignmentRequest) => Promise<boolean> };
export function BuildingPerformanceMeterAssignmentForm({ siteId, assignment, assignments, saving, onClose, onSave }: Props) {
  const [meters, setMeters] = useState<EnergyMeterSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [meter, setMeter] = useState(assignment?.energyMeterId ?? "");
  const [category, setCategory] = useState(assignment?.consumptionCategory ?? "");
  const [included, setIncluded] = useState(assignment?.included ?? true);
  const [allocation, setAllocation] = useState(assignment?.allocationPercent.toString() ?? "");
  const [notes, setNotes] = useState(assignment?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setInventoryError(null);
    EnergyApi.getEnergyMeters(siteId).then(value => { if (!cancelled) setMeters(value); }).catch(failure => { if (!cancelled) setInventoryError(reportError(failure)); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [siteId, retry]);
  const assigned = new Set(assignments.filter(row => row.id !== assignment?.id).map(row => row.energyMeterId));
  const currentMissing = assignment && !meters.some(row => row.energyMeterId === assignment.energyMeterId);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || loading || inventoryError || !meter) return;
    setError(null);
    if (!category.trim()) { setError("Consumption category is required."); return; }
    if (assigned.has(meter)) { setError("This meter is already assigned to the selected profile."); return; }
    try {
      if (await onSave({ energyMeterId: meter, consumptionCategory: category.trim(), included, allocationPercent: Number(allocation), notes: notes === "" ? null : notes })) onClose();
    } catch (failure) { setError(reportError(failure)); }
  }
  return <BmsFormModal open eyebrow="Building Performance" title={assignment ? "Edit meter assignment" : "Assign energy meter"} saving={saving} onClose={onClose}>
    <form onSubmit={submit} className="max-h-[65vh] space-y-4 overflow-y-auto">
      {error && <BmsModalMessage type="error">{error}</BmsModalMessage>}
      {loading && <p role="status">Loading energy meters…</p>}
      {inventoryError && <div role="alert"><p>{inventoryError}</p><BmsButton onClick={() => setRetry(value => value + 1)} disabled={saving}>Retry inventory</BmsButton></div>}
      <fieldset disabled={saving} className="space-y-4">
        <BmsSelect label="Energy meter" value={meter} onChange={e => setMeter(e.target.value)} required disabled={loading || !!inventoryError}>
          <option value="">Select a meter</option>
          {currentMissing && <option value={assignment.energyMeterId}>{assignment.energyMeterId} — unavailable in inventory</option>}
          {meters.map(row => <option key={row.energyMeterId} value={row.energyMeterId} disabled={assigned.has(row.energyMeterId)}>{row.meterName} · {row.energyMeterId} · {row.location ?? ""} · {row.status}{assigned.has(row.energyMeterId) ? " (already assigned)" : ""}</option>)}
        </BmsSelect>
        {!loading && !inventoryError && meters.length === 0 && <p>No energy meters returned for this site.</p>}
        <BmsInput label="Consumption category" list="bp-category-suggestions" value={category} onChange={e => setCategory(e.target.value)} required maxLength={80} helperText="Choose a suggestion or enter another category." />
        <datalist id="bp-category-suggestions">{["MAIN", "HVAC", "LIGHTING", "LIFTS", "TENANT", "COMMON_AREA", "DATA_CENTRE", "OTHER"].map(value => <option key={value} value={value} />)}</datalist>
        <label className="flex items-center gap-2"><input type="checkbox" checked={included} onChange={e => setIncluded(e.target.checked)} />Included in performance calculations</label>
        <BmsInput label="Allocation (%)" type="number" min="0.01" max="100" step="0.01" value={allocation} onChange={e => setAllocation(e.target.value)} required />
        <BmsTextarea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
      </fieldset>
      <BmsFormModalFooter saving={saving} canSubmit={!loading && !inventoryError && !!meter} submitLabel="Save assignment" onCancel={onClose} />
    </form>
  </BmsFormModal>;
}
