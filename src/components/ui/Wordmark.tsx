import Link from "next/link";
import { cn } from "@/lib/cn";

/** The wordmark with its tape mark: a tailor's measuring tape, since bespoke means made to measure. */
export function Wordmark({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-display text-[22px] leading-none tracking-[-0.01em] text-ink", className)} aria-label="Bespoke, home">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 shrink-0 text-accent">
        <rect x="1.5" y="6" width="21" height="12" rx="3.5" fill="currentColor" />
        <g stroke="var(--accent-ink)" strokeWidth="1.4" strokeLinecap="round">
          <line x1="6" y1="6.8" x2="6" y2="12.5" />
          <line x1="9.5" y1="6.8" x2="9.5" y2="10" />
          <line x1="13" y1="6.8" x2="13" y2="12.5" />
          <line x1="16.5" y1="6.8" x2="16.5" y2="10" />
        </g>
      </svg>
      Bespoke
    </Link>
  );
}
