"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Plus, Upload, X } from "lucide-react";
import { AiProviderMenu } from "@/components/ui/AiProviderMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button, buttonClass, IconButton } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { apps } from "@/lib/apps";
import { ACCEPT, extractFile, type FileKind } from "@/lib/ats/extract";
import { scan, scoreBand, type ScanResult } from "@/lib/ats/scan";
import { cn } from "@/lib/cn";
import { uid } from "@/lib/schema";
import { store, useResumes } from "@/lib/store";
import { resumeToText } from "@/lib/text";

type Posting = { id: string; label: string; text: string };
type Ranked = { posting: Posting; result: ScanResult };

export function BulkScan() {
  const resumes = useResumes();
  const router = useRouter();
  const [resumeId, setResumeId] = useState("");
  const [upload, setUpload] = useState<{ name: string; text: string; kind: FileKind } | null>(null);
  const [busyFile, setBusyFile] = useState(false);
  const [postings, setPostings] = useState<Posting[]>([
    { id: uid(), label: "", text: "" },
    { id: uid(), label: "", text: "" },
  ]);
  const [results, setResults] = useState<Ranked[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const picked = !upload && resumeId ? store.get(resumeId) : null;
  const resumeText = upload ? upload.text : picked ? resumeToText(picked) : "";
  const fileKind: FileKind | "internal" = upload ? upload.kind : "internal";
  const ready = postings.filter((p) => p.text.trim().length >= 80);
  const canScan = resumeText.trim().length > 0 && ready.length >= 1;

  const takeFile = async (file: File) => {
    setBusyFile(true);
    const ex = await extractFile(file);
    setBusyFile(false);
    if (!ex.error && ex.text) {
      setUpload({ name: file.name, text: ex.text, kind: ex.kind });
      setResumeId("");
    }
  };

  const scanAll = () => {
    const ranked = ready
      .map((posting) => ({ posting, result: scan({ resumeText, jobDescription: posting.text, fileKind }) }))
      .sort((a, b) => b.result.score - a.result.score);
    setResults(ranked);
    setOpen(ranked[0]?.posting.id ?? null);
  };

  const label = (p: Posting, i: number) => p.label.trim() || `Posting ${i + 1}`;

  return (
    <div className="relative z-[1] min-h-dvh">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-5 hairline-b md:px-8" style={{ background: "color-mix(in srgb, var(--bg) 82%, transparent)", backdropFilter: "blur(12px)" }}>
        <Wordmark />
        <nav className="flex items-center gap-2">
          <AiProviderMenu />
          <ThemeToggle />
          <Link href="/scan" className={buttonClass("ghost", "sm")}>Single scan</Link>
          <Link href="/applications" className={buttonClass("ghost", "sm")}>Applications</Link>
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
        <div className="max-w-2xl">
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.02]">Scan against several postings</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-ink-dim">
            One resume, many jobs. See which postings you are the strongest fit for, ranked, so you spend your effort where it pays.
          </p>
        </div>

        {/* Resume source */}
        <section className="mt-10 rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-[13px] font-medium uppercase tracking-wider text-sub">Your resume</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={resumeId}
              onChange={(e) => {
                setResumeId(e.target.value);
                setUpload(null);
              }}
              className="field sm:max-w-xs"
              aria-label="Pick a resume you built"
            >
              <option value="">{resumes.length ? "Pick a resume you built" : "No saved resumes"}</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
            <span className="text-xs text-sub">or</span>
            {upload ? (
              <span className="inline-flex items-center gap-2 rounded-md border border-border bg-raised px-3 py-1.5 text-sm">
                {upload.name}
                <button type="button" onClick={() => setUpload(null)} aria-label="Remove file" className="text-sub hover:text-ink">
                  <X className="size-3.5" strokeWidth={1.75} />
                </button>
              </span>
            ) : (
              <label className={cn(buttonClass("secondary", "sm"), "cursor-pointer")}>
                <Upload className="size-4" strokeWidth={1.5} /> {busyFile ? "Reading" : "Upload a file"}
                <input type="file" accept={ACCEPT} className="sr-only" onChange={(e) => e.target.files?.[0] && void takeFile(e.target.files[0])} />
              </label>
            )}
          </div>
        </section>

        {/* Postings */}
        <section className="mt-6 flex flex-col gap-4">
          {postings.map((p, i) => (
            <div key={p.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-2 flex items-center gap-2">
                <input
                  value={p.label}
                  onChange={(e) => setPostings((ps) => ps.map((x) => (x.id === p.id ? { ...x, label: e.target.value } : x)))}
                  placeholder={`Posting ${i + 1} label (company or role)`}
                  aria-label={`Label for posting ${i + 1}`}
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-dim"
                />
                {postings.length > 1 && (
                  <IconButton label="Remove posting" size="sm" onClick={() => setPostings((ps) => ps.filter((x) => x.id !== p.id))}>
                    <X className="size-4" strokeWidth={1.5} />
                  </IconButton>
                )}
              </div>
              <textarea
                value={p.text}
                onChange={(e) => setPostings((ps) => ps.map((x) => (x.id === p.id ? { ...x, text: e.target.value } : x)))}
                placeholder="Paste this job posting."
                className="field min-h-[120px] resize-none font-mono text-[12.5px] leading-relaxed"
                aria-label={`Posting ${i + 1} text`}
              />
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => setPostings((ps) => [...ps, { id: uid(), label: "", text: "" }])}>
              <Plus className="size-4" strokeWidth={1.75} /> Add a posting
            </Button>
            <Button variant="primary" size="lg" onClick={scanAll} disabled={!canScan}>
              Scan {ready.length || ""} {ready.length === 1 ? "posting" : "postings"}
            </Button>
            {!canScan && <span className="text-sm text-sub">{resumeText ? "Paste at least one posting." : "Pick or upload a resume."}</span>}
          </div>
        </section>

        {/* Ranked results */}
        {results && (
          <section className="mt-12 border-t border-line pt-10">
            <h2 className="font-display text-2xl">Ranked by fit</h2>
            <ol className="mt-6 flex flex-col gap-3">
              {results.map((r, i) => {
                const band = scoreBand(r.result.score);
                const missing = r.result.missing.filter((m) => m.kind === "skill").slice(0, 5);
                const isOpen = open === r.posting.id;
                return (
                  <li key={r.posting.id} className="overflow-hidden rounded-xl border border-border bg-surface">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : r.posting.id)}
                      className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-raised"
                      aria-expanded={isOpen}
                    >
                      <span className="font-mono text-sm tabular text-sub">{i + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{label(r.posting, results.indexOf(r))}</span>
                        <span className="text-[13px] text-sub">
                          {r.result.matchRate}% keywords · {r.result.meta.hardMatched}/{r.result.meta.hardTotal} skills
                          {r.result.title.jdTitle ? ` · ${r.result.title.jdTitle}` : ""}
                        </span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="font-display text-3xl tabular text-accent">{r.result.score}</span>
                        <span className={cn("hidden rounded-full border px-2 py-0.5 text-[11px] font-medium sm:inline", band.tone === "pass" ? "border-ok/40 text-ok" : band.tone === "warn" ? "border-accent-line text-accent" : "border-danger/40 text-danger")}>{band.label}</span>
                        <ChevronDown className={cn("size-4 text-sub transition-transform", isOpen && "rotate-180")} strokeWidth={1.75} />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-line px-5 py-4">
                        {missing.length > 0 ? (
                          <>
                            <p className="text-[12px] font-medium uppercase tracking-wider text-sub">Top missing keywords</p>
                            <ul className="mt-2 flex flex-wrap gap-1.5">
                              {missing.map((m) => (
                                <li key={m.label} className="rounded-md border border-dashed border-border px-2 py-0.5 text-[13px] text-ink-dim">
                                  {m.label}
                                  {m.jdFreq > 1 && <span className="ml-1 font-mono text-[10px] text-sub">×{m.jdFreq}</span>}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <p className="text-[13px] text-sub">No hard-skill gaps. Strong fit.</p>
                        )}
                        {r.result.recommendations[0] && <p className="mt-3 text-[13px] leading-relaxed text-ink-dim">{r.result.recommendations[0]}</p>}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              apps.create({
                                role: r.result.title.jdTitle || label(r.posting, results.indexOf(r)),
                                company: r.posting.label,
                                resumeId: upload ? "" : resumeId,
                                resumeTitle: upload ? upload.name : (store.get(resumeId)?.title ?? ""),
                                jobDescription: r.posting.text,
                                scanScore: r.result.score,
                              });
                              router.push("/applications");
                            }}
                          >
                            Track as application
                          </Button>
                          {!upload && resumeId && (
                            <Link href={`/editor/${resumeId}`} className={buttonClass("ghost", "sm")}>Open resume</Link>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        )}
      </main>
    </div>
  );
}
