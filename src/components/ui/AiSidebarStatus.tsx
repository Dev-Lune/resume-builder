"use client";

import { Sparkles } from "lucide-react";
import { useAiProgress } from "@/lib/aiActivity";
import { cn } from "@/lib/cn";
import { ProgressBar } from "./ProgressBar";

/** A rich AI-processing card for a sidebar: the liquid shader bar, a live char
    count, and the text as it generates. Renders nothing when idle. */
export function AiSidebarStatus({ className }: { className?: string }) {
  const { busy, chars, preview } = useAiProgress();
  if (!busy) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("fade rounded-xl border border-border bg-surface p-2.5 shadow-float gloss", className)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
          <Sparkles className="size-3.5 text-accent" strokeWidth={2} />
          Generating
        </span>
        {chars > 0 && <span className="font-mono text-[11px] tabular text-sub">{chars.toLocaleString()}</span>}
      </div>

      <div className="mt-2 h-8 overflow-hidden rounded-lg">
        <ProgressBar />
      </div>

      <p className="mt-2 line-clamp-3 min-h-[2.4em] font-mono text-[11px] leading-relaxed text-sub">
        {preview || "Warming up the model…"}
        <span className="count-blink text-accent">▍</span>
      </p>
    </div>
  );
}
