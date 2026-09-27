import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { BmsButton } from "@/components/UI";
import type { BuildingPerformanceReportSnapshot } from "./buildingPerformanceReport.types";
import { BuildingPerformanceReport } from "./BuildingPerformanceReport";
import printCss from "./buildingPerformancePrint.css?inline";

type Props = { disabled: boolean; capture: () => BuildingPerformanceReportSnapshot };
export function BuildingPerformancePrint({ disabled, capture }: Props) {
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanup.current?.(), []);
  async function print() {
    if (disabled || cleanup.current) return;
    setPreparing(true); setError(null);
    try {
      // Detached clone is the sole source for the entire print document.
      const snapshot = structuredClone(capture());
      const freeze = (value: object) => { Object.freeze(value); Object.values(value).forEach(child => { if (child && typeof child === "object" && !Object.isFrozen(child)) freeze(child); }); };
      freeze(snapshot);
      const frame = document.createElement("iframe");
      frame.title = "Building Performance print document";
      frame.setAttribute("aria-hidden", "true");
      frame.style.cssText = "position:fixed;left:-10000px;top:0;width:800px;height:1100px;border:0";
      document.body.appendChild(frame);
      const doc = frame.contentDocument;
      const win = frame.contentWindow;
      if (!doc || !win) { frame.remove(); throw new Error("Unable to prepare print document."); }
      doc.title = "Building Performance Report";
      doc.documentElement.lang = "en";
      const style = doc.createElement("style"); style.textContent = printCss; doc.head.appendChild(style);
      const container = doc.createElement("div"); doc.body.appendChild(container);
      const root = createRoot(container);
      let cleaned = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const dispose = () => {
        if (cleaned) return;
        cleaned = true; if (timer) clearTimeout(timer);
        win.removeEventListener("afterprint", dispose);
        root.unmount(); frame.remove(); cleanup.current = null; setPreparing(false);
      };
      cleanup.current = dispose;
      win.addEventListener("afterprint", dispose);
      flushSync(() => root.render(<BuildingPerformanceReport snapshot={snapshot} />));
      await doc.fonts.ready;
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      if (cleaned) return;
      // Cleanup fallback for browsers that omit afterprint after cancellation.
      timer = setTimeout(dispose, 300000);
      win.focus(); win.print();
    } catch (failure) {
      cleanup.current?.(); setPreparing(false);
      setError(failure instanceof Error ? failure.message : "Unable to print the report.");
    }
  }
  return <div><BmsButton disabled={disabled || preparing} onClick={() => { void print(); }}>{preparing ? "Preparing / printing report…" : "Print Report"}</BmsButton>{error && <p role="alert" className="text-sm text-rose-200">{error}</p>}<p className="mt-2 text-xs text-slate-400">Prints loaded data only. Unloaded or failed sections are identified. Wait for current requests and saves to finish.</p></div>;
}
