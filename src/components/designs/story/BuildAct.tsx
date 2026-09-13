import { ScaledSheet } from "@/components/resume/ScaledSheet";
import { fitLabel, scoreResume } from "@/lib/ats";
import { SAMPLE_RESUME } from "@/lib/sample";

const STEPS = ["Answer a short interview", "The model drafts every line", "Tailor, score, and export"];
const R = 52;
const C = 2 * Math.PI * R;

/**
 * "Watch it work" — the sheet beside the pitch. Static: the résumé shows fully
 * assembled with its fit stamp, no scroll pin or scrub.
 */
export function BuildAct() {
  const fit = scoreResume(SAMPLE_RESUME);
  const target = C * (1 - fit.score / 100);

  return (
    <section className="build-act relative">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-accent">Watch it work</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.05] tracking-[-0.015em]">It writes itself.</h2>
          <p className="mt-4 max-w-[42ch] text-lg leading-relaxed text-ink-dim">The same sheet you will edit, built from your answers. Nothing invented, every line from what you tell it.</p>

          <ul className="mt-8 flex flex-col gap-3">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-3 text-[15px] text-ink-dim">
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-accent-line font-mono text-[11px] tabular text-accent">{i + 1}</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-[min(460px,86vw)]">
          <div className="build-sheet rounded-3xl border border-line bg-raised p-4 shadow-sheet">
            <ScaledSheet resume={SAMPLE_RESUME} guides={false} />
          </div>

          <div className="build-stamp absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-float">
            <span className="relative grid size-16 place-items-center">
              <svg viewBox="0 0 120 120" className="size-16 -rotate-90">
                <circle cx="60" cy="60" r={R} fill="none" stroke="var(--line)" strokeWidth="9" />
                <circle cx="60" cy="60" r={R} fill="none" stroke="var(--accent)" strokeWidth="9" strokeLinecap="round" strokeDasharray={C} style={{ strokeDashoffset: target }} />
              </svg>
              <span className="absolute font-display text-xl text-accent">{fit.score}</span>
            </span>
            <span>
              <span className="block font-display text-base leading-tight">Fit score</span>
              <span className="block text-[13px] text-sub">{fitLabel(fit.score)} · 12 checks</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
