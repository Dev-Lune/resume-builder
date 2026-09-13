import { scoreResume } from "@/lib/ats";
import { emptyResume } from "@/lib/schema";

/** The twelve checks, read straight from the scoring code so this list can never drift. */
export function FitChecks() {
  const checks = scoreResume(emptyResume()).checks;
  const half = Math.ceil(checks.length / 2);
  const cols = [checks.slice(0, half), checks.slice(half)];

  return (
    <section id="fit" className="mx-auto max-w-6xl px-5 py-24 hairline-t md:px-8 md:py-32">
      <h2 className="max-w-[20ch] font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.01em]">
        A score you can argue with.
      </h2>
      <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-ink-dim">
        Twelve checks, weighted the way parsers and recruiters weight them, each explained in a sentence and each fixable from the editor. No black box, no upsell to see why.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-x-12 md:grid-cols-2">
        {cols.map((col, ci) => (
          <ol key={ci} className="flex flex-col">
            {col.map((c) => (
              <li key={c.id} className="flex items-baseline justify-between gap-6 py-3.5 hairline-b">
                <span className="text-[15px] text-ink">{c.label}</span>
                <span className="shrink-0 font-mono text-xs tabular text-sub">{c.weight} pts</span>
              </li>
            ))}
          </ol>
        ))}
      </div>
    </section>
  );
}
