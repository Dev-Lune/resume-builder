import { Check as CheckIcon, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Check } from "@/lib/ats";

/** Matched keywords read as stitched in; missing ones as chalk outlines. */
export function KeywordChips({ matched, missing, className }: { matched: string[]; missing: string[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {matched.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs text-sub">In your resume ({matched.length})</p>
          <ul className="flex flex-wrap gap-1.5">
            {matched.map((k) => (
              <li key={k} className="rounded-sm border border-ok/30 bg-ok-soft px-2 py-0.5 text-[13px] text-ok">
                {k}
              </li>
            ))}
          </ul>
        </div>
      )}
      {missing.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs text-sub">Asked for, not found ({missing.length})</p>
          <ul className="flex flex-wrap gap-1.5">
            {missing.map((k) => (
              <li key={k} className="rounded-sm border border-dashed border-border px-2 py-0.5 text-[13px] text-ink-dim">
                {k}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function CheckRow({ check, onFix }: { check: Check; onFix?: (c: Check) => void }) {
  return (
    <li className="flex gap-3 py-3 hairline-b last:shadow-none">
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
          check.ok ? "border-ok/40 bg-ok-soft text-ok" : "border-border text-sub",
        )}
        aria-hidden="true"
      >
        {check.ok ? <CheckIcon className="size-3" strokeWidth={2} /> : <X className="size-3" strokeWidth={2} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className={cn("text-sm", check.ok ? "text-ink" : "font-medium text-ink")}>
            {check.label}
            <span className="sr-only">{check.ok ? ", passed" : ", not yet"}</span>
          </p>
          <span className="font-mono text-[11px] tabular text-sub">
            {check.ok ? check.weight : 0}/{check.weight}
          </span>
        </div>
        <p className="mt-0.5 text-[13px] leading-relaxed text-sub">{check.detail}</p>
        {!check.ok && onFix && (
          <button type="button" onClick={() => onFix(check)} className="mt-1.5 text-[13px] font-medium text-accent hover:underline">
            Go to {check.section === "basics" ? "details" : check.section}
          </button>
        )}
      </div>
    </li>
  );
}

export function VariantList({
  variants,
  onPick,
  pickLabel = "Use this",
  activeIndex = null,
}: {
  variants: string[];
  onPick: (v: string, i: number) => void;
  pickLabel?: string;
  /** Highlights the currently-applied variant, so the panel doubles as history. */
  activeIndex?: number | null;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {variants.map((v, i) => {
        const on = i === activeIndex;
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() => onPick(v, i)}
              aria-pressed={on}
              className={cn(
                "group flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm leading-relaxed transition-colors",
                on ? "border-accent bg-accent-soft" : "border-border bg-surface hover:border-accent hover:bg-accent-soft",
              )}
            >
              <span className="flex-1">{v}</span>
              <span
                className={cn(
                  "shrink-0 pt-0.5 text-xs font-medium text-accent transition-opacity",
                  on ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                )}
              >
                {on ? "In use" : pickLabel}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
