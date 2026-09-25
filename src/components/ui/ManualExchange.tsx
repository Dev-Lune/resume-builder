"use client";

import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { ClipboardType, X } from "lucide-react";
import { manualBridge, manualInline, useInlineHosted, useManualRequest, type ManualRequest } from "@/lib/manualBridge";
import { ManualBody } from "./ManualBody";

/**
 * Global dialog for the "Manual (no key)" provider, used by tools outside the
 * builder (tailor, summary, cover letter...). It stays out of the way whenever a
 * page hosts the exchange inline. It never closes on an outside click: losing a
 * half-done copy-paste to a stray click is the worst outcome here. Close with the
 * X, Cancel, or Escape while the reply box is still empty.
 */
export function ManualExchange() {
  const req = useManualRequest();
  const hosted = useInlineHosted();
  if (!req || hosted) return null;
  return <Dialog key={`${req.title}:${req.prompt.length}`} req={req} />;
}

const FOCUSABLE = 'button:not([disabled]), [href], textarea, input, select, summary, [tabindex]:not([tabindex="-1"])';

function Dialog({ req }: { req: ManualRequest }) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Lock page scroll while open; give focus back to where it was on close.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      const ta = panel.current?.querySelector("textarea");
      if (!ta?.value.trim()) manualBridge.cancel();
      return;
    }
    if (e.key !== "Tab" || !panel.current) return;
    const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <div aria-hidden="true" className="manual-scrim absolute inset-0" style={{ background: "color-mix(in srgb, var(--bg) 62%, transparent)" }} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        className="manual-panel relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-float sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
              <ClipboardType className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <h2 id={titleId} className="text-[17px] font-semibold leading-tight text-ink">
                {req.title}
              </h2>
              <p className="mt-0.5 text-[13px] text-sub">No key needed. Two steps, about a minute.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => manualBridge.cancel()}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-sub transition-colors hover:bg-raised hover:text-ink"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <ManualBody req={req} onCancel={() => manualBridge.cancel()} />
        </div>
      </div>
    </div>
  );
}

/**
 * The same exchange, rendered in place inside a page (the builder's Draft step).
 * While mounted it tells the global dialog to stand down.
 */
export function ManualInline({ onCancel }: { onCancel?: () => void }) {
  const req = useManualRequest();
  // Layout effect: register before paint so the dialog never flashes.
  useLayoutEffect(() => manualInline.mount(), []);

  if (!req) {
    return <p className="rounded-xl border border-line bg-raised/60 p-4 text-[14px] text-sub">Putting your prompt together...</p>;
  }
  return (
    <ManualBody
      key={`${req.title}:${req.prompt.length}`}
      req={req}
      onCancel={() => {
        manualBridge.cancel();
        onCancel?.();
      }}
    />
  );
}
