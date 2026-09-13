"use client";

import { ScaledSheet } from "@/components/resume/ScaledSheet";
import { fitLabel, scoreResume } from "@/lib/ats";
import { SAMPLE_RESUME } from "@/lib/sample";
import { gsap, STORY_DESKTOP, useGsapStory } from "@/lib/useGsapStory";

const STEPS = ["Answer a short interview", "The model drafts every line", "Tailor, score, and export"];
const R = 52;
const C = 2 * Math.PI * R;

/**
 * Act 2 — the signature. A stage pins while the real résumé assembles across the
 * scroll: header sets, each section rises in, a fit stamp sweeps and counts up.
 * Desktop only; mobile / reduced motion shows the finished sheet, no pin.
 */
export function BuildAct() {
  const fit = scoreResume(SAMPLE_RESUME);
  const target = C * (1 - fit.score / 100);

  const scope = useGsapStory<HTMLElement>((mm, root) => {
    mm.add(STORY_DESKTOP, () => {
      const num = root.querySelector<HTMLElement>(".build-num");
      const counter = { v: 0 };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".build-stage",
          start: "top top",
          end: () => "+=" + window.innerHeight * 2.8,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.to(".build-track-fill", { scaleY: 1, duration: 10 }, 0)
        .from(".build-sheet .sheet header", { opacity: 0, y: 24, duration: 1 }, 0.2)
        .to(".build-step", { opacity: 1, color: "var(--ink)", stagger: 2.4, duration: 0.6 }, 0.3)
        .from(".build-sheet .sheet .section", { opacity: 0, y: 30, stagger: 1.15, duration: 1.2 }, 0.8)
        .from(".build-stamp", { opacity: 0, y: 18, scale: 0.93, duration: 1 }, 7.4)
        .fromTo(".ring-arc", { strokeDashoffset: C }, { strokeDashoffset: target, duration: 1.8 }, 7.4)
        .fromTo(counter, { v: 0 }, { v: fit.score, duration: 1.8, onUpdate: () => num && (num.textContent = String(Math.round(counter.v))) }, 7.4);
    });
  });

  return (
    <section ref={scope} className="build-act relative">
      <div className="build-stage flex min-h-screen items-center">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left: heading + steps + a scrub track */}
          <div className="relative">
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-accent">Watch it work</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.05] tracking-[-0.015em]">It writes itself.</h2>
            <p className="mt-4 max-w-[42ch] text-lg leading-relaxed text-ink-dim">The same sheet you will edit, filling in as you scroll. Nothing invented, every line from your answers.</p>

            <div className="mt-8 flex gap-4">
              <div className="build-track relative hidden w-[3px] shrink-0 overflow-hidden rounded-full bg-line lg:block">
                <div className="build-track-fill absolute inset-x-0 top-0 h-full origin-top scale-y-0 bg-accent" />
              </div>
              <ul className="flex flex-col gap-3">
                {STEPS.map((s) => (
                  <li key={s} className="build-step text-[15px] text-sub lg:opacity-100">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: the real sheet, assembling */}
          <div className="relative mx-auto w-[min(460px,86vw)]">
            <div className="build-sheet rounded-3xl border border-line bg-raised p-4 shadow-sheet">
              <ScaledSheet resume={SAMPLE_RESUME} guides={false} />
            </div>

            <div className="build-stamp absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-float">
              <span className="relative grid size-16 place-items-center">
                <svg viewBox="0 0 120 120" className="size-16 -rotate-90">
                  <circle cx="60" cy="60" r={R} fill="none" stroke="var(--line)" strokeWidth="9" />
                  <circle
                    className="ring-arc"
                    cx="60"
                    cy="60"
                    r={R}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    style={{ strokeDashoffset: target }}
                  />
                </svg>
                <span className="build-num absolute font-display text-xl text-accent">{fit.score}</span>
              </span>
              <span>
                <span className="block font-display text-base leading-tight">Fit score</span>
                <span className="block text-[13px] text-sub">{fitLabel(fit.score)} · 12 checks</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
