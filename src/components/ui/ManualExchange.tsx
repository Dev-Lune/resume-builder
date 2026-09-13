"use client";

import { useEffect, useState } from "react";
import { Check, ClipboardCopy, X } from "lucide-react";
import { manualBridge, useManualRequest, type ManualRequest } from "@/lib/manualBridge";
import { Button } from "./Button";

/** Global modal for the "Manual (no key)" provider. Shows the prompt to copy
    into any chat model, takes the pasted reply, validates and resolves it. */
export function ManualExchange() {
  const req = useManualRequest();
  if (!req) return null;
  return <Exchange req={req} />;
}

function Exchange({ req }: { req: ManualRequest }) {
  const [copied, setCopied] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") manualBridge.cancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(req.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked; the user can still select the text manually */
    }
  };

  const render = () => {
    const r = manualBridge.submit(reply);
    if (!r.ok) setError(r.error);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={req.title}>
      <button aria-label="Cancel" className="absolute inset-0 cursor-default" style={{ background: "color-mix(in srgb, var(--bg) 55%, transparent)" }} onClick={() => manualBridge.cancel()} />

      <div className="relative z-[1] flex max-h-[94dvh] w-full max-w-2xl flex-col rounded-t-2xl border border-border bg-surface shadow-float sm:rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div>
            <h2 className="font-display text-lg leading-tight">{req.title}</h2>
            <p className="text-[12.5px] text-sub">No key needed. Copy, paste into any AI, bring the reply back.</p>
          </div>
          <button type="button" onClick={() => manualBridge.cancel()} aria-label="Cancel" className="grid size-8 shrink-0 place-items-center rounded-lg text-sub transition-colors hover:bg-raised hover:text-ink">
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          <section>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-[12px] font-medium uppercase tracking-wider text-sub">1 · Copy this prompt</span>
              <Button size="sm" variant="secondary" onClick={copy}>
                {copied ? <Check className="size-4 text-ok" strokeWidth={2.5} /> : <ClipboardCopy className="size-4" strokeWidth={1.75} />}
                {copied ? "Copied" : "Copy prompt"}
              </Button>
            </div>
            <pre className="max-h-44 overflow-auto rounded-lg border border-border bg-bg p-3 font-mono text-[11.5px] leading-relaxed text-ink-dim whitespace-pre-wrap">{req.prompt}</pre>
          </section>

          <section>
            <label className="mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-sub">
              2 · Paste into ChatGPT, Claude, Gemini, any model &middot; 3 · paste its reply here
            </label>
            <textarea
              value={reply}
              onChange={(e) => {
                setReply(e.target.value);
                if (error) setError(null);
              }}
              rows={7}
              placeholder="Paste the model's whole answer here…"
              spellCheck={false}
              className="w-full resize-y rounded-lg border border-border bg-bg p-3 font-mono text-[12.5px] leading-relaxed text-ink outline-none placeholder:text-dim focus:border-accent-line"
            />
            {error && <p className="mt-2 text-[13px] text-danger">{error}</p>}
          </section>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
          <Button variant="ghost" size="md" onClick={() => manualBridge.cancel()}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={render} disabled={!reply.trim()}>
            Render result
          </Button>
        </div>
      </div>
    </div>
  );
}
