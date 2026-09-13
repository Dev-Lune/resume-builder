import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { ScaledSheet } from "@/components/resume/ScaledSheet";
import { SAMPLE_RESUME } from "@/lib/sample";

export function Hero() {
  return (
    <section className="lamp">
      <div className="hero mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-5 pb-20 pt-12 md:px-8 md:pt-16 lg:grid-cols-[1fr_minmax(0,480px)] lg:gap-16 lg:pt-20">
        <div className="hero-copy max-w-2xl lg:pt-8">
          <h1 className="rise font-display text-[clamp(2.75rem,6vw,4.75rem)] leading-[0.98] text-ink" style={{ "--d": "0ms" } as React.CSSProperties}>
            A resume cut to the job, not off the rack.
          </h1>
          <p className="rise mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-dim md:text-xl" style={{ "--d": "90ms" } as React.CSSProperties}>
            Answer a short interview, get a first draft, edit it beside a live sheet, tailor it to any posting, and export a PDF that parsers read cleanly.
          </p>
          <div className="hero-actions rise mt-9 flex flex-wrap items-center gap-3" style={{ "--d": "180ms" } as React.CSSProperties}>
            <Link href="/new" className={buttonClass("primary", "lg")}>
              Build my resume
            </Link>
            <Link href="/new?mode=import" className={buttonClass("secondary", "lg")}>
              Paste an existing resume
            </Link>
          </div>
        </div>

        <figure className="hero-figure rise mx-auto w-full max-w-[480px] lg:mx-0" style={{ "--d": "260ms" } as React.CSSProperties}>
          <div className="sheet-frame">
            <ScaledSheet resume={SAMPLE_RESUME} maxScale={0.6} guides={false} />
          </div>
          <figcaption className="mt-4 text-[13px] leading-relaxed text-sub">
            The Classic template, rendered from the same component that prints your PDF. One column, real text, system fonts.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
