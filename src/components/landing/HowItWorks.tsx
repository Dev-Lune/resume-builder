import { STEPS } from "@/lib/content";

/** Night Bench: a measured track. A hairline runs across, three nodes sit on it,
    an oversized faint numeral behind each. One continuous canvas, amber marks. */
export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-24 hairline-t md:px-8 md:py-32">
      <div className="max-w-2xl">
        <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.01em]">Twelve minutes, three passes.</h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-dim">From a blank page to a resume tuned for the posting, in three moves. Stop after any one.</p>
      </div>

      {/* Desktop: nodes on a shared rule */}
      <ol className="relative mt-20 hidden grid-cols-3 gap-10 md:grid">
        <span className="absolute inset-x-0 top-0 h-px bg-border" aria-hidden="true" />
        {STEPS.map((s) => (
          <li key={s.n} className="relative pt-8">
            <span className="absolute -top-[5px] left-0 size-2.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" aria-hidden="true" />
            <span
              className="pointer-events-none absolute -top-6 right-0 select-none font-display text-[7rem] leading-none text-transparent"
              style={{ WebkitTextStroke: "1px var(--line)" }}
              aria-hidden="true"
            >
              {s.n}
            </span>
            <h3 className="relative font-display text-2xl">{s.title}</h3>
            <p className="relative mt-3 max-w-[40ch] text-[15px] leading-relaxed text-ink-dim">{s.body}</p>
          </li>
        ))}
      </ol>

      {/* Mobile: vertical track */}
      <ol className="mt-12 flex flex-col gap-8 border-l border-border pl-6 md:hidden">
        {STEPS.map((s) => (
          <li key={s.n} className="relative">
            <span className="absolute -left-[27px] top-2 size-2.5 rounded-full bg-accent" aria-hidden="true" />
            <h3 className="font-display text-2xl">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
