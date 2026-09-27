import { useState, type FormEvent } from "react";
import { BmsButton, BmsCard, BmsInput, BmsSectionHeader, BmsSelect } from "@/components/UI";
import type { BuildingPerformanceSummaryQuery } from "@/types/buildingPerformance";

type Props = {
  applied: BuildingPerformanceSummaryQuery | null;
  onLoad: (query: BuildingPerformanceSummaryQuery) => void;
};

export function BuildingPerformanceControls({ applied, onLoad }: Props) {
  const [ratingScope, setScope] = useState("");
  const [endingMonth, setMonth] = useState("");
  const [timestampInterpretation, setInterpretation] = useState("");
  const [maxGap, setGap] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!ratingScope) next.ratingScope = "Select a rating scope.";
    if (!endingMonth) next.endingMonth = "Enter an ending month.";
    else if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(endingMonth)) next.endingMonth = "Use YYYY-MM format.";
    if (!timestampInterpretation) next.timestampInterpretation = "Select a timestamp interpretation.";
    if (!maxGap.trim()) next.maxGap = "Enter an ISO-8601 duration, such as PT15M.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onLoad({
      ratingScope: ratingScope as BuildingPerformanceSummaryQuery["ratingScope"],
      endingMonth,
      timestampInterpretation: timestampInterpretation as BuildingPerformanceSummaryQuery["timestampInterpretation"],
      maxGap: maxGap.trim(),
    });
  }

  return (
    <BmsCard className="p-6">
      <BmsSectionHeader title="Calculation inputs" subtitle="Select all inputs, then load the rolling twelve-month report." />
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <BmsSelect label="Rating scope" value={ratingScope} onChange={(e) => setScope(e.target.value)} error={errors.ratingScope} required>
            <option value="">Select scope</option>
            <option value="BASE_BUILDING">Base building</option>
            <option value="TENANCY">Tenancy</option>
            <option value="WHOLE_BUILDING">Whole building</option>
          </BmsSelect>
          <BmsInput label="Ending month" type="month" value={endingMonth} onChange={(e) => setMonth(e.target.value)} error={errors.endingMonth} required />
          <BmsSelect label="Timestamp interpretation" value={timestampInterpretation} onChange={(e) => setInterpretation(e.target.value)} error={errors.timestampInterpretation} required>
            <option value="">Select interpretation</option>
            <option value="UTC">UTC</option>
            <option value="SITE_LOCAL">Site local</option>
          </BmsSelect>
          <BmsInput label="Maximum gap" value={maxGap} onChange={(e) => setGap(e.target.value)} placeholder="PT15M" helperText="Positive ISO-8601 duration, e.g. PT15M or PT1H." error={errors.maxGap} required />
        </div>
        <BmsButton type="submit">Load report</BmsButton>
      </form>
      {applied && (
        <p className="mt-4 text-sm text-slate-300">
          Applied inputs: {applied.ratingScope} · ending {applied.endingMonth} · {applied.timestampInterpretation} · maximum gap {applied.maxGap}.
          Changes above apply only after selecting Load report.
        </p>
      )}
    </BmsCard>
  );
}
