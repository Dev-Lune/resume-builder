import Link from "next/link";
import { cn } from "@/lib/cn";

export function Wordmark({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("font-display text-[22px] leading-none tracking-[-0.01em] text-ink", className)} aria-label="Bespoke, home">
      Bespoke
    </Link>
  );
}
