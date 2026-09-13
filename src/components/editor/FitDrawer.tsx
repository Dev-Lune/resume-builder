"use client";

import { Drawer } from "@/components/ui/Drawer";
import { Tape } from "@/components/ui/Tape";
import { fitLabel, type Fit } from "@/lib/ats";
import type { Active } from "./Editor";
import { CheckRow } from "./bits";

export function FitDrawer({ open, onClose, fit, onGo }: { open: boolean; onClose: () => void; fit: Fit; onGo: (s: Active) => void }) {
  const failing = fit.checks.filter((c) => !c.ok);
  const passing = fit.checks.filter((c) => c.ok);
  return (
    <Drawer open={open} onClose={onClose} title="Fit score">
      <div className="mb-10 mt-10">
        <Tape value={fit.score} label="Fit score out of 100" />
      </div>
      <div className="flex items-baseline justify-between">
        <p className="font-display text-2xl">{fitLabel(fit.score)}</p>
        <p className="font-mono text-xs tabular text-sub">
          {fit.words} words, {fit.bullets} bullets
        </p>
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-sub">
        Twelve checks a parser and a recruiter both make. Each is worth the points beside it; fix the open ones from their section.
      </p>

      {failing.length > 0 && (
        <>
          <h3 className="mt-8 text-[13px] font-medium text-ink-dim">Open ({failing.length})</h3>
          <ul className="mt-1">
            {failing.map((c) => (
              <CheckRow key={c.id} check={c} onFix={(x) => onGo(x.section)} />
            ))}
          </ul>
        </>
      )}
      {passing.length > 0 && (
        <>
          <h3 className="mt-8 text-[13px] font-medium text-ink-dim">Passing ({passing.length})</h3>
          <ul className="mt-1">
            {passing.map((c) => (
              <CheckRow key={c.id} check={c} />
            ))}
          </ul>
        </>
      )}
    </Drawer>
  );
}
