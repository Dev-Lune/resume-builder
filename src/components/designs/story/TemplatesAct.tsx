"use client";

import { useState } from "react";
import { ScaledSheet } from "@/components/resume/ScaledSheet";
import { cn } from "@/lib/cn";
import { TEMPLATES } from "@/lib/content";
import { SAMPLE_RESUME } from "@/lib/sample";

/** "Pick a look, keep the substance" — a plain tap switcher over one sheet.
    Static: tapping a pill swaps the template, no scroll pin or scrub. */
export function TemplatesAct() {
  const [idx, setIdx] = useState(0);
  const tpl = TEMPLATES[idx];

  return (
    <section id="templates" className="mx-auto max-w-4xl px-5 py-24 text-center md:px-8">
      <h2 className="font-display text-[clamp(2rem,4.4vw,3rem)] leading-tight tracking-[-0.015em]">Pick a look, keep the substance</h2>
      <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
        {TEMPLATES.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setIdx(i)}
            aria-pressed={i === idx}
            className={cn(
              "rounded-full border px-5 py-2 text-[14px] font-medium transition-colors",
              i === idx ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-dim hover:border-accent hover:text-ink",
            )}
          >
            {t.name}
          </button>
        ))}
      </div>
      <p className="mx-auto mt-3 min-h-[2.5em] max-w-[46ch] text-[14px] leading-relaxed text-ink-dim">{tpl.line}</p>
      <div className="mx-auto mt-6 w-fit rounded-3xl border border-line bg-raised p-4 shadow-sheet transition-opacity">
        <div className="w-[min(440px,84vw)]">
          <ScaledSheet resume={{ ...SAMPLE_RESUME, template: tpl.id }} guides={false} />
        </div>
      </div>
    </section>
  );
}
