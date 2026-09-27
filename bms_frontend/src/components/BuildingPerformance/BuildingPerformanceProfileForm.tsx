import { useState, type FormEvent } from "react";
import { BmsFormModal, BmsFormModalFooter, BmsInput, BmsSelect, BmsModalMessage } from "@/components/UI";
import type { BuildingPerformanceProfileRequest, BuildingPerformanceProfileResponse, BuildingPerformanceRatingScope } from "@/types/buildingPerformance";
import { reportError } from "./buildingPerformanceUi";

type Props = { profile: BuildingPerformanceProfileResponse | null; scope: BuildingPerformanceRatingScope; saving: boolean; onClose: () => void; onSave: (request: BuildingPerformanceProfileRequest) => Promise<boolean> };
export function BuildingPerformanceProfileForm({ profile, scope, saving, onClose, onSave }: Props) {
  const [name, setName] = useState(profile?.buildingName ?? "");
  const [area, setArea] = useState(profile?.rentableAreaM2?.toString() ?? "");
  const [hours, setHours] = useState(profile?.weeklyOccupancyHours?.toString() ?? "");
  const [computers, setComputers] = useState(profile?.computerCount?.toString() ?? "");
  const [target, setTarget] = useState(profile?.targetRating?.toString() ?? "");
  const [enabled, setEnabled] = useState(profile?.assessmentEnabled ?? false);
  const [error, setError] = useState<string | null>(null);
  const optional = (value: string) => value.trim() === "" ? null : Number(value);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError(null);
    try {
      if (await onSave({ buildingName: name.trim(), ratingScope: scope, rentableAreaM2: Number(area), weeklyOccupancyHours: optional(hours), computerCount: optional(computers), targetRating: optional(target), assessmentEnabled: enabled })) onClose();
    } catch (failure) { setError(reportError(failure)); }
  }
  return <BmsFormModal open eyebrow="Building Performance" title={profile ? "Edit profile" : "Create profile"} saving={saving} onClose={onClose}>
    <form onSubmit={submit} className="max-h-[65vh] space-y-4 overflow-y-auto">
      {error && <BmsModalMessage type="error">{error}</BmsModalMessage>}
      <fieldset disabled={saving} className="space-y-4">
        <BmsInput label="Building name" value={name} onChange={e => setName(e.target.value)} required maxLength={150} />
        <BmsSelect label="Rating scope" value={scope} disabled helperText="Selected configuration scope. Existing profile scope cannot be changed."><option value={scope}>{scope}</option></BmsSelect>
        <BmsInput label="Rentable area (m²)" type="number" min="0.001" max="99999999999.999" step="0.001" value={area} onChange={e => setArea(e.target.value)} required />
        <BmsInput label="Weekly occupancy hours" type="number" min="0" max="168" step="0.01" value={hours} onChange={e => setHours(e.target.value)} helperText="Optional; blank is unspecified." />
        <BmsInput label="Computer count" type="number" min="0" step="1" value={computers} onChange={e => setComputers(e.target.value)} />
        <BmsInput label="Target rating" type="number" min="0" max="6" step="0.01" value={target} onChange={e => setTarget(e.target.value)} helperText="A target only, not an estimated or certified rating. Optional." />
        <label className="flex items-center gap-2"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />Assessment enabled</label>
      </fieldset>
      <BmsFormModalFooter saving={saving} submitLabel={profile ? "Save profile" : "Create profile"} onCancel={onClose} />
    </form>
  </BmsFormModal>;
}
