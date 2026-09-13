"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Copy, Trash2 } from "lucide-react";
import { Button, buttonClass, IconButton } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Wordmark } from "@/components/ui/Wordmark";
import { scoreResume } from "@/lib/ats";
import { emptyResume } from "@/lib/schema";
import { SAMPLE_RESUME } from "@/lib/sample";
import { store, useResumes } from "@/lib/store";
import { ScaledSheet } from "./ScaledSheet";

function ago(t: number) {
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

export function ResumeList() {
  const resumes = useResumes();
  const router = useRouter();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [confirm, setConfirm] = useState<string | null>(null);

  const blank = () => {
    const r = store.create(emptyResume());
    router.push(`/editor/${r.id}`);
  };

  const openSample = () => {
    const r = store.create({ ...structuredClone(SAMPLE_RESUME), id: emptyResume().id, title: "Sample resume" });
    router.push(`/editor/${r.id}`);
  };

  return (
    <div className="min-h-dvh">
      <header className="flex h-14 items-center justify-between px-5 hairline-b md:px-8">
        <Wordmark />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/applications" className={buttonClass("ghost", "sm")}>
            Applications
          </Link>
          <Link href="/scan" className={buttonClass("ghost", "sm")}>
            ATS scan
          </Link>
          <Button variant="ghost" size="sm" onClick={blank}>
            Blank sheet
          </Button>
          <Link href="/new" className={buttonClass("primary", "sm")}>
            New resume
          </Link>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <h1 className="font-display text-4xl md:text-5xl">My resumes</h1>
        <p className="mt-2 text-ink-dim">Kept in this browser. Export anything you want to keep elsewhere.</p>

        {mounted && resumes.length === 0 && (
          <div className="mt-16 flex flex-col items-start gap-5 rounded-xl border border-dashed border-border p-8 md:p-12">
            <p className="max-w-md font-display text-3xl leading-tight">Nothing on the table yet.</p>
            <p className="max-w-md text-ink-dim">Start with the interview and have a first draft in about twelve minutes, or open a blank sheet and type.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/new" className={buttonClass("primary", "md")}>
                Start the interview
              </Link>
              <Link href="/new?mode=import" className={buttonClass("secondary", "md")}>
                Paste an existing resume
              </Link>
              <Button variant="ghost" onClick={openSample}>
                Explore a filled sample
              </Button>
            </div>
          </div>
        )}

        {resumes.length > 0 && (
          <ul className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((r) => {
              const fit = scoreResume(r).score;
              return (
                <li key={r.id} className="group flex flex-col">
                  <Link href={`/editor/${r.id}`} className="rounded-lg border border-border bg-raised p-3 transition-colors hover:border-accent" aria-label={`Open ${r.title}`}>
                    <div className="max-h-[300px] overflow-hidden rounded-sm">
                      <ScaledSheet resume={r} guides={false} />
                    </div>
                  </Link>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/editor/${r.id}`} className="block truncate font-medium hover:underline">
                        {r.title || "Untitled resume"}
                      </Link>
                      <p className="mt-0.5 text-xs text-sub">
                        Edited {ago(r.updatedAt)} <span className="mx-1.5 font-mono text-dim">/</span> fit <span className="font-mono tabular text-ink-dim">{fit}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center opacity-70 transition-opacity group-hover:opacity-100">
                      <IconButton label="Duplicate" size="sm" onClick={() => store.duplicate(r.id)}>
                        <Copy className="size-4" strokeWidth={1.5} />
                      </IconButton>
                      {confirm === r.id ? (
                        <span className="ml-1 flex items-center gap-1 text-xs">
                          <button type="button" className="rounded px-2 py-1 text-danger hover:bg-danger-soft" onClick={() => { store.remove(r.id); setConfirm(null); }}>
                            Delete
                          </button>
                          <button type="button" className="rounded px-2 py-1 text-sub hover:bg-raised" onClick={() => setConfirm(null)}>
                            Keep
                          </button>
                        </span>
                      ) : (
                        <IconButton label="Delete" size="sm" onClick={() => setConfirm(r.id)}>
                          <Trash2 className="size-4" strokeWidth={1.5} />
                        </IconButton>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
