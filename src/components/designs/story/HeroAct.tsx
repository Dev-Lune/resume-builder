"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScaledSheet } from "@/components/resume/ScaledSheet";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { HERO } from "@/lib/content";
import { SAMPLE_RESUME } from "@/lib/sample";
import { gsap, STORY_DESKTOP, useGsapStory } from "@/lib/useGsapStory";

/** Act 1 — the blank page. Copy rises in; a faint sheet sits behind, ready to fill. */
export function HeroAct() {
  const scope = useGsapStory<HTMLElement>((mm) => {
    mm.add(STORY_DESKTOP, () => {
      gsap.from(".hero-rise", { y: 26, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.09, delay: 0.05 });
      // Parallax the sheet away as you leave the hero.
      gsap.to(".hero-sheet", {
        yPercent: -12,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: { trigger: ".hero-act", start: "top top", end: "bottom top", scrub: true },
      });
    });
  });

  return (
    <section ref={scope} className="hero-act relative mx-auto grid min-h-[92vh] max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-10 pt-20 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
      <div className="relative z-[1]">
        <span className="hero-rise inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[12px] text-ink-dim shadow-sm">
          <span className="size-1.5 rounded-full bg-accent" /> Free, no account, runs in your browser
        </span>
        <h1 className="hero-rise mt-6 font-display text-[clamp(2.6rem,6vw,4.75rem)] leading-[1.02] tracking-[-0.02em]">{HERO.headline}</h1>
        <p className="hero-rise mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-dim">{HERO.sub}</p>
        <div className="hero-rise mt-8 flex flex-wrap gap-3">
          <Link href={HERO.primary.href} className={buttonClass("primary", "lg")}>
            {HERO.primary.label} <ArrowRight className="size-4" strokeWidth={2} />
          </Link>
          <Link href={HERO.secondary.href} className={buttonClass("secondary", "lg")}>
            {HERO.secondary.label}
          </Link>
        </div>
        <p className="hero-rise mt-6 text-[13px] text-sub">Scroll to watch a resume build itself.</p>
      </div>

      <div className={cn("hero-sheet relative mx-auto w-[min(420px,82vw)]")} aria-hidden="true">
        <div className="rounded-3xl border border-line bg-raised p-4 shadow-sheet">
          <ScaledSheet resume={SAMPLE_RESUME} guides={false} />
        </div>
      </div>
    </section>
  );
}
