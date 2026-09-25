"use client";

import { Check, ShieldCheck } from "lucide-react";
import { ScaledSheet } from "@/components/resume/ScaledSheet";
import { cn } from "@/lib/cn";
import type { Question, Resume } from "@/lib/schema";

export const STEP_LABELS = ["Role", "You", "Questions", "Draft"] as const;

/** A white rounded card on the grey canvas (friendly-ui). */
export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("rounded-2xl border border-line bg-surface p-6 shadow-card md:p-8", className)} {...rest}>
      {children}
    </section>
  );
}

/** Role -> You -> Questions -> Draft. Finished steps are buttons back; Draft is never a jump target. */
export function Stepper({ current, reached, onGo }: { current: number; reached: number; onGo: (i: number) => void }) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center gap-1 sm:gap-2">
        {STEP_LABELS.map((label, i) => {
          const done = i < current;
          const on = i === current;
          const canGo = i !== current && i <= reached && i < STEP_LABELS.length - 1;
          return (
            <li key={label} className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                disabled={!canGo}
                onClick={() => onGo(i)}
                aria-current={on ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${label}${done ? ", done" : on ? ", current" : ""}`}
                className={cn(
                  "flex items-center gap-2 rounded-full py-1 pl-1 pr-1 text-[13px] font-medium transition-colors sm:pr-3",
                  on ? "bg-accent-soft text-ink" : done ? "text-ink-dim" : "text-sub",
                  canGo ? "hover:bg-raised" : "cursor-default",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-6 place-items-center rounded-full text-[12px] font-semibold",
                    done ? "bg-ok text-white" : on ? "bg-accent text-accent-ink" : "border border-border bg-surface",
                  )}
                >
                  {done ? <Check className="size-3.5" strokeWidth={2.75} /> : i + 1}
                </span>
                <span className={cn(on ? "pr-2 sm:pr-0" : "hidden sm:inline")}>{label}</span>
              </button>
              {i < STEP_LABELS.length - 1 && <span aria-hidden="true" className={cn("h-px w-3 sm:w-6", i < current ? "bg-ok" : "bg-border")} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** The sheet as it stands, filling in as they type. */
export function SheetPreview({ resume, caption }: { resume: Resume; caption: string }) {
  return (
    <Card className="p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[14px] font-semibold text-ink">Your resume</h2>
        <span className="text-[12px] text-sub">{caption}</span>
      </div>
      <div className="overflow-hidden rounded-lg border border-line bg-raised p-2">
        <ScaledSheet resume={resume} guides={false} />
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-sub">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-ok" strokeWidth={2} />
        Saved in this browser only. Nothing goes to a server.
      </p>
    </Card>
  );
}

/** Every question with its state; click one to jump to it. */
export function QuestionList({ questions, answers, current, onJump }: { questions: Question[]; answers: string[]; current: number; onJump: (i: number) => void }) {
  return (
    <Card className="p-4 md:p-5">
      <h2 className="mb-2 text-[14px] font-semibold text-ink">All questions</h2>
      <ol className="flex flex-col">
        {questions.map((q, i) => {
          const done = !!answers[i]?.trim();
          const on = i === current;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-current={on ? "step" : undefined}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left text-[13px] leading-snug transition-colors",
                  on ? "bg-accent-soft text-ink" : "text-ink-dim hover:bg-raised",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-px grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                    done ? "bg-ok text-white" : on ? "bg-accent text-accent-ink" : "border border-border text-sub",
                  )}
                >
                  {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className="line-clamp-2">{q.question}</span>
                <span className="sr-only">{done ? "answered" : "not answered"}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
