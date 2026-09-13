"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useScrolled } from "@/components/lab/Reveal";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { buttonClass, IconButton } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { NAV_LINKS } from "@/lib/content";
import { cn } from "@/lib/cn";

/** Night Bench header: a floating rounded pill that blends into the canvas at
    the top and frosts on scroll, matching the Cloud header. */
export function Nav() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="sticky top-3 z-30 px-3">
        <header
          className={cn(
            "mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full pl-6 pr-3 transition-all duration-300",
            scrolled ? "glass shadow-float" : "border border-transparent",
          )}
        >
          <Wordmark />
          <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-ink-dim transition-colors hover:text-ink">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link href="/scan" className={cn(buttonClass("ghost", "sm"), "hidden sm:inline-flex")}>
              ATS scan
            </Link>
            <Link href="/applications" className={cn(buttonClass("ghost", "sm"), "hidden md:inline-flex")}>
              Applications
            </Link>
            <Link href="/new" className={buttonClass("primary", "sm")}>
              Build my resume
            </Link>
            <IconButton label={open ? "Close menu" : "Open menu"} size="sm" className="md:hidden" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
              {open ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
            </IconButton>
          </div>
        </header>
      </div>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          "glass fixed inset-0 z-20 flex flex-col items-start justify-center gap-2 px-8 pt-14 transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="font-display text-4xl text-ink" tabIndex={open ? 0 : -1}>
            {l.label}
          </a>
        ))}
        <Link href="/scan" onClick={() => setOpen(false)} className="mt-6 text-lg text-ink-dim" tabIndex={open ? 0 : -1}>
          ATS scan
        </Link>
        <Link href="/applications" onClick={() => setOpen(false)} className="text-lg text-ink-dim" tabIndex={open ? 0 : -1}>
          Applications
        </Link>
        <Link href="/resumes" onClick={() => setOpen(false)} className="text-lg text-ink-dim" tabIndex={open ? 0 : -1}>
          My resumes
        </Link>
      </div>
    </>
  );
}
