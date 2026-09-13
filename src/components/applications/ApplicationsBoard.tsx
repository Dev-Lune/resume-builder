"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Plus, ScanSearch, Trash2 } from "lucide-react";
import { AiProviderMenu } from "@/components/ui/AiProviderMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button, buttonClass, IconButton } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Wordmark } from "@/components/ui/Wordmark";
import { apps, useApplications } from "@/lib/apps";
import { cn } from "@/lib/cn";
import { APP_STATUSES, APP_STATUS_LABELS, emptyApplication, type Application, type AppStatus } from "@/lib/schema";
import { useResumes } from "@/lib/store";

const STATUS_TONE: Record<AppStatus, string> = {
  saved: "text-sub",
  applied: "text-accent",
  interview: "text-accent",
  offer: "text-ok",
  rejected: "text-danger",
};

export function ApplicationsBoard() {
  const list = useApplications();
  const [adding, setAdding] = useState(false);
  const [edit, setEdit] = useState<Application | null>(null);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-5 hairline-b md:px-8" style={{ background: "color-mix(in srgb, var(--bg) 82%, transparent)", backdropFilter: "blur(12px)" }}>
        <Wordmark />
        <div className="flex items-center gap-2">
          <AiProviderMenu />
          <ThemeToggle />
          <Link href="/resumes" className={buttonClass("ghost", "sm")}>My resumes</Link>
          <Button variant="primary" size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" strokeWidth={1.75} /> Add
          </Button>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <h1 className="font-display text-4xl md:text-5xl">Applications</h1>
        <p className="mt-2 text-ink-dim">Every job you are chasing, the resume you sent, and how it scored. Kept in this browser.</p>

        {list.length === 0 ? (
          <div className="mt-16 flex flex-col items-start gap-5 rounded-xl border border-dashed border-border p-8 md:p-12">
            <p className="max-w-md font-display text-3xl leading-tight">Nothing tracked yet.</p>
            <p className="max-w-md text-ink-dim">Add a job you are applying to, link the resume you tailored for it, and keep its scan score beside it. Scanning a resume can also save one here.</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" onClick={() => setAdding(true)}>
                <Plus className="size-4" strokeWidth={1.75} /> Add an application
              </Button>
              <Link href="/scan" className={buttonClass("secondary", "md")}>Scan a resume</Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {APP_STATUSES.map((status) => {
              const items = list.filter((a) => a.status === status);
              return (
                <section key={status} aria-label={APP_STATUS_LABELS[status]} className="flex flex-col gap-3">
                  <header className="flex items-center justify-between px-1">
                    <span className="text-[13px] font-medium">{APP_STATUS_LABELS[status]}</span>
                    <span className="font-mono text-[11px] tabular text-sub">{items.length}</span>
                  </header>
                  {items.map((a) => (
                    <Card key={a.id} app={a} onEdit={() => setEdit(a)} />
                  ))}
                </section>
              );
            })}
          </div>
        )}
      </main>

      <AppDrawer open={adding} onClose={() => setAdding(false)} initial={null} />
      <AppDrawer open={!!edit} onClose={() => setEdit(null)} initial={edit} />
    </div>
  );
}

function Card({ app, onEdit }: { app: Application; onEdit: () => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={onEdit} className="min-w-0 text-left">
          <p className="truncate font-medium leading-tight">{app.role || "Untitled role"}</p>
          <p className="truncate text-[13px] text-sub">{app.company || "Company"}</p>
        </button>
        {typeof app.scanScore === "number" && (
          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 font-mono text-[11px] tabular text-accent" title="Last scan score">
            {app.scanScore}
          </span>
        )}
      </div>

      <select
        value={app.status}
        onChange={(e) => apps.patch(app.id, { status: e.target.value as AppStatus })}
        aria-label={`Status for ${app.role || "application"}`}
        className={cn("field h-8 py-0 text-[13px]", STATUS_TONE[app.status])}
      >
        {APP_STATUSES.map((s) => (
          <option key={s} value={s}>
            {APP_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {app.resumeId && (
            <Link href={`/editor/${app.resumeId}`} className="rounded px-1.5 py-1 text-[12px] text-ink-dim hover:bg-raised hover:text-ink" title={app.resumeTitle || "Open resume"}>
              Resume
            </Link>
          )}
          {app.resumeId && (
            <Link href={`/scan?id=${app.resumeId}`} className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[12px] text-ink-dim hover:bg-raised hover:text-ink" title="Rescan">
              <ScanSearch className="size-3.5" strokeWidth={1.5} /> Scan
            </Link>
          )}
          {app.link && (
            <a href={/^https?:\/\//.test(app.link) ? app.link : `https://${app.link}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[12px] text-ink-dim hover:bg-raised hover:text-ink" title="Job posting">
              <ExternalLink className="size-3.5" strokeWidth={1.5} /> Post
            </a>
          )}
        </div>
        <IconButton label="Delete application" size="sm" onClick={() => apps.remove(app.id)}>
          <Trash2 className="size-4" strokeWidth={1.5} />
        </IconButton>
      </div>
    </div>
  );
}

function AppDrawer({ open, onClose, initial }: { open: boolean; onClose: () => void; initial: Application | null }) {
  return (
    <Drawer open={open} onClose={onClose} title={initial ? "Edit application" : "Add application"} width="max-w-lg">
      {open && <AppForm key={initial?.id ?? "new"} initial={initial} onClose={onClose} />}
    </Drawer>
  );
}

function AppForm({ initial, onClose }: { initial: Application | null; onClose: () => void }) {
  const resumes = useResumes();
  const [a, setA] = useState<Application>(initial ?? emptyApplication());
  const set = (patch: Partial<Application>) => setA((prev) => ({ ...prev, ...patch }));

  const save = () => {
    const picked = resumes.find((r) => r.id === a.resumeId);
    apps.upsert({ ...a, resumeTitle: picked?.title ?? a.resumeTitle });
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Role">{(id) => <Input id={id} value={a.role} onChange={(e) => set({ role: e.target.value })} placeholder="Senior Frontend Engineer" autoFocus />}</Field>
        <Field label="Company">{(id) => <Input id={id} value={a.company} onChange={(e) => set({ company: e.target.value })} placeholder="Kestrel Pay" />}</Field>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-ink-dim">Resume sent</span>
        <select value={a.resumeId} onChange={(e) => set({ resumeId: e.target.value })} className="field" aria-label="Resume sent">
          <option value="">None linked</option>
          {resumes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-ink-dim">Status</span>
          <select value={a.status} onChange={(e) => set({ status: e.target.value as AppStatus })} className="field" aria-label="Status">
            {APP_STATUSES.map((s) => (
              <option key={s} value={s}>
                {APP_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <Field label="Scan score (optional)">
          {(id) => (
            <Input
              id={id}
              type="number"
              min={0}
              max={100}
              value={a.scanScore ?? ""}
              onChange={(e) => set({ scanScore: e.target.value === "" ? null : Math.max(0, Math.min(100, Number(e.target.value))) })}
            />
          )}
        </Field>
      </div>

      <Field label="Job posting link">{(id) => <Input id={id} value={a.link} onChange={(e) => set({ link: e.target.value })} placeholder="company.com/careers/123" />}</Field>
      <Field label="Notes">{(id) => <Textarea id={id} minRows={3} value={a.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Referral from a friend; deadline Friday." />}</Field>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={save} disabled={!a.role.trim() && !a.company.trim()}>
          {initial ? "Save" : "Add"}
        </Button>
      </div>
    </div>
  );
}
