"use client";

import { Check, Minus } from "lucide-react";
import { COMPARE } from "@/lib/content";
import { gsap, STORY_DESKTOP, useGsapStory } from "@/lib/useGsapStory";

/** Act — how it stacks up. A two-column comparison; our column is lit, rows deal
    in on scroll. Kept generic (no named rivals) on purpose. */
export function CompareAct() {
  const scope = useGsapStory<HTMLElement>(() => {
    gsap.matchMedia().add(STORY_DESKTOP, () => {
      gsap.from(".compare-row", {
        opacity: 0,
        y: 16,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.07,
        scrollTrigger: { trigger: ".compare-table", start: "top 82%" },
      });
    });
  });

  return (
    <section ref={scope} className="mx-auto max-w-4xl px-5 py-20 md:px-8 md:py-28">
      <h2 className="text-center font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-tight tracking-[-0.015em]">How it stacks up</h2>
      <p className="mx-auto mt-3 max-w-[48ch] text-center text-[15px] leading-relaxed text-ink-dim">The same job, without the account, the paywall, or the guesswork.</p>

      <div className="mt-10 overflow-x-auto">
        <div className="compare-table mx-auto min-w-[560px] overflow-hidden rounded-2xl border border-border">
          {/* header */}
          <div className="grid grid-cols-[1.5fr_1fr_1fr] bg-raised text-[13px] font-medium">
            <div className="px-4 py-3 text-sub" />
            <div className="border-l border-accent-line bg-accent-soft px-4 py-3 font-display text-[15px] text-ink">Bespoke</div>
            <div className="border-l border-border px-4 py-3 text-ink-dim">Typical AI builders</div>
          </div>

          {COMPARE.map((r) => (
            <div key={r.label} className="compare-row grid grid-cols-[1.5fr_1fr_1fr] border-t border-line text-[13.5px]">
              <div className="px-4 py-3 text-ink-dim">{r.label}</div>
              <div className="flex items-start gap-1.5 border-l border-accent-line bg-accent-soft px-4 py-3 text-ink">
                <Check className="mt-0.5 size-3.5 shrink-0 text-accent" strokeWidth={2.5} />
                {r.us}
              </div>
              <div className="flex items-start gap-1.5 border-l border-border px-4 py-3 text-sub">
                <Minus className="mt-0.5 size-3.5 shrink-0 text-dim" strokeWidth={2.5} />
                {r.them}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
