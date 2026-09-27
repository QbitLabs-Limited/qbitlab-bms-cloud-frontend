import type { ComponentProps } from "react";
import type { BmsBadge } from "@/components/UI";

export function formatMetric(value: number | null | undefined, unit = ""): string {
  if (value == null || !Number.isFinite(value)) return "Unavailable";
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 3 })}${unit ? ` ${unit}` : ""}`;
}

export function displayText(value: string | null | undefined): string {
  return value?.trim() ? value : "Unavailable";
}

export function reportError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Unable to load this section. Please retry.";
}

export function statusVariant(value: string): ComponentProps<typeof BmsBadge>["variant"] {
  switch (value) {
    case "READY":
    case "COMPLETE":
    case "PASS": return "success";
    case "NOT_READY":
    case "FAIL": return "danger";
    case "INSUFFICIENT_DATA":
    case "PARTIAL":
    case "WARNING": return "warning";
    default: return "neutral";
  }
}
