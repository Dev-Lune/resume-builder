"use client";

import { useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { emptySkillGroup, uid, type Resume, type SkillGroup } from "@/lib/schema";
import { resumeToText } from "@/lib/text";
import type { Update } from "./Editor";
import { EntryFrame, SectionHeader } from "./Entries";
import { swap } from "./Sections";
import { useAi } from "./useAi";

/** Type, press Enter or comma, get a chip. Backspace on empty removes the last one. */
function ChipInput({ items, onChange, label }: { items: string[]; onChange: (v: string[]) => void; label: string }) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const parts = draft.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...items, ...parts.filter((p) => !items.includes(p))]);
    setDraft("");
  };
  return (
    <div className="field flex min-h-[44px] flex-wrap items-center gap-1.5 py-1.5 focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-soft)]">
      {items.map((it, i) => (
        <span key={`${it}-${i}`} className="flex items-center gap-1 rounded-sm bg-raised px-2 py-0.5 text-[13px]">
          {it}
          <button type="button" aria-label={`Remove ${it}`} onClick={() => onChange(items.filter((_, k) => k !== i))} className="text-sub hover:text-ink">
            <X className="size-3" strokeWidth={2} />
          </button>
        </span>
      ))}
      <input
        aria-label={label}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Backspace" && !draft && items.length) onChange(items.slice(0, -1));
        }}
        onBlur={commit}
        placeholder={items.length ? "" : "TypeScript, React, Playwright"}
        className="min-w-[140px] flex-1 bg-transparent py-0.5 text-sm outline-none"
      />
    </div>
  );
}

export function SkillsSection({ resume, update }: { resume: Resume; update: Update }) {
  const list = resume.skills;
  const { run, busy, error } = useAi();
  const [suggested, setSuggested] = useState<SkillGroup[] | null>(null);
  const setAt = (i: number, patch: Partial<SkillGroup>) => update({ skills: list.map((g, k) => (k === i ? { ...g, ...patch } : g)) });
  const total = list.reduce((n, g) => n + g.items.length, 0);

  const suggest = async () => {
    const out = await run<{ groups: { name: string; items: string[] }[] }>("skills", {
      resume: resumeToText(resume),
      targetRole: resume.targetRole || resume.basics.headline,
    });
    if (out) setSuggested(out.groups.map((g) => ({ ...g, id: uid() })));
  };

  const mergeMissing = () => {
    if (!suggested) return;
    const have = new Set(list.flatMap((g) => g.items.map((s) => s.toLowerCase())));
    const next = [...list];
    for (const g of suggested) {
      const fresh = g.items.filter((s) => !have.has(s.toLowerCase()));
      if (!fresh.length) continue;
      const existing = next.find((x) => x.name.toLowerCase() === g.name.toLowerCase());
      if (existing) existing.items = [...existing.items, ...fresh];
      else next.push({ ...g, items: fresh });
    }
    update({ skills: next });
    setSuggested(null);
  };

  return (
    <div>
      <SectionHeader
        title="Skills"
        line={`Grouped, concrete, 8 to 20 in total. Keyword matchers read this section first. ${total} so far.`}
        action={
          <Button size="sm" variant="secondary" onClick={suggest} loading={busy}>
            <Sparkles className="size-4" strokeWidth={1.5} /> Suggest from my resume
          </Button>
        }
      />
      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      {suggested && (
        <div className="fade mb-8 rounded-lg border border-accent-line bg-accent-soft p-4">
          <p className="text-sm font-medium">Suggested from your experience</p>
          <ul className="mt-3 flex flex-col gap-2">
            {suggested.map((g) => (
              <li key={g.id} className="text-sm">
                <span className="font-medium">{g.name}: </span>
                <span className="text-ink-dim">{g.items.join(", ")}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="primary" onClick={mergeMissing}>
              Add what is missing
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                update({ skills: suggested });
                setSuggested(null);
              }}
            >
              Replace all groups
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSuggested(null)}>
              Keep mine
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {list.map((g, i) => (
          <EntryFrame
            key={g.id}
            title={g.name || "New group"}
            onDelete={() => update({ skills: list.filter((_, k) => k !== i) })}
            onUp={i > 0 ? () => update({ skills: swap(list, i, i - 1) }) : undefined}
            onDown={i < list.length - 1 ? () => update({ skills: swap(list, i, i + 1) }) : undefined}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[200px_1fr]">
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`g-${g.id}`} className="text-[13px] font-medium text-ink-dim">
                  Group
                </label>
                <Input id={`g-${g.id}`} value={g.name} onChange={(e) => setAt(i, { name: e.target.value })} placeholder="Languages" />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-ink-dim">Skills</span>
                <ChipInput label={`Skills in ${g.name || "this group"}`} items={g.items} onChange={(items) => setAt(i, { items })} />
              </div>
            </div>
          </EntryFrame>
        ))}
      </div>
      <Button className="mt-6" variant="secondary" onClick={() => update({ skills: [...list, emptySkillGroup()] })}>
        <Plus className="size-4" strokeWidth={1.5} /> Add group
      </Button>
    </div>
  );
}
