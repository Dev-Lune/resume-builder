"use client";

import { aiProvider, PROVIDERS, useAiProvider } from "@/lib/aiProvider";
import { cn } from "@/lib/cn";
import { ProviderConfig } from "./AiProviderMenu";
import { ProviderIcon } from "./ProviderIcon";

/** Inline AI-provider chooser for the start of a flow. Every provider is an
    equal-size card; the active one's config sits in a fixed-height panel below so
    switching never makes the layout jump. Choice is per-browser, also in the header. */
export function ProviderPicker({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const active = useAiProvider();

  return (
    <div className={className} style={style}>
      <span className="text-[13px] font-medium text-ink-dim">Which AI writes your resume?</span>
      <p className="mt-1 text-[13px] leading-relaxed text-sub">Pick one now; switch anytime from the top bar. No key? Choose Manual and paste into any chat model.</p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {PROVIDERS.map((p) => {
          const on = p.id === active;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => aiProvider.set(p.id)}
              aria-pressed={on}
              className={cn(
                "flex h-full min-h-[58px] items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors",
                on ? "border-accent-line bg-accent-soft ring-1 ring-accent-line" : "border-border hover:bg-raised",
              )}
            >
              <ProviderIcon id={p.id} />
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-[13.5px]", on ? "text-ink" : "text-ink-dim")}>{p.label}</span>
                <span className="block truncate text-[11.5px] text-sub">{p.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 min-h-[128px] rounded-xl border border-border bg-raised/40 p-3">
        <ProviderConfig id={active} />
      </div>
    </div>
  );
}
