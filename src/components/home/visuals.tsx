import Link from "next/link";
import { ArrowRight, Check, FileDown, Sparkles, Upload } from "lucide-react";
import { ScaledSheet } from "@/components/resume/ScaledSheet";
import { buttonClass } from "@/components/ui/Button";
import { fitLabel, scoreResume } from "@/lib/ats";
import { cn } from "@/lib/cn";
import type { Template } from "@/lib/schema";
import { SAMPLE_RESUME } from "@/lib/sample";
import { HERO } from "./copy";

export const SAMPLE_FIT = scoreResume(SAMPLE_RESUME);

/** Two soft blurred circles behind a visual (friendly-ui hero glow). */
export function Glow({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      <div className="absolute -left-10 top-6 size-56 rounded-full bg-accent opacity-20 blur-3xl" />
      <div className="absolute -right-6 bottom-4 size-64 rounded-full bg-ok opacity-15 blur-3xl" />
    </div>
  );
}

/** A small donut with the score in it. */
export function FitRing({ score, size = 44, stroke = 5 }: { score: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ok)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <span className="absolute text-[13px] font-bold tabular-nums text-ink">{score}</span>
    </span>
  );
}

/** A floating white chip; drifts slowly. */
export function Chip({ className, delay = 0, children }: { className?: string; delay?: number; children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className={cn("drift absolute z-10 flex items-center gap-2.5 rounded-2xl border border-line bg-surface px-3 py-2.5 shadow-float", className)}
      style={{ "--drift-delay": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/** The sample resume on a card, with the fit score and export chips around it. */
export function SheetCard({ className, template = "classic", chips = true, glow = true }: { className?: string; template?: Template; chips?: boolean; glow?: boolean }) {
  return (
    <div className={cn("relative", className)}>
      {glow && <Glow />}
      <div className="relative rounded-[22px] border border-line bg-surface p-3 shadow-sheet md:p-4">
        <div className="overflow-hidden rounded-xl">
          <ScaledSheet resume={{ ...SAMPLE_RESUME, template }} guides={false} />
        </div>
      </div>
      {chips && (
        <>
          <Chip className="-left-3 top-[18%] sm:-left-10" delay={0}>
            <FitRing score={SAMPLE_FIT.score} />
            <span className="pr-1">
              <span className="block text-[13px] font-semibold text-ink">ATS score</span>
              <span className="block text-[12px] text-sub">{fitLabel(SAMPLE_FIT.score)}</span>
            </span>
          </Chip>
          <Chip className="-right-2 top-[6%] sm:-right-8" delay={1.4}>
            <span className="grid size-8 place-items-center rounded-lg bg-accent-soft text-accent">
              <Sparkles className="size-4" strokeWidth={1.75} />
            </span>
            <span className="pr-1 text-[13px] font-semibold text-ink">Written from your answers</span>
          </Chip>
          <Chip className="-right-1 bottom-[12%] sm:-right-6" delay={2.6}>
            <span className="grid size-8 place-items-center rounded-lg bg-ok-soft text-ok">
              <FileDown className="size-4" strokeWidth={1.75} />
            </span>
            <span className="pr-1">
              <span className="block text-[13px] font-semibold text-ink">PDF ready</span>
              <span className="block text-[12px] text-sub">Free, no watermark</span>
            </span>
          </Chip>
        </>
      )}
    </div>
  );
}

export function Kicker({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium",
        onDark ? "bg-white/10 text-banner-ink" : "border border-line bg-surface text-ink-dim shadow-card",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-ok" /> {HERO.kicker}
    </span>
  );
}

/** A tailor's tape under the key words: ticks every few pixels, a longer one every
    fifth, drawn in from the left once on load (clip-path reveal). */
export function TapeUnderline() {
  const ticks = Array.from({ length: 60 }, (_, k) => k);
  return (
    <svg aria-hidden="true" viewBox="0 0 300 14" preserveAspectRatio="none" className="tape-draw absolute -bottom-2 left-0 h-[0.22em] min-h-3 w-full">
      <rect x="0.5" y="0.5" width="299" height="13" rx="3" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeOpacity="0.55" />
      {ticks.map((k) => (
        <line key={k} x1={5 + k * 5} x2={5 + k * 5} y1="1" y2={k % 5 === 0 ? 9 : 5} stroke="currentColor" strokeOpacity={k % 5 === 0 ? 0.9 : 0.55} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

export function HeroTitle({ className, size = "xl" }: { className?: string; size?: "xl" | "lg" }) {
  return (
    <h1 className={cn("font-display leading-[1.05]", size === "xl" ? "text-[clamp(2.2rem,6.6vw,5rem)]" : "text-[clamp(2.05rem,5.6vw,4.3rem)]", className)}>
      {HERO.title[0]}{" "}
      <span className="relative inline-block whitespace-nowrap pb-2 text-accent">
        {HERO.accent}
        <TapeUnderline />
      </span>
    </h1>
  );
}

export function CtaRow({ onDark = false, center = false, className }: { onDark?: boolean; center?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", center && "sm:justify-center", className)}>
      <Link href={HERO.primary.href} className={cn(buttonClass("primary", "lg"), "rounded-xl px-7")}>
        {HERO.primary.label} <ArrowRight className="size-4" strokeWidth={2} />
      </Link>
      <Link
        href={HERO.secondary.href}
        className={cn(
          buttonClass("secondary", "lg"),
          "rounded-xl px-6",
          onDark && "border-white/20 bg-white/5 text-banner-ink hover:bg-white/10",
        )}
      >
        <Upload className="size-4" strokeWidth={1.75} /> {HERO.secondary.label}
      </Link>
    </div>
  );
}

export function TrustLine({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <p className={cn("flex items-center gap-2 text-[14px]", onDark ? "text-banner-ink/70" : "text-sub", className)}>
      <Check className="size-4 text-ok" strokeWidth={2.5} /> {HERO.trust}
    </p>
  );
}
