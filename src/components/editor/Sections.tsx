"use client";

import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { emptyCertification, emptyEducation, type Resume } from "@/lib/schema";
import { resumeToText } from "@/lib/text";
import type { Update } from "./Editor";
import { EntryFrame, SectionHeader } from "./Entries";
import { VariantList } from "./bits";
import { useAi } from "./useAi";

type Props = { resume: Resume; update: Update };

export function DetailsSection({ resume, update }: Props) {
  const b = resume.basics;
  const set = (k: keyof typeof b) => (e: React.ChangeEvent<HTMLInputElement>) => update({ basics: { ...b, [k]: e.target.value } });
  return (
    <div>
      <SectionHeader title="Details" line="Copied onto the sheet exactly as typed. Keep the headline identical to the title in the posting when you can." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" className="sm:col-span-2">{(id) => <Input id={id} value={b.name} onChange={set("name")} autoComplete="name" />}</Field>
        <Field label="Headline" hint="The role you want, not the one you have." className="sm:col-span-2">
          {(id, by) => <Input id={id} aria-describedby={by} value={b.headline} onChange={set("headline")} placeholder="Senior Frontend Engineer" />}
        </Field>
        <Field label="Email">{(id) => <Input id={id} type="email" value={b.email} onChange={set("email")} autoComplete="email" />}</Field>
        <Field label="Phone">{(id) => <Input id={id} type="tel" value={b.phone} onChange={set("phone")} autoComplete="tel" />}</Field>
        <Field label="Location">{(id) => <Input id={id} value={b.location} onChange={set("location")} placeholder="Bengaluru, India" />}</Field>
        <Field label="LinkedIn">{(id) => <Input id={id} value={b.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/you" />}</Field>
        <Field label="GitHub or portfolio">{(id) => <Input id={id} value={b.github} onChange={set("github")} placeholder="github.com/you" />}</Field>
        <Field label="Website">{(id) => <Input id={id} value={b.website} onChange={set("website")} placeholder="you.dev" />}</Field>
      </div>
    </div>
  );
}

export function SummarySection({ resume, update }: Props) {
  const { run, busy, error } = useAi();
  const [variants, setVariants] = useState<string[] | null>(null);
  const [before, setBefore] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const words = resume.summary.trim() ? resume.summary.trim().split(/\s+/).length : 0;

  const write = async () => {
    setBefore(resume.summary); // remember what was here so it can be reverted
    setPicked(null);
    const out = await run<{ variants: string[] }>("summary", { resume: resumeToText(resume), targetRole: resume.targetRole || resume.basics.headline });
    if (out) setVariants(out.variants);
  };

  const revert = () => {
    if (before !== null) update({ summary: before });
    setPicked(null);
  };

  const dismiss = () => {
    setVariants(null);
    setPicked(null);
    setBefore(null);
  };

  return (
    <div>
      <SectionHeader
        title="Summary"
        line="Three sentences: who you are, the strongest proof, what you want next. 30 to 90 words."
        action={
          <Button size="sm" variant="secondary" onClick={write} loading={busy}>
            <Sparkles className="size-4" strokeWidth={1.5} /> {resume.summary.trim() ? "Rewrite three ways" : "Write three versions"}
          </Button>
        }
      />
      <Field label="Professional summary" hint={`${words} words`} error={error ?? undefined}>
        {(id, by) => <Textarea id={id} aria-describedby={by} minRows={4} value={resume.summary} onChange={(e) => update({ summary: e.target.value })} placeholder="Frontend engineer with 7 years shipping consumer web products..." />}
      </Field>
      {variants && (
        <div className="fade mt-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs text-sub">Pick one. It replaces the text above; you can still edit it or revert.</p>
            <div className="flex shrink-0 items-center gap-3">
              {picked !== null && before !== null && (
                <button type="button" className="text-xs font-medium text-accent hover:underline" onClick={revert}>
                  Revert
                </button>
              )}
              <button type="button" className="text-xs text-sub hover:text-ink" onClick={dismiss}>
                Dismiss
              </button>
            </div>
          </div>
          <VariantList
            variants={variants}
            activeIndex={picked}
            onPick={(v, i) => {
              update({ summary: v });
              setPicked(i);
            }}
          />
        </div>
      )}
    </div>
  );
}

export function EducationSection({ resume, update }: Props) {
  const list = resume.education;
  const setAt = (i: number, patch: Partial<(typeof list)[number]>) =>
    update({ education: list.map((e, k) => (k === i ? { ...e, ...patch } : e)) });
  return (
    <div>
      <SectionHeader title="Education" line="Highest first. Keep it to one line each unless you graduated in the last two years." />
      <div className="flex flex-col gap-8">
        {list.map((e, i) => (
          <EntryFrame
            key={e.id}
            title={[e.degree, e.school].filter(Boolean).join(", ") || "New entry"}
            onDelete={() => update({ education: list.filter((_, k) => k !== i) })}
            onUp={i > 0 ? () => update({ education: swap(list, i, i - 1) }) : undefined}
            onDown={i < list.length - 1 ? () => update({ education: swap(list, i, i + 1) }) : undefined}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Institution" className="sm:col-span-2">{(id) => <Input id={id} value={e.school} onChange={(ev) => setAt(i, { school: ev.target.value })} />}</Field>
              <Field label="Degree">{(id) => <Input id={id} value={e.degree} onChange={(ev) => setAt(i, { degree: ev.target.value })} placeholder="B.Tech" />}</Field>
              <Field label="Field of study">{(id) => <Input id={id} value={e.field} onChange={(ev) => setAt(i, { field: ev.target.value })} placeholder="Computer Science" />}</Field>
              <Field label="Location">{(id) => <Input id={id} value={e.location} onChange={(ev) => setAt(i, { location: ev.target.value })} />}</Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start">{(id) => <Input id={id} value={e.start} onChange={(ev) => setAt(i, { start: ev.target.value })} placeholder="2013" />}</Field>
                <Field label="End">{(id) => <Input id={id} value={e.end} onChange={(ev) => setAt(i, { end: ev.target.value })} placeholder="2017" />}</Field>
              </div>
              <Field label="Notes (optional)" hint="Thesis, rank, scholarship, relevant coursework." className="sm:col-span-2">
                {(id, by) => <Input id={id} aria-describedby={by} value={e.notes} onChange={(ev) => setAt(i, { notes: ev.target.value })} />}
              </Field>
            </div>
          </EntryFrame>
        ))}
      </div>
      <Button className="mt-6" variant="secondary" onClick={() => update({ education: [...list, emptyEducation()] })}>
        <Plus className="size-4" strokeWidth={1.5} /> Add education
      </Button>
    </div>
  );
}

export function CertificationsSection({ resume, update }: Props) {
  const list = resume.certifications;
  const setAt = (i: number, patch: Partial<(typeof list)[number]>) =>
    update({ certifications: list.map((e, k) => (k === i ? { ...e, ...patch } : e)) });
  return (
    <div>
      <SectionHeader title="Certifications" line="Also awards, publications and talks. Name, issuer, year." />
      <div className="flex flex-col gap-6">
        {list.map((c, i) => (
          <EntryFrame
            key={c.id}
            title={c.name || "New entry"}
            onDelete={() => update({ certifications: list.filter((_, k) => k !== i) })}
            onUp={i > 0 ? () => update({ certifications: swap(list, i, i - 1) }) : undefined}
            onDown={i < list.length - 1 ? () => update({ certifications: swap(list, i, i + 1) }) : undefined}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_120px]">
              <Field label="Name">{(id) => <Input id={id} value={c.name} onChange={(ev) => setAt(i, { name: ev.target.value })} />}</Field>
              <Field label="Issuer">{(id) => <Input id={id} value={c.issuer} onChange={(ev) => setAt(i, { issuer: ev.target.value })} />}</Field>
              <Field label="Year">{(id) => <Input id={id} value={c.date} onChange={(ev) => setAt(i, { date: ev.target.value })} placeholder="2024" />}</Field>
            </div>
          </EntryFrame>
        ))}
      </div>
      <Button className="mt-6" variant="secondary" onClick={() => update({ certifications: [...list, emptyCertification()] })}>
        <Plus className="size-4" strokeWidth={1.5} /> Add certification
      </Button>
    </div>
  );
}

export function swap<T>(list: T[], i: number, j: number): T[] {
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}
