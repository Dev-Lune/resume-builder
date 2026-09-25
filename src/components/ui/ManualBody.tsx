"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, Check, ChevronDown, ClipboardCopy, ExternalLink, Loader2 } from "lucide-react";
import { manualBridge, type ManualRequest } from "@/lib/manualBridge";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

/** Copy synchronously so a window.open in the same click keeps its user
    activation (async clipboard + a new tab loses focus and fails). */
function copyNow(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  ta.remove();
  if (!ok) void navigator.clipboard?.writeText(text).catch(() => {});
}

// Prefill only when the URL stays short; long prompts go via the clipboard.
const PREFILL_LIMIT = 6000;
const OPENERS: { name: string; url: (q: string) => string }[] = [
  { name: "ChatGPT", url: (q) => (q.length < PREFILL_LIMIT ? `https://chatgpt.com/?q=${q}` : "https://chatgpt.com/") },
  { name: "Claude", url: (q) => (q.length < PREFILL_LIMIT ? `https://claude.ai/new?q=${q}` : "https://claude.ai/new") },
  { name: "Gemini", url: () => "https://gemini.google.com/app" },
];

type Status = "idle" | "checking" | "bad" | "good";

/**
 * The manual "bring your own AI" exchange: step 1 copy the prompt (or copy and
 * open a chat app), step 2 paste the reply. A pasted reply is checked at once and
 * finishes on its own when it is valid; no extra click. Shared by the builder's
 * inline Draft step and the global dialog.
 */
export function ManualBody({ req, onCancel, autoFocus = true }: { req: ManualRequest; onCancel: () => void; autoFocus?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const copyRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusId = useId();

  useEffect(() => {
    if (autoFocus) copyRef.current?.focus();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [autoFocus]);

  const markCopied = (hint: string) => {
    setCopied(true);
    setNote(hint);
  };

  const copy = () => {
    copyNow(req.prompt);
    markCopied("Copied. Paste it into any chat model, send it, then bring the whole reply back here.");
    replyRef.current?.focus();
  };

  const openIn = (name: string, url: (q: string) => string) => {
    copyNow(req.prompt);
    window.open(url(encodeURIComponent(req.prompt)), "_blank", "noopener,noreferrer");
    markCopied(`Copied and opened ${name}. Paste with Ctrl+V (Cmd+V on a Mac), send it, then paste ${name}'s reply below.`);
  };

  const check = (text: string, finishIfGood: boolean) => {
    if (!text.trim()) {
      setStatus("idle");
      setMessage(null);
      return;
    }
    const res = req.parse(text);
    if (res.ok) {
      setStatus("good");
      setMessage("That's the one. Building it now.");
      if (finishIfGood) {
        timer.current = setTimeout(() => manualBridge.submit(text), 450);
      }
    } else {
      setStatus("bad");
      setMessage("That reply is missing the result. Paste the model's whole answer, including the part in curly braces.");
    }
  };

  const onChange = (v: string) => {
    const jumped = v.length - reply.length > 60; // a paste, not typing
    setReply(v);
    if (timer.current) clearTimeout(timer.current);
    if (jumped) check(v, true);
    else if (status !== "idle") {
      setStatus("idle");
      setMessage(null);
    }
  };

  const useReply = () => {
    const res = manualBridge.submit(reply);
    if (!res.ok) {
      setStatus("bad");
      setMessage(res.error);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Step 1 */}
      <section className={cn("rounded-xl border p-4 transition-colors", copied ? "border-line bg-raised/60" : "border-accent-line bg-accent-soft")} aria-labelledby={`${statusId}-s1`}>
        <div className="flex items-start gap-3">
          <StepDot n={1} done={copied} active={!copied} />
          <div className="min-w-0 flex-1">
            <h3 id={`${statusId}-s1`} className="text-[15px] font-semibold text-ink">Copy the prompt</h3>
            <p className="mt-0.5 text-[13px] leading-relaxed text-sub">It already holds your details and the exact format we need back.</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button ref={copyRef} variant={copied ? "secondary" : "primary"} size="md" onClick={copy}>
                {copied ? <Check className="size-4" strokeWidth={2.25} /> : <ClipboardCopy className="size-4" strokeWidth={1.75} />}
                {copied ? "Copied" : "Copy prompt"}
              </Button>
              {OPENERS.map((o) => (
                <Button key={o.name} variant="secondary" size="md" onClick={() => openIn(o.name, o.url)} aria-label={`Copy the prompt and open ${o.name} in a new tab`}>
                  {o.name}
                  <ExternalLink className="size-3.5 text-sub" strokeWidth={1.75} />
                </Button>
              ))}
            </div>

            {note && <p className="mt-2.5 text-[13px] leading-relaxed text-ink-dim">{note}</p>}

            <details className="group mt-2.5">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[13px] text-sub hover:text-ink [&::-webkit-details-marker]:hidden">
                <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" strokeWidth={2} />
                See the prompt
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-surface p-3 font-mono text-[11.5px] leading-relaxed text-ink-dim">{req.prompt}</pre>
            </details>
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section className={cn("rounded-xl border p-4 transition-colors", copied ? "border-accent-line bg-accent-soft" : "border-line bg-raised/60")} aria-labelledby={`${statusId}-s2`}>
        <div className="flex items-start gap-3">
          <StepDot n={2} done={status === "good"} active={copied && status !== "good"} />
          <div className="min-w-0 flex-1">
            <label id={`${statusId}-s2`} htmlFor={`${statusId}-reply`} className="text-[15px] font-semibold text-ink">
              Paste the whole reply
            </label>
            <p className="mt-0.5 text-[13px] leading-relaxed text-sub">Paste it and we take it from there. No need to tidy it up.</p>
            <textarea
              id={`${statusId}-reply`}
              ref={replyRef}
              value={reply}
              onChange={(e) => onChange(e.target.value)}
              rows={6}
              spellCheck={false}
              aria-describedby={message ? statusId : undefined}
              aria-invalid={status === "bad" || undefined}
              placeholder="Paste the model's answer here"
              className={cn(
                "field mt-3 min-h-[140px] w-full resize-y font-mono text-[12.5px] leading-relaxed",
                status === "bad" && "border-danger",
                status === "good" && "border-ok",
              )}
            />
            <p id={statusId} role="status" aria-live="polite" className={cn("mt-2 flex min-h-[1.25rem] items-start gap-1.5 text-[13px] leading-relaxed", status === "bad" ? "text-danger" : status === "good" ? "text-ok" : "text-sub")}>
              {status === "good" && <Loader2 className="mt-0.5 size-3.5 shrink-0 animate-spin" strokeWidth={2} />}
              {status === "bad" && <AlertCircle className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />}
              {message}
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Button variant="ghost" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="md" onClick={useReply} disabled={!reply.trim() || status === "good"}>
          Use this reply
        </Button>
      </div>
    </div>
  );
}

function StepDot({ n, done, active }: { n: number; done: boolean; active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold",
        done ? "bg-ok text-white" : active ? "bg-accent text-accent-ink" : "border border-border bg-surface text-sub",
      )}
    >
      {done ? <Check className="size-4" strokeWidth={2.5} /> : n}
    </span>
  );
}
