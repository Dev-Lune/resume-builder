"use client";

import { BadgeCheck, Cpu, FileDown, ShieldCheck, type LucideIcon } from "lucide-react";
import { WHY_US } from "@/lib/content";
import { gsap, STORY_DESKTOP, useGsapStory } from "@/lib/useGsapStory";

const ICON: Record<(typeof WHY_US)[number]["key"], LucideIcon> = {
  ai: Cpu,
  private: ShieldCheck,
  free: FileDown,
  honest: BadgeCheck,
};

/** Act — why us. The four differentiators as lamp-lit cells with a faint numeral,
    dealt in on scroll. */
export function WhyUsAct() {
  const scope = useGsapStory<HTMLElement>(() => {
    gsap.matchMedia().add(STORY_DESKTOP, () => {
      gsap.from(".why-cell", {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: ".why-grid", start: "top 80%" },
      });
    });
  });

  return (
    <section ref={scope} id="why" className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
      <div className="max-w-2xl">
        <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-accent">Why us</p>
        <h2 className="mt-3 font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.05] tracking-[-0.015em]">Built for you, not for a subscription.</h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-dim">Most AI resume tools rent you your own resume. This one gives it to you, keeps it on your machine, and runs on whatever AI you already have.</p>
      </div>

      <div className="why-grid mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
        {WHY_US.map((w, i) => {
          const Icon = ICON[w.key];
          return (
            <div key={w.key} className="why-cell relative overflow-hidden bg-surface p-6 md:p-8">
              <span className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[7rem] leading-none text-ink opacity-[0.04]">{i + 1}</span>
              <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-4 font-display text-xl">{w.title}</h3>
              <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-dim">{w.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
