"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useAiProgress } from "@/lib/aiActivity";
import { cn } from "@/lib/cn";

/**
 * A waiting state with a spine, so a slow free-model call reads as work in
 * progress, not a hang. Steps advance on a timer (the last one holds until the
 * real result replaces this), with an elapsed counter and an honest note.
 */
export function AiProgress({
  title,
  steps,
  note,
  live,
  className,
}: {
  title: string;
  steps: string[];
  note?: string;
  /** Live character count streamed from the model, shown as real progress. */
  live?: number;
  className?: string;
}) {
  const [step, setStep] = useState(0);
  const [secs, setSecs] = useState(0);
  const { preview } = useAiProgress();

  useEffect(() => {
    const clock = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    // Advance through the steps, but never light the final one until we are done.
    const timers = steps.slice(0, -1).map((_, i) => setTimeout(() => setStep(i + 1), (i + 1) * 4200));
    return () => timers.forEach(clearTimeout);
  }, [steps.length]);

  return (
    <div className={cn("mx-auto w-full max-w-md", className)} role="status" aria-live="polite">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl">{title}</h2>
        <span className="shrink-0 font-mono text-[12px] tabular text-sub">
          {live ? `${live.toLocaleString()} chars · ` : ""}
          {secs}s
        </span>
      </div>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bar-indeterminate" aria-hidden="true" />

      <ul className="mt-6 flex flex-col gap-3">
        {steps.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "todo";
          return (
            <li key={s} className="flex items-center gap-3 text-[15px]">
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                  state === "done"
                    ? "border-ok/40 bg-ok-soft text-ok"
                    : state === "active"
                      ? "count-blink border-accent-line bg-accent-soft text-accent"
                      : "border-border text-dim",
                )}
              >
                {state === "done" ? <Check className="size-3" strokeWidth={2.5} /> : <span className="size-1.5 rounded-full bg-current" />}
              </span>
              <span className={state === "todo" ? "text-dim" : "text-ink"}>{s}</span>
            </li>
          );
        })}
      </ul>

      {preview && (
        <div className="mt-6 rounded-lg border border-border bg-raised/50 p-3">
          <p className="line-clamp-4 font-mono text-[12px] leading-relaxed text-sub">
            {preview}
            <span className="count-blink text-accent">▍</span>
          </p>
        </div>
      )}

      {note && <p className="mt-6 text-[13px] leading-relaxed text-sub">{note}</p>}
    </div>
  );
}
