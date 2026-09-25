/**
 * Unpicked hero variants (A-D) from the Sep 2026 landing lab. Hero E (the banner)
 * won and lives in Hero.tsx. Kept type-checked and unimported so a pick can be
 * revisited without rebuilding from scratch.
 */
import { ArrowRight, Check, Lightbulb, Sparkles } from "lucide-react";
import { ScaledSheet } from "@/components/resume/ScaledSheet";
import { cn } from "@/lib/cn";
import { SAMPLE_RESUME } from "@/lib/sample";
import { HERO } from "./copy";
import { CtaRow, FitRing, Glow, HeroTitle, Kicker, SAMPLE_FIT, SheetCard, TrustLine } from "./visuals";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

/** A. Split: the pitch on the left, the finished resume on the right. */
export function HeroA() {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-5 pb-20 pt-10 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-16">
      <div>
        <Kicker className="rise" />
        <HeroTitle className="rise [--d:60ms] mt-6" />
        <p className="rise mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-dim" style={d(120)}>
          {HERO.sub}
        </p>
        <CtaRow className="rise [--d:180ms] mt-8" />
        <TrustLine className="rise [--d:240ms] mt-5" />
      </div>
      <SheetCard className="rise [--d:160ms] mx-auto w-[min(440px,84vw)]" />
    </section>
  );
}

/** B. Centered, with the builder itself as the picture. */
export function HeroB() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 pt-10 text-center md:px-6 lg:pt-16">
      <Kicker className="rise" />
      <HeroTitle className="rise [--d:60ms] mx-auto mt-6 max-w-[18ch]" />
      <p className="rise mx-auto mt-6 max-w-[52ch] text-lg leading-relaxed text-ink-dim" style={d(120)}>
        {HERO.sub}
      </p>
      <CtaRow center className="rise [--d:180ms] mt-8" />
      <TrustLine className="rise [--d:240ms] mt-5 justify-center" />

      <div className="rise relative mx-auto mt-14 max-w-5xl text-left" style={d(240)} aria-hidden="true">
        <Glow />
        <div className="relative overflow-hidden rounded-[24px] border border-line bg-surface shadow-sheet">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 rounded-full bg-raised px-3 py-1 text-[12px] text-sub">resume.devlune.in/new</span>
          </div>
          <div className="grid grid-cols-1 gap-6 bg-canvas p-5 md:grid-cols-[1fr_0.9fr] md:p-7">
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-card md:p-6">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-[12px] font-semibold text-accent">Question 2 of 8</span>
              <div className="mt-4 flex gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
                  <span key={k} className={cn("h-1.5 flex-1 rounded-full", k === 0 ? "bg-ok" : k === 1 ? "bg-accent" : "bg-border")} />
                ))}
              </div>
              <p className="mt-5 font-display text-[22px] leading-snug text-ink">What results from that role would you put at the top of the page?</p>
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-raised px-3 py-2.5 text-[13px] text-ink-dim">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.75} />
                One number that moved: users, revenue, time or cost.
              </p>
              <div className="mt-3 rounded-xl border border-border bg-surface px-3.5 py-3 text-[14px] leading-relaxed text-ink">
                Rebuilt checkout with a team of three. Load time dropped by 40% and conversion went up 12%.
                <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-accent" />
              </div>
              <div className="mt-4 flex justify-end">
                <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-[14px] font-medium text-accent-ink">
                  Next question <ArrowRight className="size-4" strokeWidth={2} />
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-3 shadow-card">
              <ScaledSheet resume={SAMPLE_RESUME} guides={false} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const NOTES = `worked at acme 2021-now, frontend lead
- rebuilt checkout, way faster (40%?)
- led 3 devs, did code reviews
- react typescript next graphql
before: agency, built sites for clients
b.tech cse 2017`;

/** C. Before and after: rough notes in, a finished resume out. */
export function HeroC() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 pt-10 md:px-6 lg:pt-16">
      <div className="text-center">
        <Kicker className="rise" />
        <HeroTitle className="rise [--d:60ms] mx-auto mt-6 max-w-[18ch]" />
        <p className="rise mx-auto mt-6 max-w-[52ch] text-lg leading-relaxed text-ink-dim" style={d(120)}>
          {HERO.sub}
        </p>
        <CtaRow center className="rise [--d:180ms] mt-8" />
      </div>

      <div className="rise relative mt-14 grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1.1fr]" style={d(240)} aria-hidden="true">
        <Glow />
        <div className="relative rounded-[22px] border border-line bg-surface p-5 shadow-card md:p-6">
          <span className="rounded-full bg-raised px-3 py-1 text-[12px] font-semibold text-sub">What you have</span>
          <pre className="mt-4 whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-sub">{NOTES}</pre>
        </div>
        <div className="relative mx-auto grid size-14 place-items-center rounded-full bg-accent text-accent-ink shadow-float md:rotate-0">
          <Sparkles className="size-6" strokeWidth={1.75} />
        </div>
        <div className="relative rounded-[22px] border border-line bg-surface p-3 shadow-sheet">
          <span className="absolute -top-3 left-5 z-10 rounded-full bg-ok px-3 py-1 text-[12px] font-semibold text-white shadow-card">What you get</span>
          <div className="overflow-hidden rounded-xl">
            <ScaledSheet resume={SAMPLE_RESUME} guides={false} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** D. The interview: a question, a plain answer, the bullet it becomes. */
export function HeroD() {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-5 pb-20 pt-10 md:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:pt-16">
      <div className="rise relative order-2 lg:order-1" aria-hidden="true">
        <Glow />
        <div className="relative flex flex-col gap-3 rounded-[24px] border border-line bg-surface p-5 shadow-sheet md:p-6">
          <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-raised px-4 py-3 text-[14.5px] leading-relaxed text-ink">
            What results from your last role would you put at the top?
          </div>
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-accent px-4 py-3 text-[14.5px] leading-relaxed text-accent-ink">
            rebuilt checkout with 3 devs, it got like 40% faster
          </div>
          <div className="flex items-center gap-2 pt-1 text-[12px] font-medium text-sub">
            <Sparkles className="size-3.5 text-accent" strokeWidth={2} /> Becomes this line on your resume
          </div>
          <div className="rounded-2xl border border-ok/40 bg-ok-soft px-4 py-3.5">
            <p className="flex items-start gap-2.5 text-[14.5px] leading-relaxed text-ink">
              <Check className="mt-1 size-4 shrink-0 text-ok" strokeWidth={2.5} />
              Led a three-engineer rebuild of checkout, cutting page load time by 40%
            </p>
          </div>
          <div className="mt-1 flex items-center gap-3 rounded-2xl bg-raised px-4 py-3">
            <FitRing score={SAMPLE_FIT.score} size={40} />
            <span className="text-[13.5px] text-ink-dim">Your ATS score updates as you edit</span>
          </div>
        </div>
      </div>
      <div className="order-1 lg:order-2">
        <Kicker className="rise" />
        <HeroTitle className="rise [--d:60ms] mt-6" size="lg" />
        <p className="rise mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-dim" style={d(120)}>
          {HERO.sub}
        </p>
        <CtaRow className="rise [--d:180ms] mt-8" />
        <TrustLine className="rise [--d:240ms] mt-5" />
      </div>
    </section>
  );
}
