"use client";

import { useAiBusy } from "@/lib/aiActivity";
import { cn } from "@/lib/cn";
import { ProgressBar } from "./ProgressBar";

/** A thin liquid loading strip pinned to the bottom edge of a header, shown
    whenever an AI call is running. Put inside a `relative` header. */
export function HeaderAiBar() {
  const busy = useAiBusy();
  return (
    <div
      aria-hidden={!busy}
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-[3px] overflow-hidden transition-opacity duration-300",
        busy ? "opacity-100" : "opacity-0",
      )}
    >
      {busy && <ProgressBar />}
    </div>
  );
}
