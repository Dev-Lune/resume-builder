"use client";

import { Check, Minus } from "lucide-react";
import { fitLabel, scoreResume } from "@/lib/ats";
import { cn } from "@/lib/cn";
import { SAMPLE_RESUME } from "@/lib/sample";
import { gsap, STORY_DESKTOP, useGsapStory } from "@/lib/useGsapStory";

const R = 64;
const C = 2 * Math.PI * R;

/** Act 5 — the fit score. Ring sweeps and the twelve checks tick in on enter. */
export function FitAct() {
  const fit = scoreResume(SAMPLE_RESUME);
  const target = C * (1 - fit.score / 100);

  const scope = useGsapStory<HTMLElement>((mm, root) => {
    mm.add(STORY_DESKTOP, () => {
      const num = root.querySelector<HTMLElement>(".fit-num");
      const counter = { v: 0 };
      const st = { trigger: ".fit-card", start: "top 78%" } as const;
      gsap.fromTo(".fit-arc", { strokeDashoffset: C }, { strokeDashoffset: target, duration: 1.2, ease: "power2.out", scrollTrigger: st });
      gsap.fromTo(counter, { v: 0 }, { v: fit.score, duration: 1.2, ease: "power2.out", scrollTrigger: st, onUpdate: () => num && (num.textContent = String(Math.round(counter.v))) });
      gsap.from(".fit-check", { opacity: 0, x: -12, duration: 0.5, stagger: 0.06, ease: "power2.out", scrollTrigger: { trigger: ".fit-list", start: "top 82%" } });
    });
  });

  return (
    <section ref={scope} id="fit" className="mx-auto max-w-5xl px-5 py-24 md:px-8">
      <div className="fit-card rounded-[2rem] border border-line bg-surface p-8 shadow-sheet md:p-12">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[auto_1fr]">
          <div className="mx-auto flex flex-col items-center">
            <span className="relative grid place-items-center">
              <svg viewBox="0 0 150 150" className="size-40 -rotate-90">
                <circle cx="75" cy="75" r={R} fill="none" stroke="var(--line)" strokeWidth="10" />
                <circle className="fit-arc" cx="75" cy="75" r={R} fill="none" stroke="var(--accent)" strokeWidth="10" strokeLinecap="round" strokeDasharray={C} style={{ strokeDashoffset: target }} />
              </svg>
              <span className="absolute text-center">
                <span className="fit-num block font-display text-4xl text-accent">{fit.score}</span>
                <span className="block text-[11px] text-sub">of 100</span>
              </span>
            </span>
            <span className="mt-3 text-[13px] font-medium text-ink-dim">{fitLabel(fit.score)}</span>
          </div>

          <div>
            <h2 className="font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-tight tracking-[-0.015em]">A fit score you can act on</h2>
            <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-ink-dim">
              Twelve checks a parser and a recruiter both make. In the editor each open check is one tap to the section that fixes it.
            </p>
            <ul className="fit-list mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {fit.checks.map((c) => (
                <li key={c.id} className={cn("fit-check inline-flex items-center gap-2 rounded-lg border border-line bg-raised px-3 py-2 text-[13px]", c.ok ? "text-ink-dim" : "text-sub")}>
                  {c.ok ? <Check className="size-3.5 shrink-0 text-ok" strokeWidth={2.5} /> : <Minus className="size-3.5 shrink-0 text-dim" strokeWidth={2.5} />}
                  {c.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
