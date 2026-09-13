"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, FileText, ShieldCheck, Upload } from "lucide-react";
import { useAi } from "@/components/editor/useAi";
import { AiProgress } from "@/components/ui/AiProgress";
import { Button, buttonClass } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { Spinner } from "@/components/ui/Spinner";
import { Tape } from "@/components/ui/Tape";
import { AiProviderMenu } from "@/components/ui/AiProviderMenu";
import { ProviderPicker } from "@/components/ui/ProviderPicker";
import { HeaderAiBar } from "@/components/ui/HeaderAiBar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Wordmark } from "@/components/ui/Wordmark";
import { ACCEPT, extractFile, MAX_BYTES, type FileKind } from "@/lib/ats/extract";
import { cn } from "@/lib/cn";
import { emptyBasics, emptyResume, hydrateDraft, type Basics, type DraftResume, type Question } from "@/lib/schema";
import { store } from "@/lib/store";

type Stage = "setup" | "contact" | "questions" | "drafting" | "import";

const LEVELS = ["Student", "0-2 years", "3-5 years", "6-10 years", "10+ years"] as const;

const DEFAULT_QUESTIONS: Question[] = [
  { topic: "experience", question: "What is your most recent job title, who was the employer, and what were the dates?", hint: "Title, company, city, and month-year to month-year or present." },
  { topic: "achievements", question: "What are the two or three results from that role you would put at the top of the page?", hint: "Name what you did, the scale it ran at, and one number that moved: users, revenue, time, cost, team size." },
  { topic: "skills", question: "Which tools, languages or systems did you use day to day in that role?", hint: "List them plainly; grouping comes later." },
  { topic: "experience", question: "Which roles came before it? For each, give the title, employer, dates and one result.", hint: "One line per role is enough; the resume will expand the recent ones." },
  { topic: "projects", question: "Have you built or led something outside your job description that you are proud of?", hint: "What it did, who used it, how big it got. Open source, side projects, internal tools all count." },
  { topic: "education", question: "What is your education?", hint: "Institution, degree, field, years, and anything notable such as a thesis, rank, or scholarship." },
  { topic: "achievements", question: "Any certifications, awards, publications or talks worth listing?", hint: "Name, issuer or venue, and year." },
  { topic: "summary", question: "What role are you going after next, and what should a recruiter remember about you in one line?", hint: "The line usually becomes the opening of your summary." },
];

export function Interview() {
  const router = useRouter();
  const params = useSearchParams();
  const { run, busy, error, chars, reset } = useAi();

  const [stage, setStage] = useState<Stage>(params.get("mode") === "import" ? "import" : "setup");
  const [role, setRole] = useState("");
  const [seededJd, setSeededJd] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("3-5 years");
  const [industry, setIndustry] = useState("");
  const [basics, setBasics] = useState<Basics>(emptyBasics());
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [qNote, setQNote] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [i, setI] = useState(0);
  const [importText, setImportText] = useState("");
  const [importMode, setImportMode] = useState<"paste" | "upload">("paste");
  const [importFile, setImportFile] = useState<{ name: string; kind: FileKind; chars: number; error?: string } | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [importDrag, setImportDrag] = useState(false);
  const fetching = useRef(false);
  const importFileRef = useRef<File | null>(null);

  const takeImportFile = async (file: File) => {
    if (file.size > MAX_BYTES) {
      setImportFile({ name: file.name, kind: "txt", chars: 0, error: "That file is over 8 MB. Export a lighter one." });
      return;
    }
    importFileRef.current = file;
    setImportBusy(true);
    const ex = await extractFile(file);
    setImportBusy(false);
    setImportText(ex.text);
    setImportFile({ name: file.name, kind: ex.kind, chars: ex.chars, error: ex.error });
  };

  // Keep the uploaded file (as a data URL) for this session so the editor can reopen it.
  const stashSourceFile = async (resumeId: string) => {
    const file = importFileRef.current;
    if (!file) return;
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      sessionStorage.setItem(`bespoke:srcfile:${resumeId}`, JSON.stringify({ name: file.name, url: dataUrl }));
    } catch {
      /* quota or read error: skip, the resume still opens */
    }
  };

  // Questions are fetched while the person fills in contact details, so the first question is ready when they are.
  const fetchQuestions = useCallback(async () => {
    if (fetching.current || questions) return;
    fetching.current = true;
    const out = await run<{ questions: Question[] }>("questions", { role, level, industry, count: 8 });
    if (out?.questions?.length) {
      setQuestions(out.questions);
      setAnswers(new Array(out.questions.length).fill(""));
    } else {
      setQuestions(DEFAULT_QUESTIONS);
      setAnswers(new Array(DEFAULT_QUESTIONS.length).fill(""));
      setQNote("Standard questions this time.");
    }
    fetching.current = false;
  }, [run, role, level, industry, questions]);

  useEffect(() => {
    // Prefetch the questions while the person fills in contact details.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stage === "contact") void fetchQuestions();
  }, [stage, fetchQuestions]);

  // Arriving from the scanner's "rebuild" button: seed the import box with the file text and posting.
  useEffect(() => {
    if (params.get("from") !== "scan") return;
    try {
      const raw = sessionStorage.getItem("bespoke:scan-seed");
      if (!raw) return;
      const seed = JSON.parse(raw) as { text?: string; jd?: string };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (seed.text) setImportText(seed.text);
      if (seed.jd) setSeededJd(seed.jd);
      sessionStorage.removeItem("bespoke:scan-seed");
    } catch {}
  }, [params]);

  const startDraft = async () => {
    if (!questions) return;
    setStage("drafting");
    reset();
    const out = await run<DraftResume>("draft", {
      role,
      level,
      basics,
      answers: questions.map((q, k) => ({ question: q.question, answer: answers[k] ?? "" })),
    });
    if (!out) return;
    const base = { ...emptyResume(`${basics.name || "My"} resume`), basics, targetRole: role };
    const resume = hydrateDraft(out, base);
    resume.basics = { ...resume.basics, ...basics, headline: resume.basics.headline || role };
    resume.title = `${resume.basics.name || "My"} resume, ${role}`;
    const saved = store.create(resume);
    router.replace(`/editor/${saved.id}`);
  };

  const startBlank = () => {
    const r = store.create({ ...emptyResume(`${basics.name || "My"} resume`), basics: { ...basics, headline: role }, targetRole: role });
    router.replace(`/editor/${r.id}`);
  };

  const runImport = async () => {
    reset();
    const out = await run<DraftResume>("import", { text: importText, role });
    if (!out) return;
    const resume = hydrateDraft(out, { ...emptyResume(), targetRole: role, jobDescription: seededJd });
    resume.title = `${resume.basics.name || "Imported"} resume${role ? `, ${role}` : ""}`;
    const saved = store.create(resume);
    await stashSourceFile(saved.id);
    router.replace(`/editor/${saved.id}`);
  };

  const answered = answers.filter((a) => a.trim()).length;
  const total = questions?.length ?? 8;
  const q = questions?.[i];

  const next = () => {
    if (!questions) return;
    if (i < questions.length - 1) setI(i + 1);
    else void startDraft();
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="relative flex h-14 items-center justify-between px-5 hairline-b md:px-8">
        <HeaderAiBar />
        <Wordmark />
        <div className="flex items-center gap-1">
          <AiProviderMenu />
          <ThemeToggle />
          <Link href="/resumes" className={buttonClass("ghost", "sm")}>
            Exit
          </Link>
        </div>
      </header>

      <main id="main" className={cn("mx-auto flex w-full flex-1 flex-col px-5 py-10 md:py-16", stage === "import" ? "max-w-5xl" : "max-w-xl")}>
        {stage === "setup" && (
          <form
            className="flex flex-col gap-7"
            onSubmit={(e) => {
              e.preventDefault();
              if (role.trim()) setStage("contact");
            }}
          >
            <div>
              <h1 className="rise font-display text-4xl leading-tight md:text-5xl">What are you applying for?</h1>
              <p className="rise mt-3 text-ink-dim" style={{ "--d": "80ms" } as React.CSSProperties}>
                The questions, the wording and the skill groups all follow from this.
              </p>
            </div>
            <div className="rise flex flex-col gap-5" style={{ "--d": "160ms" } as React.CSSProperties}>
              <Field label="Target role" hint="Word for word from a posting if you have one.">
                {(id) => <Input id={id} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Frontend Engineer" autoFocus required autoComplete="organization-title" />}
              </Field>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-ink-dim">Experience</span>
                <Segmented label="Experience level" value={level} onChange={setLevel} options={LEVELS.map((l) => ({ value: l, label: l }))} className="flex-wrap" />
              </div>
              <Field label="Industry (optional)">
                {(id) => <Input id={id} value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Fintech, healthcare, agency work" />}
              </Field>
            </div>
            <ProviderPicker className="rise" style={{ "--d": "220ms" } as React.CSSProperties} />
            <div className="rise flex flex-wrap items-center gap-3" style={{ "--d": "300ms" } as React.CSSProperties}>
              <Button type="submit" variant="primary" size="lg" disabled={!role.trim()}>
                Start the interview
              </Button>
              <button type="button" onClick={() => setStage("import")} className="text-sm text-ink-dim underline-offset-4 hover:underline">
                Paste an existing resume instead
              </button>
            </div>
          </form>
        )}

        {stage === "contact" && (
          <form
            className="flex flex-col gap-7"
            onSubmit={(e) => {
              e.preventDefault();
              setStage("questions");
            }}
          >
            <button type="button" onClick={() => setStage("setup")} className="flex w-fit items-center gap-1.5 text-sm text-sub hover:text-ink">
              <ArrowLeft className="size-4" strokeWidth={1.5} /> Back
            </button>
            <div>
              <h1 className="font-display text-4xl leading-tight md:text-5xl">Who is this resume for?</h1>
              <p className="mt-3 text-ink-dim">Copied onto the sheet exactly as typed. The model never sees these fields.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" className="sm:col-span-2">
                {(id) => <Input id={id} value={basics.name} onChange={(e) => setBasics({ ...basics, name: e.target.value })} autoFocus required autoComplete="name" />}
              </Field>
              <Field label="Email">{(id) => <Input id={id} type="email" value={basics.email} onChange={(e) => setBasics({ ...basics, email: e.target.value })} required autoComplete="email" />}</Field>
              <Field label="Phone">{(id) => <Input id={id} type="tel" value={basics.phone} onChange={(e) => setBasics({ ...basics, phone: e.target.value })} autoComplete="tel" />}</Field>
              <Field label="Location" hint="City and country is enough.">
                {(id) => <Input id={id} value={basics.location} onChange={(e) => setBasics({ ...basics, location: e.target.value })} autoComplete="address-level2" />}
              </Field>
              <Field label="LinkedIn">{(id) => <Input id={id} value={basics.linkedin} onChange={(e) => setBasics({ ...basics, linkedin: e.target.value })} placeholder="linkedin.com/in/you" />}</Field>
              <Field label="GitHub or portfolio">{(id) => <Input id={id} value={basics.github} onChange={(e) => setBasics({ ...basics, github: e.target.value })} placeholder="github.com/you" />}</Field>
              <Field label="Website">{(id) => <Input id={id} value={basics.website} onChange={(e) => setBasics({ ...basics, website: e.target.value })} placeholder="you.dev" />}</Field>
            </div>
            <div className="flex items-center gap-4">
              <Button type="submit" variant="primary" size="lg">
                Continue to the questions
              </Button>
              {busy && !questions && (
                <span className="flex items-center gap-2 text-sm text-sub">
                  <Spinner className="size-3.5" /> Writing questions for a {role}
                </span>
              )}
            </div>
          </form>
        )}

        {stage === "questions" && (
          <div className="flex flex-1 flex-col">
            {!questions ? (
              <div className="flex flex-1 flex-col justify-center py-10">
                {error ? (
                  <div className="mx-auto max-w-md text-center">
                    <p className="font-display text-2xl">Could not reach the model.</p>
                    <p className="mt-2 text-sm text-danger">{error}</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      <Button variant="primary" onClick={() => void fetchQuestions()}>
                        Try again
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setQuestions(DEFAULT_QUESTIONS);
                          setAnswers(new Array(DEFAULT_QUESTIONS.length).fill(""));
                          setQNote("Standard questions this time.");
                        }}
                      >
                        Use standard questions
                      </Button>
                    </div>
                  </div>
                ) : (
                  <AiProgress
                    title={`Writing questions for a ${role}`}
                    live={chars}
                    steps={["Reading the role", "Drafting questions", "Adding hints", "Finishing"]}
                    note="Free models can take up to a minute. The text streams in as it is written."
                  />
                )}
              </div>
            ) : (
              q && (
                <div key={i} className="fade flex flex-1 flex-col">
                  <div className="mb-12 mt-8">
                    <Tape value={i + 1} max={total} label="Interview progress" format={(v) => `${v} of ${total}`} />
                  </div>
                  {qNote && i === 0 && <p className="mb-4 text-xs text-sub">{qNote}</p>}
                  <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.15]">{q.question}</h1>
                  <p className="mt-3 text-[15px] leading-relaxed text-sub">{q.hint}</p>
                  <Textarea
                    key={`a-${i}`}
                    className="mt-6"
                    minRows={5}
                    autoFocus
                    value={answers[i] ?? ""}
                    onChange={(e) => setAnswers((a) => a.map((x, k) => (k === i ? e.target.value : x)))}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        e.preventDefault();
                        next();
                      }
                    }}
                    placeholder="Plain sentences are fine. Numbers are gold."
                    aria-label="Your answer"
                  />
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => (i === 0 ? setStage("contact") : setI(i - 1))}>
                        <ArrowLeft className="size-4" strokeWidth={1.5} /> Back
                      </Button>
                      <Button variant="ghost" size="sm" onClick={next}>
                        Skip
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-dim sm:inline">Ctrl + Enter</kbd>
                      <Button variant="primary" onClick={next}>
                        {i < total - 1 ? "Next question" : "Draft my resume"}
                      </Button>
                    </div>
                  </div>
                  <p className="mt-8 text-xs text-sub">
                    {answered} of {total} answered.{" "}
                    <button type="button" className="underline underline-offset-4 hover:text-ink" onClick={() => void startDraft()}>
                      Draft now with what I have
                    </button>
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {stage === "drafting" && (
          <div className="flex flex-1 flex-col justify-center py-10">
            {busy ? (
              <AiProgress
                title="Cutting your first draft"
                live={chars}
                steps={["Reading your answers", "Structuring your roles", "Writing bullets with numbers", "Grouping your skills", "Finishing"]}
                note={`From ${answered} ${answered === 1 ? "answer" : "answers"}. The resume streams in as it is written; free models can take up to a minute.`}
              />
            ) : (
              error && (
                <div className="mx-auto max-w-md text-center">
                  <p className="font-display text-3xl">The draft did not come back.</p>
                  <p className="mt-2 text-sm text-danger">{error}</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button variant="primary" onClick={() => void startDraft()}>
                      Try again
                    </Button>
                    <Button variant="secondary" onClick={() => setStage("questions")}>
                      Back to the questions
                    </Button>
                    <Button variant="ghost" onClick={startBlank}>
                      Open a blank sheet with my details
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {stage === "import" && (
          busy ? (
            <div className="flex flex-1 flex-col justify-center py-10">
              <AiProgress
                title="Reading your resume"
                live={chars}
                steps={["Parsing the text", "Finding your roles and dates", "Structuring the sections", "Grouping skills", "Finishing"]}
                note="Your resume streams in as it is structured. Free models can take up to a minute."
              />
            </div>
          ) : (
            <form
              className="flex flex-col gap-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (importText.trim().length > 40) void runImport();
              }}
            >
              <button type="button" onClick={() => setStage("setup")} className="flex w-fit items-center gap-1.5 text-sm text-sub transition-colors hover:text-ink">
                <ArrowLeft className="size-4" strokeWidth={1.5} /> Start with the interview instead
              </button>

              {seededJd && (
                <p className="flex items-center gap-2 rounded-lg border border-accent-line bg-accent-soft px-4 py-2.5 text-[14px] text-ink-dim">
                  <FileText className="size-4 shrink-0 text-accent" strokeWidth={1.75} /> Rebuilding from your scanned resume. Its text is loaded below and the posting is saved for tailoring.
                </p>
              )}

              <div>
                <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05]">Bring your existing resume.</h1>
                <p className="mt-3 max-w-[52ch] text-lg leading-relaxed text-ink-dim">Upload a file or paste the text. The model restructures it into a clean, parser-safe resume you can edit. It never invents anything.</p>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px] lg:gap-12">
                <div className="flex flex-col gap-5">
                  <Field label="Target role" hint="Optional. Sets the headline and steers skill grouping.">
                    {(id, by) => <Input id={id} aria-describedby={by} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Frontend Engineer" />}
                  </Field>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-ink-dim">Your resume</span>
                      <Segmented
                        label="Import source"
                        size="sm"
                        value={importMode}
                        onChange={setImportMode}
                        options={[
                          { value: "upload", label: "Upload" },
                          { value: "paste", label: "Paste" },
                        ]}
                      />
                    </div>

                    {importMode === "upload" ? (
                      <div>
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label="Upload a resume file"
                          onClick={() => document.getElementById("import-file")?.click()}
                          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && document.getElementById("import-file")?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setImportDrag(true);
                          }}
                          onDragLeave={() => setImportDrag(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setImportDrag(false);
                            const f = e.dataTransfer.files?.[0];
                            if (f) void takeImportFile(f);
                          }}
                          className={cn(
                            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
                            importDrag ? "border-accent bg-accent-soft" : "border-border hover:border-accent hover:bg-raised",
                          )}
                        >
                          {importBusy ? (
                            <Spinner className="size-6 text-accent" />
                          ) : importFile && !importFile.error ? (
                            <>
                              <FileText className="size-6 text-accent" strokeWidth={1.5} />
                              <p className="text-[15px] text-ink">{importFile.name}</p>
                              <p className="text-xs text-sub">{importFile.kind.toUpperCase()} · {importFile.chars.toLocaleString()} characters read · click to replace</p>
                            </>
                          ) : (
                            <>
                              <Upload className="size-6 text-sub" strokeWidth={1.5} />
                              <p className="text-[15px] text-ink">Drop a PDF, DOCX or TXT, or click to choose</p>
                              <p className="text-xs text-sub">Parsed in your browser. Nothing is uploaded.</p>
                            </>
                          )}
                        </div>
                        <input id="import-file" type="file" accept={ACCEPT} className="sr-only" onChange={(e) => e.target.files?.[0] && void takeImportFile(e.target.files[0])} />
                        {importFile?.error && <p className="mt-2 text-[13px] text-danger">{importFile.error}</p>}
                        {importFile && !importFile.error && importFile.chars < 200 && (
                          <p className="mt-2 text-[13px] text-danger">Almost no text came out. This looks like a scanned or image PDF. Switch to Paste, or export a text-based file.</p>
                        )}
                        {importText.trim() && (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-[13px] text-sub hover:text-ink">Preview extracted text</summary>
                            <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-line bg-surface p-3 font-mono text-[12px] leading-relaxed text-sub">{importText.slice(0, 1500)}{importText.length > 1500 && "…"}</div>
                          </details>
                        )}
                      </div>
                    ) : (
                      <Textarea
                        aria-label="Resume text"
                        minRows={12}
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        autoFocus
                        placeholder="Paste your whole resume here. Formatting does not matter; the text does."
                        className="font-mono text-[13px]"
                      />
                    )}
                    <p className="text-xs text-sub">{importText.trim() ? `${importText.trim().split(/\s+/).length} words ready` : "Add at least a few lines."}</p>
                  </div>

                  {error && (
                    <p role="alert" className="text-sm text-danger">{error}</p>
                  )}

                  <div className="flex items-center gap-3">
                    <Button type="submit" variant="primary" size="lg" disabled={importText.trim().length <= 40 || importBusy}>
                      Parse my resume
                    </Button>
                  </div>
                </div>

                <aside className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 text-[14px] leading-relaxed text-ink-dim lg:mt-8">
                  <div className="flex items-center gap-2 text-ink">
                    <ShieldCheck className="size-4 text-accent" strokeWidth={1.75} />
                    <span className="font-medium">What happens next</span>
                  </div>
                  <ul className="flex flex-col gap-3">
                    <li className="flex gap-2.5"><span className="mt-[9px] h-px w-3 shrink-0 bg-accent" aria-hidden="true" /> Your text is split into roles, education, projects and skills.</li>
                    <li className="flex gap-2.5"><span className="mt-[9px] h-px w-3 shrink-0 bg-accent" aria-hidden="true" /> Every employer, title, date and number is kept exactly.</li>
                    <li className="flex gap-2.5"><span className="mt-[9px] h-px w-3 shrink-0 bg-accent" aria-hidden="true" /> Weak lines are tightened; nothing is invented.</li>
                    <li className="flex gap-2.5"><span className="mt-[9px] h-px w-3 shrink-0 bg-accent" aria-hidden="true" /> You land in the editor with a live, editable sheet.</li>
                  </ul>
                  <p className="mt-1 border-t border-line pt-3 text-[13px] text-sub">Files are parsed in your browser. Only the extracted text is sent to the model.</p>
                </aside>
              </div>
            </form>
          )
        )}
      </main>

    </div>
  );
}
