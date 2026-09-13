"use client";

import Link from "next/link";
import { useScrolled } from "@/components/lab/Reveal";
import { ScrollStory } from "@/components/designs/story/ScrollStory";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { HERO, NAV_LINKS } from "@/lib/content";

/** Cloud (light) landing: floating pill nav over the shared scroll story. */
export function CloudLanding() {
  const scrolled = useScrolled();

  return (
    <div className="relative z-[1]">
      <div className="sticky top-3 z-30 px-3">
        <header
          className={cn(
            "mx-auto flex h-14 max-w-4xl items-center justify-between rounded-full px-3 pl-6 transition-all duration-300",
            scrolled ? "border border-line bg-surface/80 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl" : "border border-transparent",
          )}
        >
          <span className="font-display text-xl">Bespoke</span>
          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-[13px] text-ink-dim transition-colors hover:text-ink">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link href="/scan" className={cn(buttonClass("ghost", "sm"), "hidden sm:inline-flex")}>ATS scan</Link>
            <Link href="/applications" className={cn(buttonClass("ghost", "sm"), "hidden md:inline-flex")}>Applications</Link>
            <Link href="/new" className={buttonClass("primary", "sm")}>{HERO.primary.label}</Link>
          </div>
        </header>
      </div>

      <ScrollStory />

      <footer className="mx-auto max-w-5xl px-5 py-10 text-center text-[13px] text-sub">
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <a href="https://devlune.in/privacy" target="_blank" rel="noreferrer" className="hover:text-ink">Privacy</a>
          <a href="https://devlune.in/terms" target="_blank" rel="noreferrer" className="hover:text-ink">Terms</a>
          <a href="https://devlune.in/data-deletion" target="_blank" rel="noreferrer" className="hover:text-ink">Data policy</a>
        </nav>
        <p className="mt-3">
          Bespoke, an AI resume builder. Nothing stored on a server. Built by{" "}
          <a href="https://devlune.in" target="_blank" rel="noreferrer" className="hover:text-ink">DevLune</a>.
        </p>
      </footer>
    </div>
  );
}
