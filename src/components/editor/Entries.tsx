"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Sparkles, Trash2, X } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { emptyExperience, emptyProject, type Resume } from "@/lib/schema";
import { resumeToText } from "@/lib/text";
import type { Update } from "./Editor";
import { VariantList } from "./bits";
import { swap } from "./Sections";
import { useAi } from "./useAi";

type Props = { resume: Resume; update: Update };

export function SectionHeader({ title, line, action }: { title: string; line: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-3xl">{title}</h2>
        <p className="mt-1 max-w-[52ch] text-[14px] leading-relaxed text-sub">{line}</p>
      </div>
      {action}
    </div>
  );
}

/** One entry: a header row with move and delete, then the fields. Hairline framed, no card. */
export function EntryFrame({
  title,
  children,
  onDelete,
  onUp,
  onDown,
}: {
  title: string;
  children: React.ReactNode;
  onDelete: () => void;
  onUp?: () => void;
  onDown?: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <section className="border-l-2 border-line pl-4 transition-colors focus-within:border-accent sm:pl-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="truncate text-[15px] font-medium text-ink">{title}</h3>
        <div className="flex shrink-0 items-center">
          <IconButton label="Move up" size="sm" onClick={onUp} disabled={!onUp}>
            <ChevronUp className="size-4" strokeWidth={1.5} />
          </IconButton>
          <IconButton label="Move down" size="sm" onClick={onDown} disabled={!onDown}>
            <ChevronDown className="size-4" strokeWidth={1.5} />
          </IconButton>
          {confirm ? (
            <span className="ml-1 flex items-center gap-1 text-xs">
              <button type="button" className="rounded px-2 py-1 text-danger hover:bg-danger-soft" onClick={onDelete}>
                Delete
              </button>
              <button type="button" className="rounded px-2 py-1 text-sub hover:bg-raised" onClick={() => setConfirm(false)}>
                Keep
              </button>
            </span>
          ) : (
            <IconButton label="Delete entry" size="sm" onClick={() => setConfirm(true)}>
              <Trash2 className="size-4" strokeWidth={1.5} />
            </IconButton>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

/** Bullets with per-line AI rewrite. The rewrite opens inline under the line it belongs to. */
export function BulletList({
  bullets,
  onChange,
  context,
}: {
  bullets: string[];
  onChange: (b: string[]) => void;
  context: { role: string; company: string; targetRole: string };
}) {
  const { run, busy, error, reset } = useAi();
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [variants, setVariants] = useState<string[] | null>(null);

  const setAt = (i: number, v: string) => onChange(bullets.map((b, k) => (k === i ? v : b)));
  const remove = (i: number) => onChange(bullets.length > 1 ? bullets.filter((_, k) => k !== i) : [""]);

  const rewrite = async (i: number) => {
    setOpenAt(i);
    setVariants(null);
    reset();
    const out = await run<{ variants: string[] }>("bullet", { bullet: bullets[i], ...context });
    if (out) setVariants(out.variants);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-ink-dim">Bullets</span>
      {bullets.map((b, i) => (
        <div key={i}>
          <div className="flex items-start gap-1.5">
            <Textarea
              value={b}
              minRows={1}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onChange([...bullets.slice(0, i + 1), "", ...bullets.slice(i + 1)]);
                  requestAnimationFrame(() => {
                    const next = (e.currentTarget.closest("[data-bullets]")?.querySelectorAll("textarea")[i + 1] as HTMLTextAreaElement | undefined);
                    next?.focus();
                  });
                }
                if (e.key === "Backspace" && b === "" && bullets.length > 1) {
                  e.preventDefault();
                  remove(i);
                }
              }}
              placeholder="Led, built, cut, shipped... what, how, and the number"
              aria-label={`Bullet ${i + 1}`}
            />
            <IconButton label="Rewrite this bullet three ways" size="md" onClick={() => rewrite(i)} disabled={!b.trim() || (busy && openAt === i)} className="shrink-0 text-accent hover:text-accent">
              {busy && openAt === i ? <Spinner className="size-4" /> : <Sparkles className="size-4" strokeWidth={1.5} />}
            </IconButton>
            <IconButton label="Remove bullet" size="md" onClick={() => remove(i)} className="shrink-0">
              <X className="size-4" strokeWidth={1.5} />
            </IconButton>
          </div>
          {openAt === i && (variants || error) && (
            <div className="fade ml-1 mt-2 border-l-2 border-accent-line pl-3">
              {error && <p className="text-[13px] text-danger">{error}</p>}
              {variants && (
                <>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs text-sub">Same facts, three cuts.</p>
                    <button type="button" className="text-xs text-sub hover:text-ink" onClick={() => setOpenAt(null)}>
                      Dismiss
                    </button>
                  </div>
                  <VariantList
                    variants={variants}
                    onPick={(v) => {
                      setAt(i, v);
                      setOpenAt(null);
                    }}
                  />
                </>
              )}
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={() => onChange([...bullets, ""])} className="flex w-fit items-center gap-1.5 py-1 text-[13px] text-ink-dim hover:text-ink">
        <Plus className="size-3.5" strokeWidth={1.5} /> Add bullet
      </button>
    </div>
  );
}

export function ExperienceSection({ resume, update }: Props) {
  const list = resume.experience;
  const { run, busy, error } = useAi();
  const [suggestingFor, setSuggestingFor] = useState<string | null>(null);
  const targetRole = resume.targetRole || resume.basics.headline;
  const setAt = (i: number, patch: Partial<(typeof list)[number]>) =>
    update({ experience: list.map((e, k) => (k === i ? { ...e, ...patch } : e)) });

  const suggest = async (i: number) => {
    const e = list[i];
    setSuggestingFor(e.id);
    const out = await run<{ bullets: string[] }>("suggestBullets", {
      role: e.role || "this role",
      company: e.company,
      targetRole,
      existing: e.bullets.filter(Boolean),
      context: resumeToText(resume).slice(0, 4000),
    });
    setSuggestingFor(null);
    if (out) setAt(i, { bullets: [...e.bullets.filter((b) => b.trim()), ...out.bullets] });
  };

  return (
    <div>
      <SectionHeader title="Experience" line="Most recent first. Each bullet: a verb, what you did, how, and the number that moved." />
      <div className="flex flex-col gap-10">
        {list.map((e, i) => (
          <EntryFrame
            key={e.id}
            title={[e.role, e.company].filter(Boolean).join(" at ") || "New role"}
            onDelete={() => update({ experience: list.filter((_, k) => k !== i) })}
            onUp={i > 0 ? () => update({ experience: swap(list, i, i - 1) }) : undefined}
            onDown={i < list.length - 1 ? () => update({ experience: swap(list, i, i + 1) }) : undefined}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Job title">{(id) => <Input id={id} value={e.role} onChange={(ev) => setAt(i, { role: ev.target.value })} placeholder="Senior Frontend Engineer" />}</Field>
              <Field label="Company">{(id) => <Input id={id} value={e.company} onChange={(ev) => setAt(i, { company: ev.target.value })} />}</Field>
              <Field label="Location">{(id) => <Input id={id} value={e.location} onChange={(ev) => setAt(i, { location: ev.target.value })} placeholder="Bengaluru" />}</Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start">{(id) => <Input id={id} value={e.start} onChange={(ev) => setAt(i, { start: ev.target.value })} placeholder="Mar 2022" />}</Field>
                <Field label="End">
                  {(id) => <Input id={id} value={e.current ? "Present" : e.end} disabled={e.current} onChange={(ev) => setAt(i, { end: ev.target.value })} placeholder="Feb 2024" />}
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-ink-dim sm:col-span-2">
                <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={e.current} onChange={(ev) => setAt(i, { current: ev.target.checked })} />
                I work here now
              </label>
              <div className="sm:col-span-2" data-bullets>
                <BulletList bullets={e.bullets} onChange={(bullets) => setAt(i, { bullets })} context={{ role: e.role, company: e.company, targetRole }} />
                <div className="mt-3 flex items-center gap-3">
                  <Button size="sm" variant="ghost" onClick={() => suggest(i)} loading={busy && suggestingFor === e.id} className="text-accent">
                    <Sparkles className="size-4" strokeWidth={1.5} /> Suggest bullets for this role
                  </Button>
                  {error && suggestingFor === null && <span className="text-xs text-danger">{error}</span>}
                </div>
              </div>
            </div>
          </EntryFrame>
        ))}
      </div>
      <Button className={cn("mt-8", list.length === 0 && "mt-0")} variant="secondary" onClick={() => update({ experience: [emptyExperience(), ...list] })}>
        <Plus className="size-4" strokeWidth={1.5} /> Add role
      </Button>
    </div>
  );
}

export function ProjectsSection({ resume, update }: Props) {
  const list = resume.projects;
  const targetRole = resume.targetRole || resume.basics.headline;
  const setAt = (i: number, patch: Partial<(typeof list)[number]>) =>
    update({ projects: list.map((p, k) => (k === i ? { ...p, ...patch } : p)) });
  return (
    <div>
      <SectionHeader title="Projects" line="Side projects, open source, internal tools. What it does, who uses it, how big it got." />
      <div className="flex flex-col gap-10">
        {list.map((p, i) => (
          <EntryFrame
            key={p.id}
            title={p.name || "New project"}
            onDelete={() => update({ projects: list.filter((_, k) => k !== i) })}
            onUp={i > 0 ? () => update({ projects: swap(list, i, i - 1) }) : undefined}
            onDown={i < list.length - 1 ? () => update({ projects: swap(list, i, i + 1) }) : undefined}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name">{(id) => <Input id={id} value={p.name} onChange={(ev) => setAt(i, { name: ev.target.value })} />}</Field>
              <Field label="Link">{(id) => <Input id={id} value={p.link} onChange={(ev) => setAt(i, { link: ev.target.value })} placeholder="github.com/you/project" />}</Field>
              <Field label="One-line description" className="sm:col-span-2">
                {(id) => <Input id={id} value={p.description} onChange={(ev) => setAt(i, { description: ev.target.value })} placeholder="Open-source bookkeeping UI for small businesses, 1.9k stars" />}
              </Field>
              <div className="sm:col-span-2" data-bullets>
                <BulletList bullets={p.bullets} onChange={(bullets) => setAt(i, { bullets })} context={{ role: "project", company: p.name, targetRole }} />
              </div>
            </div>
          </EntryFrame>
        ))}
      </div>
      <Button className={cn("mt-8", list.length === 0 && "mt-0")} variant="secondary" onClick={() => update({ projects: [...list, emptyProject()] })}>
        <Plus className="size-4" strokeWidth={1.5} /> Add project
      </Button>
    </div>
  );
}
