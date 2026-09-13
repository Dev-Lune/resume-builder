"use client";

import { useEffect, useState } from "react";
import { Check, ExternalLink } from "lucide-react";
import { aiConfig, getProviderConfig, PROVIDER_META, PROVIDERS, useAiProvider, useProviderConfig, aiProvider, type ProviderChoice } from "@/lib/aiProvider";
import { cn } from "@/lib/cn";
import { ProviderIcon } from "./ProviderIcon";

/** Header control to pick the AI provider and configure it: Automatic, Local
    (Ollama), OpenRouter, Nvidia NIM, or OpenAI. Selecting one reveals its docs,
    API key, model id and (for local) server URL. All per-browser, sent with each call. */
export function AiProviderMenu({ className }: { className?: string }) {
  const active = useAiProvider();
  const current = PROVIDERS.find((p) => p.id === active) ?? PROVIDERS[0];

  return (
    <details className={cn("relative", className)}>
      <summary className="flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-full border border-border pl-1.5 pr-3 text-[13px] text-ink-dim transition-colors hover:bg-raised hover:text-ink [&::-webkit-details-marker]:hidden">
        <ProviderIcon id={active} className="size-6 rounded-md" />
        <span className="hidden sm:inline">{current.label}</span>
      </summary>
      <div className="absolute right-0 top-11 z-40 max-h-[calc(100vh-5rem)] w-80 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-float">
        <p className="px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-sub">AI provider</p>
        {PROVIDERS.map((p) => {
          const on = p.id === active;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => aiProvider.set(p.id)}
              aria-pressed={on}
              className={cn("flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-raised", on && "bg-raised")}
            >
              <ProviderIcon id={p.id} />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] text-ink">{p.label}</span>
                <span className="block truncate text-[12px] text-sub">{p.hint}</span>
              </span>
              {on && <Check className="size-4 shrink-0 text-accent" strokeWidth={2.5} />}
            </button>
          );
        })}

        <div className="mt-1.5 border-t border-line pt-2">
          <ProviderConfig id={active} />
        </div>
      </div>
    </details>
  );
}

/** The config block for one provider: docs, key, model id, base URL. */
export function ProviderConfig({ id }: { id: ProviderChoice }) {
  const meta = PROVIDER_META[id];
  const cfg = useProviderConfig(id);
  const [show, setShow] = useState(false);

  // Prefill sensible defaults the first time a provider is opened (e.g. Ollama's
  // qwen3:8b and its local URL), so it works out of the box and stays editable.
  useEffect(() => {
    const c = getProviderConfig(id);
    const patch: Partial<{ model: string; baseUrl: string }> = {};
    if (meta.defaultModel && !c.model) patch.model = meta.defaultModel;
    if (meta.editableBase && meta.basePlaceholder && !c.baseUrl) patch.baseUrl = meta.basePlaceholder;
    if (Object.keys(patch).length) aiConfig.set(id, patch);
  }, [id, meta]);

  return (
    <div className="flex flex-col gap-2.5 px-1 pb-1">
      <p className="text-[12px] leading-relaxed text-sub">{meta.note}</p>

      {meta.needsKey && (
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-sub">{meta.keyLabel ?? "API key"}</span>
          <div className="flex gap-1.5">
            <input
              type={show ? "text" : "password"}
              value={cfg.apiKey}
              onChange={(e) => aiConfig.set(id, { apiKey: e.target.value })}
              placeholder={meta.keyPlaceholder}
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 rounded-lg border border-border bg-bg px-2.5 py-1.5 font-mono text-[12px] text-ink outline-none placeholder:text-dim focus:border-accent-line"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-pressed={show}
              className="shrink-0 rounded-lg border border-border px-2 text-[12px] text-ink-dim transition-colors hover:bg-raised"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </label>
      )}

      {meta.modelLabel && (
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-sub">{meta.modelLabel}</span>
          <input
            type="text"
            value={cfg.model}
            onChange={(e) => aiConfig.set(id, { model: e.target.value })}
            placeholder={meta.modelPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 font-mono text-[12px] text-ink outline-none placeholder:text-dim focus:border-accent-line"
          />
        </label>
      )}

      {meta.editableBase && (
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-sub">{meta.baseLabel ?? "Server URL"}</span>
          <input
            type="text"
            value={cfg.baseUrl}
            onChange={(e) => aiConfig.set(id, { baseUrl: e.target.value })}
            placeholder={meta.basePlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 font-mono text-[12px] text-ink outline-none placeholder:text-dim focus:border-accent-line"
          />
        </label>
      )}

      <a
        href={meta.docUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-[12px] text-accent underline-offset-4 hover:underline"
      >
        <ExternalLink className="size-3.5" strokeWidth={2} />
        {meta.docLabel}
      </a>

      {id !== "auto" && (cfg.apiKey || cfg.model || cfg.baseUrl) && (
        <button
          type="button"
          onClick={() => aiConfig.set(id, { apiKey: "", model: "", baseUrl: "" })}
          className="self-start text-[12px] text-sub underline-offset-4 hover:text-ink hover:underline"
        >
          Reset {PROVIDERS.find((p) => p.id === id)?.label}
        </button>
      )}
    </div>
  );
}
