import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

export function FinalBand() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 hairline-t md:px-8 md:py-32">
      <div className="max-w-3xl">
        <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.25rem)] leading-[1] tracking-[-0.015em]">Your next resume takes twelve minutes.</h2>
        <p className="mt-5 max-w-[50ch] text-lg leading-relaxed text-ink-dim">
          No account. Your resume lives in this browser. Only the text you ask the model to work on is sent to OpenAI.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/new" className={buttonClass("primary", "lg")}>
            Build my resume
          </Link>
          <Link href="/resumes" className={buttonClass("ghost", "lg")}>
            Open my resumes
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-5 pb-10 pt-6 hairline-t md:px-8">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <p
          aria-hidden="true"
          className="select-none font-display text-[clamp(4rem,14vw,11rem)] leading-[0.85] tracking-[-0.02em] text-transparent"
          style={{ WebkitTextStroke: "1px var(--border)" }}
        >
          Bespoke
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-sub">
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#tools" className="hover:text-ink">Tools</a>
          <a href="#templates" className="hover:text-ink">Templates</a>
          <a href="#fit" className="hover:text-ink">Fit score</a>
          <Link href="/resumes" className="hover:text-ink">My resumes</Link>
        </nav>
      </div>
      <p className="mt-6 text-xs text-sub">Bespoke. An AI resume builder. Nothing is stored on a server.</p>
    </footer>
  );
}
