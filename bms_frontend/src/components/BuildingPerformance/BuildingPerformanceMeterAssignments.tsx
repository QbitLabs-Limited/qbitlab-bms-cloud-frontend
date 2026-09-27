import { useState } from "react";
import { BmsButton, BmsConfirmDeleteModal } from "@/components/UI";
import type { BuildingPerformanceMeterAssignmentResponse } from "@/types/buildingPerformance";
import { reportError } from "./buildingPerformanceUi";

type Props = { rows: BuildingPerformanceMeterAssignmentResponse[]; canWrite: boolean; busy: boolean; onAdd: () => void; onEdit: (row: BuildingPerformanceMeterAssignmentResponse) => void; onDelete: (row: BuildingPerformanceMeterAssignmentResponse) => Promise<boolean> };
export function BuildingPerformanceMeterAssignments({ rows, canWrite, busy, onAdd, onEdit, onDelete }: Props) {
  const [selected, setSelected] = useState<BuildingPerformanceMeterAssignmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function remove() {
    if (!selected || !canWrite || busy) return;
    setError(null);
    try { if (await onDelete(selected)) setSelected(null); } catch (failure) { setError(reportError(failure)); }
  }
  return <section className="space-y-3">
    <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Meter assignments</h3>{canWrite && <BmsButton disabled={busy} onClick={onAdd}>Add assignment</BmsButton>}</div>
    {rows.length === 0 ? <p>No meters assigned to this profile.</p> : <div className="bms-table-wrap overflow-x-auto"><table className="bms-table w-full"><caption className="p-2 text-left">Assignments for the selected configuration scope</caption><thead><tr>{["Energy meter ID", "Category", "Included", "Allocation (%)", "Notes", ...(canWrite ? ["Actions"] : [])].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id}><th scope="row">{row.energyMeterId}</th><td>{row.consumptionCategory}</td><td>{row.included ? "Yes" : "No"}</td><td>{row.allocationPercent}</td><td>{row.notes ?? "—"}</td>{canWrite && <td><div className="flex gap-2"><BmsButton disabled={busy} onClick={() => onEdit(row)}>Edit</BmsButton><BmsButton variant="danger" disabled={busy} onClick={() => { setError(null); setSelected(row); }}>Delete</BmsButton></div></td>}</tr>)}</tbody></table></div>}
    {canWrite && selected && <BmsConfirmDeleteModal open title="Delete performance assignment" entityLabel="Energy meter" entityName={selected.energyMeterId} entityIdLabel="Assignment ID" entityId={selected.id} description="This removes only the Building Performance assignment. The Energy Meter and its telemetry remain intact." deleting={busy} error={error} onClose={() => { if (!busy) setSelected(null); }} onConfirmDelete={remove} />}
  </section>;
}
