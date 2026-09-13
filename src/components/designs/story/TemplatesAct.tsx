"use client";

import { useRef, useState } from "react";
import { ScaledSheet } from "@/components/resume/ScaledSheet";
import { cn } from "@/lib/cn";
import { TEMPLATES } from "@/lib/content";
import { SAMPLE_RESUME } from "@/lib/sample";
import { gsap, STORY_DESKTOP, useGsapStory } from "@/lib/useGsapStory";

/** Act 4 — pick a look. On desktop the sheet morphs through every template as you
    scroll a pinned track; on mobile the pills are a plain tap switcher. */
export function TemplatesAct() {
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  const tpl = TEMPLATES[idx];

  const scope = useGsapStory<HTMLElement>(() => {
    gsap.matchMedia().add(STORY_DESKTOP, () => {
      const set = (i: number) => {
        if (i !== idxRef.current) {
          idxRef.current = i;
          setIdx(i);
          gsap.fromTo(".tpl-sheet", { opacity: 0.35, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", overwrite: true });
        }
      };
      gsap.timeline({
        scrollTrigger: {
          trigger: ".tpl-stage",
          start: "top top",
          end: () => "+=" + window.innerHeight * 3.2,
          scrub: true,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => set(Math.min(TEMPLATES.length - 1, Math.floor(self.progress * TEMPLATES.length))),
        },
      });
    });
  });

  return (
    <section ref={scope} id="templates" className="templates-act">
      <div className="tpl-stage flex min-h-screen flex-col items-center justify-center px-5 py-16 md:px-8">
        <h2 className="text-center font-display text-[clamp(2rem,4.4vw,3rem)] leading-tight tracking-[-0.015em]">Pick a look, keep the substance</h2>
        <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
          {TEMPLATES.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                idxRef.current = i;
                setIdx(i);
              }}
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
        <p className="mx-auto mt-3 min-h-[2.5em] max-w-[46ch] text-center text-[14px] leading-relaxed text-ink-dim">{tpl.line}</p>
        <div className="tpl-sheet mx-auto mt-6 w-fit rounded-3xl border border-line bg-raised p-4 shadow-sheet">
          <div className="w-[min(440px,84vw)]">
            <ScaledSheet resume={{ ...SAMPLE_RESUME, template: tpl.id }} guides={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
