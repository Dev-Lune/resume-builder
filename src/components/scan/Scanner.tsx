"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Check, FileText, Upload, X } from "lucide-react";
import { Button, buttonClass, IconButton } from "@/components/ui/Button";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { AiProviderMenu } from "@/components/ui/AiProviderMenu";
import { HeaderAiBar } from "@/components/ui/HeaderAiBar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Wordmark } from "@/components/ui/Wordmark";
import { ACCEPT, extractFile, MAX_BYTES, type FileKind } from "@/lib/ats/extract";
import { scan, scoreBand, type ScanResult, type Severity } from "@/lib/ats/scan";
import { ScanReport } from "./ScanReport";
import { cn } from "@/lib/cn";
import { uid, type Resume } from "@/lib/schema";
import { apps } from "@/lib/apps";
import { store, useResumes } from "@/lib/store";
import { resumeToText } from "@/lib/text";

type Source =
  | { type: "none" }
  | { type: "file"; name: string; kind: FileKind; chars: number; text: string; error?: string }
  | { type: "internal"; id: string; title: string; text: string };

export function Scanner() {
  const params = useSearchParams();
  const router = useRouter();
  const resumes = useResumes();
  const [source, setSource] = useState<Source>({ type: "none" });
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [step, setStep] = useState(0);
  const [delta, setDelta] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastScan = useRef<{ sig: string; score: number } | null>(null);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Deep link: /scan?id=<resumeId> scans a resume you built.
  useEffect(() => {
    const id = params.get("id");
    if (!id) return;
    const r = store.get(id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (r) setSource({ type: "internal", id: r.id, title: r.title, text: resumeToText(r) });
  }, [params]);

  const takeFile = useCallback(async (file: File) => {
    setResult(null);
    if (file.size > MAX_BYTES) {
      setSource({ type: "file", name: file.name, kind: "txt", chars: 0, text: "", error: "Over 8 MB. Export a lighter file." });
      return;
    }
    setBusy(true);
    const ex = await extractFile(file);
    setBusy(false);
    setSource({ type: "file", name: file.name, kind: ex.kind, chars: ex.chars, text: ex.text, error: ex.error });
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void takeFile(f);
  };

  const resumeText = source.type === "none" ? "" : source.text;
  const fileKind: FileKind | "internal" = source.type === "internal" ? "internal" : source.type === "file" ? source.kind : "txt";
  const extractedChars = source.type === "file" ? source.chars : undefined;
  const canScan = resumeText.trim().length > 0 && jd.trim().length >= 80 && !busy;

  const runScan = () => {
    if (!canScan) return;
    timers.current.forEach(clearTimeout);
    const computed = scan({ resumeText, jobDescription: jd, fileKind, extractedChars });
    // Delta only when re-scanning the same resume/posting pairing (e.g. after edits).
    const sig = `${source.type === "internal" ? "i:" + source.id : source.type === "file" ? "f:" + source.name : "none"}|${jd.trim().length}`;
    const prev = lastScan.current;
    const d = prev && prev.sig === sig ? computed.score - prev.score : null;
    lastScan.current = { sig, score: computed.score };
    setResult(null);
    setDelta(d);
    setScanning(true);
    setStep(0);
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setScanning(false);
      setResult(computed);
      return;
    }
    // Staged sweep so the scan reads as real work, then reveal.
    timers.current = [
      setTimeout(() => setStep(1), 380),
      setTimeout(() => setStep(2), 760),
      setTimeout(() => setStep(3), 1080),
      setTimeout(() => {
        setScanning(false);
        setResult(computed);
        requestAnimationFrame(() => document.getElementById("scan-result")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      }, 1400),
    ];
  };

  const addMissingToResume = () => {
    if (source.type !== "internal" || !result) return;
    const r = store.get(source.id);
    if (!r) return;
    const have = new Set(r.skills.flatMap((g) => g.items.map((s) => s.toLowerCase())));
    const add = result.missing.filter((m) => m.kind === "skill" && !have.has(m.label.toLowerCase())).map((m) => m.label);
    if (!add.length) return;
    const group = r.skills.find((g) => /keyword|from posting/i.test(g.name));
    const next: Resume = group
      ? { ...r, skills: r.skills.map((g) => (g === group ? { ...g, items: [...g.items, ...add] } : g)) }
      : { ...r, skills: [...r.skills, { id: uid(), name: "From the posting", items: add }] };
    store.upsert(next);
    router.push(`/editor/${r.id}`);
  };

  // Save the posting onto the resume and open the editor's Tailor tool on it.
  const tailorInEditor = () => {
    if (source.type !== "internal") return;
    const r = store.get(source.id);
    if (!r) return;
    store.upsert({ ...r, jobDescription: jd });
    router.push(`/editor/${r.id}?tailor=1`);
  };

  // Rebuild an uploaded resume from scratch: seed the import flow with its text and the posting.
  const rebuildFromScan = () => {
    try {
      sessionStorage.setItem("bespoke:scan-seed", JSON.stringify({ text: resumeText, jd }));
    } catch {}
    router.push("/new?mode=import&from=scan");
  };

  // Save this scan as a tracked application.
  const trackApplication = () => {
    if (!result) return;
    apps.create({
      role: result.title.jdTitle || (source.type === "internal" ? "" : ""),
      resumeId: source.type === "internal" ? source.id : "",
      resumeTitle: source.type === "internal" ? source.title : "",
      jobDescription: jd,
      scanScore: result.score,
    });
    router.push("/applications");
  };

  return (
    <div className="relative z-[1] min-h-dvh">
      <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between px-5 hairline-b md:px-8 relative" style={{ background: "color-mix(in srgb, var(--bg) 82%, transparent)", backdropFilter: "blur(12px)" }}>
        <HeaderAiBar />
        <Wordmark />
        <nav className="flex items-center gap-2">
          <AiProviderMenu />
          <ThemeToggle />
          <Link href="/scan/bulk" className={cn(buttonClass("ghost", "sm"), "hidden sm:inline-flex")}>Bulk scan</Link>
          <Link href="/applications" className={buttonClass("ghost", "sm")}>Applications</Link>
          <Link href="/resumes" className={cn(buttonClass("ghost", "sm"), "hidden sm:inline-flex")}>My resumes</Link>
          <Link href="/new" className={buttonClass("primary", "sm")}>Build a resume</Link>
        </nav>
      </header>

      <main id="main" className="no-print mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
        <div className="max-w-2xl">
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.02]">ATS scanner</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-ink-dim">
            Drop in a resume and a job posting. See the keyword match an applicant tracking system would compute, the parse problems that make one drop your file, and exactly what to fix.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Resume source */}
          <section aria-label="Resume" className="flex flex-col rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-[13px] font-medium uppercase tracking-wider text-sub">Your resume</h2>

            {source.type === "none" && (
              <>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDrag(true);
                  }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={onDrop}
                  onClick={() => fileInput.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInput.current?.click()}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                    drag ? "border-accent bg-accent-soft" : "border-border hover:border-accent hover:bg-raised",
                  )}
                >
                  <Upload className="size-6 text-sub" strokeWidth={1.5} />
                  <p className="text-[15px] text-ink">Drop a PDF, DOCX or TXT, or click to choose</p>
                  <p className="text-xs text-sub">Parsed in your browser. Nothing is uploaded.</p>
                </div>
                <input ref={fileInput} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => e.target.files?.[0] && void takeFile(e.target.files[0])} />

                {resumes.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs text-sub">or scan one you built</p>
                    <ul className="flex flex-col gap-1">
                      {resumes.slice(0, 4).map((r) => (
                        <li key={r.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setResult(null);
                              setSource({ type: "internal", id: r.id, title: r.title, text: resumeToText(r) });
                            }}
                            className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-left text-sm transition-colors hover:border-accent hover:bg-accent-soft"
                          >
                            <FileText className="size-4 shrink-0 text-sub" strokeWidth={1.5} />
                            <span className="truncate">{r.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {source.type !== "none" && (
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-raised p-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <FileText className="size-5 shrink-0 text-accent" strokeWidth={1.5} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{source.type === "file" ? source.name : source.title}</p>
                      <p className="text-xs text-sub">
                        {source.type === "internal" ? "Built in the app" : `${source.kind.toUpperCase()} · ${source.chars.toLocaleString()} characters`}
                      </p>
                    </div>
                  </div>
                  <IconButton label="Remove" size="sm" onClick={() => { setSource({ type: "none" }); setResult(null); }}>
                    <X className="size-4" strokeWidth={1.5} />
                  </IconButton>
                </div>

                {source.type === "file" && source.error && (
                  <p className="mt-3 flex items-start gap-2 rounded-md bg-danger-soft px-3 py-2 text-[13px] text-danger">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} /> {source.error}
                  </p>
                )}
                {source.type === "file" && !source.error && source.chars < 200 && (
                  <p className="mt-3 flex items-start gap-2 rounded-md bg-danger-soft px-3 py-2 text-[13px] text-danger">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} /> Almost no text came out. This looks like a scanned or image PDF, which most ATS cannot read.
                  </p>
                )}

                {resumeText && (
                  <div className="mt-3 max-h-40 overflow-y-auto rounded-md border border-line bg-bg p-3 font-mono text-[11.5px] leading-relaxed text-sub">
                    {resumeText.slice(0, 1200)}
                    {resumeText.length > 1200 && "…"}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Job description */}
          <section aria-label="Job posting" className="flex flex-col rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-[13px] font-medium uppercase tracking-wider text-sub">The job posting</h2>
            <textarea
              value={jd}
              onChange={(e) => {
                setJd(e.target.value);
                setResult(null);
              }}
              placeholder="Paste the full posting here, requirements and all. The more complete it is, the better the match."
              className="field min-h-[260px] flex-1 resize-none font-mono text-[13px] leading-relaxed"
              aria-label="Job posting text"
            />
            <p className="mt-2 text-xs text-sub">{jd.trim() ? `${jd.trim().split(/\s+/).length} words` : "At least a paragraph."}</p>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="primary" size="lg" onClick={runScan} loading={busy || scanning} disabled={!canScan && !scanning}>
            {busy ? "Reading the file" : scanning ? "Scanning" : "Scan"} {!busy && !scanning && <ArrowRight className="size-4" strokeWidth={2} />}
          </Button>
          {!canScan && !busy && !scanning && <span className="text-sm text-sub">{resumeText.trim() ? "Paste a job posting to match against." : "Add a resume and a posting."}</span>}
        </div>

        {scanning && <ScanningPanel resumeText={resumeText} step={step} />}

        {!scanning && result && (
          <Results
            result={result}
            source={source}
            delta={delta}
            onAddMissing={addMissingToResume}
            onTailor={tailorInEditor}
            onRebuild={rebuildFromScan}
            onTrack={trackApplication}
          />
        )}
      </main>
      {result && <ScanReport result={result} resumeLabel={source.type === "internal" ? source.title : source.type === "file" ? source.name : "resume"} />}
    </div>
  );
}

const SCAN_STEPS = ["Extracting text", "Matching keywords against the posting", "Auditing parse safety", "Scoring the match"];

function ScanningPanel({ resumeText, step }: { resumeText: string; step: number }) {
  return (
    <div className="fade mt-12 grid grid-cols-1 gap-8 border-t border-line pt-10 lg:grid-cols-[1fr_1fr] lg:items-center">
      <div className="relative overflow-hidden rounded-xl border border-border bg-bg p-4">
        <div className="scan-glass" aria-hidden="true" />
        <div className="scan-line" aria-hidden="true" />
        <pre className="max-h-72 overflow-hidden whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-sub">
          {resumeText.slice(0, 1400) || "resume text"}
        </pre>
      </div>
      <div>
        <p className="font-display text-2xl">Scanning</p>
        <ul className="mt-5 flex flex-col gap-3" aria-live="polite">
          {SCAN_STEPS.map((s, i) => {
            const state = i < step ? "done" : i === step ? "active" : "todo";
            return (
              <li key={s} className="flex items-center gap-3 text-[15px]">
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full border",
                    state === "done" ? "border-ok/40 bg-ok-soft text-ok" : state === "active" ? "count-blink border-accent-line bg-accent-soft text-accent" : "border-border text-dim",
                  )}
                >
                  {state === "done" ? <Check className="size-3" strokeWidth={2.5} /> : <span className="size-1.5 rounded-full bg-current" />}
                </span>
                <span className={state === "todo" ? "text-dim" : "text-ink"}>{s}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const TONE: Record<Severity, string> = {
  pass: "text-ok border-ok/40 bg-ok-soft",
  warn: "text-accent border-accent-line bg-accent-soft",
  fail: "text-danger border-danger/40 bg-danger-soft",
};

function Results({
  result,
  source,
  delta,
  onAddMissing,
  onTailor,
  onRebuild,
  onTrack,
}: {
  result: ScanResult;
  source: Source;
  delta: number | null;
  onAddMissing: () => void;
  onTailor: () => void;
  onRebuild: () => void;
  onTrack: () => void;
}) {
  const band = scoreBand(result.score);
  const missingSkills = result.missing.filter((m) => m.kind === "skill");
  const weak = result.score < 70;
  const topGaps = missingSkills.slice(0, 6);
  return (
    <div id="scan-result" className="mt-12 border-t border-line pt-10">
      {/* Summary card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-float md:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="flex items-center gap-5">
            <ScoreRing value={result.score} sublabel="of 100" label={`Overall score ${result.score} of 100`} />
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={cn("rounded-full border px-2.5 py-0.5 text-[12px] font-medium", TONE[band.tone])}>{band.label}</span>
                {delta !== null && delta !== 0 && (
                  <span className={cn("rounded-full px-2 py-0.5 text-[12px] font-medium tabular", delta > 0 ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger")}>
                    {delta > 0 ? "+" : ""}
                    {delta} since last scan
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-[34ch] text-[14px] leading-relaxed text-ink-dim">
                {result.meta.hardMatched} of {result.meta.hardTotal} hard skills from the posting are in your resume.{" "}
                {band.tone === "pass" ? "This reads as a strong fit." : "Close the gaps below before you send it."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={onTrack}>Track as application</Button>
                <Button variant="ghost" size="sm" onClick={() => window.print()}>Save PDF report</Button>
              </div>
            </div>
          </div>

          <ul className="flex-1 lg:border-l lg:border-line lg:pl-8">
            {(
              [
                ["Keyword match", result.matchRate],
                ["Parse safety", result.subscores.parse],
                ["Title", result.subscores.title],
                ["Content", result.subscores.content],
              ] as const
            ).map(([label, val], i) => (
              <li key={label} className={cn("flex items-center gap-4 py-2", i > 0 && "border-t border-line")}>
                <span className="w-28 shrink-0 text-[13px] text-ink-dim">{label}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${val}%`, transition: "width 700ms var(--ease-out-quart)" }} />
                </span>
                <span className="w-8 shrink-0 text-right font-mono text-[13px] tabular text-sub">{val}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Make it better: shown when the match is weak */}
      {weak && (
        <div className="mt-10 overflow-hidden rounded-xl border border-accent-line bg-accent-soft">
          <div className="border-b border-accent-line/50 px-6 py-4">
            <h3 className="font-display text-2xl">Make it better</h3>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-dim">
              {result.matchRate < 50
                ? "This resume misses a lot of what the posting asks for. Close the gap before you send it."
                : "You are close. A few changes would push this past the filters."}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wider text-sub">Add these, if they are true of you</p>
              {topGaps.length ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {topGaps.map((m) => (
                    <li key={m.label} className="rounded-md border border-accent-line bg-surface px-2 py-1 text-[13px] text-ink">
                      {m.label}
                      {m.jdFreq > 1 && <span className="ml-1 font-mono text-[10px] text-sub">×{m.jdFreq}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[13px] text-sub">Your keywords are fine; the gaps are in parsing and structure below.</p>
              )}
              {!result.title.found && result.title.jdTitle && (
                <p className="mt-4 text-[13px] leading-relaxed text-ink-dim">
                  Set your headline to <span className="font-medium text-ink">{result.title.jdTitle}</span> if it honestly fits your level.
                </p>
              )}
              {result.checks.filter((c) => c.severity === "fail").map((c) => (
                <p key={c.id} className="mt-3 text-[13px] leading-relaxed text-danger">Fix: {c.detail}</p>
              ))}
            </div>
            <div className="flex flex-col gap-2 md:border-l md:border-accent-line/50 md:pl-6">
              <p className="text-[12px] font-medium uppercase tracking-wider text-sub">Do it now</p>
              {source.type === "internal" ? (
                <>
                  <Button variant="primary" size="md" onClick={onTailor}>
                    Tailor this resume to the posting
                  </Button>
                  {missingSkills.length > 0 && (
                    <Button variant="secondary" size="md" onClick={onAddMissing}>
                      Add {missingSkills.length} missing {missingSkills.length === 1 ? "skill" : "skills"}
                    </Button>
                  )}
                  <Link href={`/editor/${source.id}`} className={buttonClass("ghost", "md")}>
                    Open in the editor
                  </Link>
                </>
              ) : (
                <>
                  <Button variant="primary" size="md" onClick={onRebuild}>
                    Rebuild it in the editor
                  </Button>
                  <p className="text-[13px] leading-relaxed text-sub">
                    We seed the editor with this resume and the posting, redraft the weak bullets with numbers, work in the true keywords, and tailor the whole thing. Then re-scan.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Keywords */}
      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h3 className="text-[13px] font-medium uppercase tracking-wider text-sub">In your resume ({result.matched.length})</h3>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {result.matched.map((m) =>
              m.placement === "listed" ? (
                <li key={m.label} title="Listed in Skills but not shown in any bullet" className="inline-flex items-center gap-1.5 rounded-md border border-accent-line bg-accent-soft px-2 py-1 text-[13px] text-ink-dim">
                  {m.label}
                  <span className="rounded-sm bg-surface px-1 py-px font-mono text-[9px] uppercase tracking-wide text-sub">listed only</span>
                </li>
              ) : (
                <li key={m.label} className="inline-flex items-center gap-1.5 rounded-md border border-ok/30 bg-ok-soft px-2 py-1 text-[13px] text-ok">
                  <Check className="size-3" strokeWidth={2.5} /> {m.label}
                  {m.jdFreq > 1 && <span className="font-mono text-[10px] opacity-70">×{m.jdFreq}</span>}
                </li>
              ),
            )}
            {result.matched.length === 0 && <li className="text-sm text-sub">None yet.</li>}
          </ul>
          {result.matched.some((m) => m.placement === "listed") && (
            <p className="mt-2 text-[12px] leading-relaxed text-sub">
              &ldquo;Listed only&rdquo; keywords sit in your Skills section but never appear in a bullet. Recruiters trust a skill you have demonstrated over one you have merely claimed.
            </p>
          )}
        </div>
        <div>
          <h3 className="text-[13px] font-medium uppercase tracking-wider text-sub">Asked for, missing ({result.missing.length})</h3>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {result.missing.map((m) => (
              <li key={m.label} className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2 py-1 text-[13px] text-ink-dim">
                {m.label}
                {m.jdFreq > 1 && <span className="font-mono text-[10px] text-sub">×{m.jdFreq}</span>}
              </li>
            ))}
            {result.missing.length === 0 && <li className="text-sm text-sub">Nothing missing. Strong.</li>}
          </ul>
          {source.type === "internal" && missingSkills.length > 0 && (
            <Button variant="secondary" size="sm" className="mt-4" onClick={onAddMissing}>
              Add {missingSkills.length} missing {missingSkills.length === 1 ? "skill" : "skills"} to this resume
            </Button>
          )}
        </div>
      </div>

      {/* Parse safety + recommendations */}
      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h3 className="text-[13px] font-medium uppercase tracking-wider text-sub">Parse safety</h3>
          <ul className="mt-3">
            {result.checks.map((c) => (
              <li key={c.id} className="flex gap-3 border-b border-line py-3">
                <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border", TONE[c.severity])}>
                  {c.severity === "pass" ? <Check className="size-3" strokeWidth={2.5} /> : c.severity === "warn" ? <AlertTriangle className="size-3" strokeWidth={2} /> : <X className="size-3" strokeWidth={2.5} />}
                </span>
                <div>
                  <p className="text-sm text-ink">{c.label}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-sub">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[13px] font-medium uppercase tracking-wider text-sub">What to fix first</h3>
          {result.recommendations.length === 0 ? (
            <p className="mt-3 text-sm text-sub">Nothing pressing. This resume reads well for the posting.</p>
          ) : (
            <ol className="mt-3 flex flex-col gap-2.5">
              {result.recommendations.map((r, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink-dim">
                  <span className="mt-0.5 font-mono text-[12px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                  {r}
                </li>
              ))}
            </ol>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            {source.type === "internal" ? (
              <Link href={`/editor/${source.id}`} className={buttonClass("primary", "md")}>Open in the editor</Link>
            ) : (
              <Link href="/new?mode=import" className={buttonClass("primary", "md")}>Rebuild this resume in the editor</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
