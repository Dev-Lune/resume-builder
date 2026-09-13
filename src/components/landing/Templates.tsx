"use client";

import { useRouter } from "next/navigation";
import { ScaledSheet } from "@/components/resume/ScaledSheet";
import { Button } from "@/components/ui/Button";
import { TEMPLATES } from "@/lib/content";
import { SAMPLE_RESUME } from "@/lib/sample";
import { emptyResume, type Template } from "@/lib/schema";
import { store } from "@/lib/store";

export function Templates() {
  const router = useRouter();
  const start = (t: Template, seed: boolean) => {
    const base = seed ? { ...structuredClone(SAMPLE_RESUME), title: "Sample resume" } : emptyResume();
    const r = store.create({ ...base, template: t });
    router.push(`/editor/${r.id}`);
  };

  return (
    <section id="templates" className="mx-auto max-w-6xl px-5 py-24 hairline-t md:px-8 md:py-32">
      <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.01em]">Three templates. Boring in the right places.</h2>
      <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-ink-dim">
        One column, standard headings, system fonts, no icons or tables. Software reads them first, so they are built for software first and people second.
      </p>

      <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {TEMPLATES.map((t) => (
          <li key={t.id} className="flex flex-col">
            <div className="rounded-lg border border-border bg-raised p-3 sm:p-4">
              <ScaledSheet resume={{ ...SAMPLE_RESUME, template: t.id }} guides={false} />
            </div>
            <div className="mt-4 flex flex-1 flex-col">
              <h3 className="font-display text-2xl">{t.name}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-dim">{t.line}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => start(t.id, false)}>
                  Start with {t.name}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => start(t.id, true)}>
                  Open the sample
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
