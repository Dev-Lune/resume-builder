"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { CLOSING, HERO } from "@/lib/content";
import { gsap, STORY_DESKTOP, useGsapStory } from "@/lib/useGsapStory";

/** Act 6 — the close. Headline rises, one primary call to action. */
export function ClosingAct() {
  const scope = useGsapStory<HTMLElement>(() => {
    gsap.matchMedia().add(STORY_DESKTOP, () => {
      gsap.from(".close-rise", { opacity: 0, y: 28, duration: 0.8, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: ".close-act", start: "top 78%" } });
    });
  });

  return (
    <section ref={scope} className="close-act mx-auto max-w-3xl px-5 py-28 text-center md:py-36">
      <h2 className="close-rise font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.02em]">{CLOSING.headline}</h2>
      <p className="close-rise mx-auto mt-4 max-w-[48ch] text-lg leading-relaxed text-ink-dim">{CLOSING.sub}</p>
      <Link href={HERO.primary.href} className={cn(buttonClass("primary", "lg"), "close-rise mt-8")}>
        {HERO.primary.label} <ArrowRight className="size-4" strokeWidth={2} />
      </Link>
    </section>
  );
}
