"use client";

import { aiProvider, PROVIDER_META, PROVIDERS, useAiProvider } from "@/lib/aiProvider";
import { cn } from "@/lib/cn";
import { ProviderConfig } from "./AiProviderMenu";
import { ProviderIcon } from "./ProviderIcon";

/** Inline AI-provider chooser for the start of a flow. Equal-size cards; the
    config panel appears only for providers that need a key, a model or a URL.
    Per-browser, and also switchable from the header. */
export function ProviderPicker({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const active = useAiProvider();
  const meta = PROVIDER_META[active];
  const needsSetup = meta.needsKey || !!meta.modelLabel || !!meta.editableBase;

  return (
    <div className={className} style={style}>
      <h2 className="text-[15px] font-semibold text-ink">Who writes it</h2>
      <p className="mt-0.5 text-[13px] leading-relaxed text-sub">Pick an AI. No key? Choose Manual and use any chat app you already have.</p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="AI provider">
        {PROVIDERS.map((p) => {
          const on = p.id === active;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => aiProvider.set(p.id)}
              className={cn(
                "flex h-full min-h-[58px] items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors",
                on ? "border-accent bg-accent-soft ring-1 ring-accent" : "border-border bg-surface hover:bg-raised",
              )}
            >
              <ProviderIcon id={p.id} />
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-[13.5px] font-medium", on ? "text-ink" : "text-ink-dim")}>{p.label}</span>
                <span className="block truncate text-[11.5px] text-sub">{p.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {needsSetup ? (
        <div className="mt-3 rounded-xl bg-raised p-3">
          <ProviderConfig id={active} />
        </div>
      ) : (
        <p className="mt-3 rounded-xl bg-raised px-3 py-2.5 text-[13px] leading-relaxed text-ink-dim">{meta.note}</p>
      )}
    </div>
  );
}
