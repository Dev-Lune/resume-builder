"use client";

import { useState } from "react";
import { PenLine, ScanSearch, Sparkles, Target } from "lucide-react";
import { CheckRow, KeywordChips, VariantList } from "@/components/editor/bits";
import { Button } from "@/components/ui/Button";
import { Tape } from "@/components/ui/Tape";
import { scoreResume } from "@/lib/ats";
import { cn } from "@/lib/cn";
import { SAMPLE_RESUME } from "@/lib/sample";

const TOOLS = [
  { id: "interview", name: "Interview draft", line: "Questions for your role; a resume from your answers.", icon: PenLine },
  { id: "rewrite", name: "Bullet rewrite", line: "Three versions of any line. Same facts, number first.", icon: Sparkles },
  { id: "tailor", name: "Tailor to a posting", line: "Keyword gap, reworded bullets, nothing invented.", icon: Target },
  { id: "fit", name: "Fit score", line: "Twelve checks a parser and a recruiter both make.", icon: ScanSearch },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

const sampleFit = scoreResume({
  ...SAMPLE_RESUME,
  experience: SAMPLE_RESUME.experience.map((e, i) => (i === 1 ? { ...e, bullets: e.bullets.map((b) => b.replace(/\d[\d.,%]*/g, "several")) } : e)),
});

const VARIANTS = [
  "Cut LCP 63%, from 3.8s to 1.4s on mid-range Android, by splitting the bundle per payment method and deferring the fraud SDK",
  "Owned checkout performance for 3.2M monthly sessions, taking LCP from 3.8s to 1.4s through per-method bundles and a deferred fraud SDK",
  "Brought mid-range Android checkout to a 1.4s LCP, from 3.8s, lifting completion on the slowest devices by deferring the fraud SDK",
];

/** The tools showcase, used by both themes. A list of tools on the left drives a
    single live stage on the right; styled entirely from tokens, so it reads as
    Cloud in light and Night Bench in dark. */
export function Switchboard() {
  const [active, setActive] = useState<ToolId>("interview");
  const idx = TOOLS.findIndex((t) => t.id === active);
  const current = TOOLS[idx];

  return (
    <section id="tools" className="mx-auto max-w-6xl px-5 py-24 hairline-t md:px-8 md:py-32">
      <div className="max-w-2xl">
        <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.01em]">Four tools, one sheet.</h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-dim">
          The model never sees a blank page and never gets to invent. It works from what you typed and shows the change before it lands.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr] lg:gap-10">
        <ul role="tablist" aria-label="Tools" className="flex flex-col gap-2">
          {TOOLS.map((t, i) => {
            const on = t.id === active;
            const Icon = t.icon;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls={`stage-${t.id}`}
                  id={`tab-${t.id}`}
                  onClick={() => setActive(t.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                    on ? "border-accent bg-accent-soft" : "border-border hover:bg-raised",
                  )}
                >
                  <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-md transition-colors", on ? "bg-accent text-accent-ink" : "bg-raised text-sub")}>
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-baseline gap-2">
                      <span className="font-mono text-[10px] text-sub">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-display text-lg leading-tight">{t.name}</span>
                    </span>
                    <span className={cn("mt-0.5 block text-[13px] leading-snug", on ? "text-ink-dim" : "text-sub")}>{t.line}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="relative flex min-h-[440px] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-float">
          <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
            <span className="flex items-center gap-2.5">
              <span className="size-1.5 rounded-full bg-accent pulse-dot" aria-hidden="true" />
              <span className="font-display text-lg">{current.name}</span>
            </span>
            <span className="font-mono text-[11px] tabular text-sub">
              {String(idx + 1).padStart(2, "0")} / {String(TOOLS.length).padStart(2, "0")}
            </span>
          </header>

          <div className="flex-1 p-5 md:p-7">
            {active === "interview" && (
              <Stage id="interview">
                <Tape value={3} max={8} label="Interview progress" format={(v) => `${v} of 8`} className="mb-8" />
                <p className="text-xl leading-snug md:text-2xl">What shipped at Kestrel Pay that you would point a hiring manager to first, and what changed because of it?</p>
                <p className="mt-2 text-sm text-sub">A good answer names the thing, the scale it ran at, and one number that moved.</p>
                <div className="mt-5 rounded-lg border border-border bg-raised p-4 text-[15px] leading-relaxed text-ink">
                  Rebuilt the hosted checkout with a team of 4. Conversion went from 61% to about 72% and it handles around 3.2M sessions a month now.
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" tabIndex={-1}>Skip</Button>
                  <Button variant="primary" size="sm" tabIndex={-1}>Next question</Button>
                </div>
              </Stage>
            )}

            {active === "rewrite" && (
              <Stage id="rewrite">
                <p className="text-xs text-sub">Your line</p>
                <p className="mt-1 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm leading-relaxed text-ink-dim">
                  Improved the performance of the checkout page for Android users by optimising the bundle and lazy loading the fraud SDK, LCP went from 3.8s to 1.4s
                </p>
                <p className="mt-5 flex items-center gap-1.5 text-xs text-sub">
                  <Sparkles className="size-3.5" strokeWidth={1.5} /> Three rewrites, same facts
                </p>
                <div className="mt-2">
                  <VariantList variants={VARIANTS} onPick={() => {}} />
                </div>
              </Stage>
            )}

            {active === "tailor" && (
              <Stage id="tailor">
                <p className="text-xs text-sub">From the posting</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-dim">
                  Senior Frontend Engineer, Payments. React, TypeScript, Next.js. Experience with Core Web Vitals, WCAG accessibility, design systems, and GraphQL. Familiarity with PCI DSS a plus.
                </p>
                <KeywordChips
                  className="mt-5"
                  matched={["React", "TypeScript", "Next.js", "Core Web Vitals", "WCAG", "Design systems", "Payments"]}
                  missing={["GraphQL", "PCI DSS"]}
                />
                <ul className="mt-5 flex flex-col gap-1.5 text-sm leading-relaxed text-ink-dim">
                  <li>Headline now mirrors the posting: Senior Frontend Engineer, Payments.</li>
                  <li>Checkout bullet moves first and says Core Web Vitals where it said performance.</li>
                  <li>GraphQL and PCI DSS are not in your history. Add them only if true.</li>
                </ul>
              </Stage>
            )}

            {active === "fit" && (
              <Stage id="fit">
                <div className="mb-8 mt-6">
                  <Tape value={sampleFit.score} label="Fit score" />
                </div>
                <ul>
                  {sampleFit.checks
                    .filter((c) => ["metrics", "verbs", "contact", "skills"].includes(c.id))
                    .sort((a, b) => Number(a.ok) - Number(b.ok))
                    .map((c) => (
                      <CheckRow key={c.id} check={c} />
                    ))}
                </ul>
              </Stage>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stage({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div key={id} id={`stage-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} className="fade">
      {children}
    </div>
  );
}
