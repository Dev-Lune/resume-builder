import { countSkill, extractJdKeywords, extractTitle, normalizeText, prettyLabel, type JdKeyword } from "./keywords.ts";

/* The scan engine. Given resume text and a job posting, produce the numbers a
   real ATS produces: a keyword match rate, a title match, and a parse-safety
   audit of the things that make ATS silently drop a resume. Pure and testable. */

export type Severity = "pass" | "warn" | "fail";

export type ScanCheck = {
  id: string;
  label: string;
  severity: Severity;
  detail: string;
  group: "parse" | "match" | "content";
};

export type Placement = "evidenced" | "listed" | "unknown";
export type MatchedKeyword = { label: string; jdFreq: number; resumeFreq: number; kind: JdKeyword["kind"]; placement?: Placement };

export type ScanResult = {
  score: number;
  matchRate: number;
  subscores: { keywords: number; title: number; parse: number; content: number };
  matched: MatchedKeyword[];
  missing: MatchedKeyword[];
  title: { jdTitle: string; found: boolean };
  experience: { required: number; evidenced: number };
  checks: ScanCheck[];
  recommendations: string[];
  meta: { resumeWords: number; jdWords: number; hardTotal: number; hardMatched: number };
};

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE = /(?:\+?\d[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?){2,4}\d{2,4}/;
const URLISH = /(linkedin\.com|github\.com|https?:\/\/|[a-z0-9-]+\.(dev|io|com|me))/i;

const SECTION_PATTERNS: Record<string, RegExp> = {
  experience: /\b(experience|employment|work history|professional experience)\b/i,
  education: /\b(education|academic)\b/i,
  skills: /\b(skills|technical skills|competencies|technologies)\b/i,
  summary: /\b(summary|profile|objective|about)\b/i,
};

const DATE = /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}|\d{1,2}\/\d{4}|\d{4})\b/i;

const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

export type ScanInput = {
  resumeText: string;
  jobDescription: string;
  fileKind?: "pdf" | "docx" | "txt" | "internal";
  /** For scanned/image PDFs we get little or no text; the caller flags it. */
  extractedChars?: number;
  /** Current year, injectable for deterministic tests. */
  now?: number;
};

/** Split the resume into its Skills block and everything else, so we can tell a
    skill that is only listed from one actually shown in a bullet. */
function splitSkillsBlock(resumeText: string): { skills: string; body: string } {
  const lines = resumeText.split(/\n/);
  const isHeader = (l: string) => l.trim().length <= 40 && /\b(experience|employment|work history|education|skills|technologies|competencies|summary|profile|objective|projects|certification|awards|languages|interests)\b/i.test(l);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/\b(skills|technologies|competencies)\b/i.test(lines[i]) && lines[i].trim().length <= 40) {
      start = i;
      break;
    }
  }
  if (start === -1) return { skills: "", body: resumeText };
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (isHeader(lines[i])) {
      end = i;
      break;
    }
  }
  const skills = lines.slice(start, end).join("\n");
  const body = [...lines.slice(0, start), ...lines.slice(end)].join("\n");
  return { skills, body };
}

function yearsRequired(jd: string): number {
  const nums = [...jd.matchAll(/(\d{1,2})\s*\+?\s*(?:years|yrs)\b/gi)].map((m) => parseInt(m[1], 10)).filter((n) => n > 0 && n < 40);
  return nums.length ? Math.min(...nums) : 0; // the minimum stated is the bar to clear
}

function yearsEvidenced(resumeText: string, now: number): number {
  const explicit = [...resumeText.matchAll(/(\d{1,2})\s*\+?\s*(?:years|yrs)\b/gi)].map((m) => parseInt(m[1], 10)).filter((n) => n > 0 && n < 50);
  const explicitMax = explicit.length ? Math.max(...explicit) : 0;
  const yrs = [...resumeText.matchAll(/\b(19|20)\d{2}\b/g)].map((m) => parseInt(m[0], 10)).filter((y) => y >= 1970 && y <= now);
  const present = /\b(present|current|now)\b/i.test(resumeText);
  let span = 0;
  if (yrs.length) {
    const min = Math.min(...yrs);
    const max = present ? now : Math.max(...yrs);
    span = Math.max(0, max - min);
  }
  return Math.max(explicitMax, span);
}

export function scan({ resumeText, jobDescription, fileKind = "txt", extractedChars, now = new Date().getFullYear() }: ScanInput): ScanResult {
  const norm = normalizeText(resumeText);
  const { skills: skillsBlock, body: bodyBlock } = splitSkillsBlock(resumeText);
  const normBody = normalizeText(bodyBlock);
  const canPlace = skillsBlock.trim().length > 0;
  const resumeWords = wordCount(resumeText);
  const jdWords = wordCount(jobDescription);
  const checks: ScanCheck[] = [];
  const recs: string[] = [];

  // ── Parse safety ──────────────────────────────────────────────
  const textThin = resumeWords < 40 || (extractedChars !== undefined && extractedChars < 200);
  checks.push({
    id: "extractable",
    group: "parse",
    severity: textThin ? "fail" : "pass",
    label: "Text is machine-readable",
    detail: textThin
      ? "Almost no text came out of this file. If it is a scanned or image-based PDF, most ATS read nothing and reject it. Export a text-based PDF or DOCX."
      : "The parser pulled clean text, which is the first thing every ATS does.",
  });
  if (textThin) recs.push("Re-export as a text PDF or DOCX; this file reads as an image, which most ATS cannot parse.");

  const hasEmail = EMAIL.test(resumeText);
  const hasPhone = PHONE.test(resumeText);
  const hasLink = URLISH.test(resumeText);
  const contactMissing = [!hasEmail && "email", !hasPhone && "phone"].filter(Boolean) as string[];
  checks.push({
    id: "contact",
    group: "parse",
    severity: contactMissing.length === 0 ? "pass" : contactMissing.length === 2 ? "fail" : "warn",
    label: "Contact details are detectable",
    detail: contactMissing.length === 0 ? `Found an email${hasPhone ? " and phone" : ""}${hasLink ? " and a profile link" : ""}.` : `Could not find your ${contactMissing.join(" or ")}. ATS file candidates under these fields.`,
  });
  if (contactMissing.length) recs.push(`Add your ${contactMissing.join(" and ")} to the top of the resume in plain text.`);

  const foundSections = Object.entries(SECTION_PATTERNS).filter(([, re]) => re.test(resumeText)).map(([k]) => k);
  const missingSections = Object.keys(SECTION_PATTERNS).filter((s) => !foundSections.includes(s));
  checks.push({
    id: "sections",
    group: "parse",
    severity: foundSections.length >= 3 ? "pass" : foundSections.length >= 2 ? "warn" : "fail",
    label: "Standard section headings present",
    detail: foundSections.length >= 3 ? `Found ${foundSections.join(", ")}. ATS split resumes on headings like these.` : `Only found ${foundSections.join(", ") || "none"}. Use plain headings: Experience, Education, Skills, Summary.`,
  });
  if (missingSections.includes("skills")) recs.push("Add a plain Skills section; ATS keyword matchers read it first.");

  checks.push({
    id: "dates",
    group: "parse",
    severity: DATE.test(resumeText) ? "pass" : "warn",
    label: "Employment dates are parseable",
    detail: DATE.test(resumeText) ? "Found dates in a form ATS can read (month-year or year)." : "No clear dates found. Write them as 'Mar 2022 - Present', not as graphics.",
  });

  const fileOk = fileKind === "pdf" || fileKind === "docx" || fileKind === "internal";
  checks.push({
    id: "filetype",
    group: "parse",
    severity: fileOk ? "pass" : "warn",
    label: "File type is ATS-friendly",
    detail: fileKind === "internal" ? "Built in the app; exports as a single-column text PDF or DOCX." : fileOk ? `A ${fileKind.toUpperCase()} parses cleanly in most systems.` : "Plain text works but loses structure; prefer PDF or DOCX.",
  });

  // column / table bleed heuristic: many very short lines suggests a multi-column layout flattened badly
  const lines = resumeText.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const shortLines = lines.filter((l) => l.length > 0 && l.split(/\s+/).length <= 2).length;
  const shortRatio = lines.length ? shortLines / lines.length : 0;
  if (shortRatio > 0.45 && lines.length > 20) {
    checks.push({
      id: "columns",
      group: "parse",
      severity: "warn",
      label: "Layout may be multi-column",
      detail: "The text came out in many tiny fragments, which is what a two-column or table layout does to an ATS. A single-column layout parses in the right order.",
    });
    recs.push("Switch to a single-column layout; columns and tables scramble the reading order for ATS.");
  }

  // ── Keyword match ─────────────────────────────────────────────
  const jdKeywords = extractJdKeywords(jobDescription);
  const matched: MatchedKeyword[] = [];
  const missing: MatchedKeyword[] = [];
  let weightHit = 0;
  let weightTotal = 0;

  for (const k of jdKeywords) {
    const resumeFreq = k.kind === "skill" ? countSkill(k.canonical, norm) : occurrences(` ${norm} `, ` ${normalizeText(k.label)} `);
    const weight = 1 + Math.log2(k.freq + 1); // repeated asks matter more
    weightTotal += weight;
    const row: MatchedKeyword = { label: k.kind === "skill" ? prettyLabel(k.canonical) : k.label, jdFreq: k.freq, resumeFreq, kind: k.kind };
    if (resumeFreq > 0) {
      weightHit += weight;
      if (k.kind === "skill" && canPlace) {
        const inBody = countSkill(k.canonical, normBody) > 0;
        row.placement = inBody ? "evidenced" : "listed";
      }
      matched.push(row);
    } else {
      missing.push(row);
    }
  }

  const listedOnly = matched.filter((m) => m.placement === "listed");
  for (const m of listedOnly.slice(0, 3)) {
    recs.push(`"${m.label}" is in your skills but never shown in a bullet. Add a line that proves you used it; recruiters trust evidenced skills over listed ones.`);
  }
  const matchRate = weightTotal ? Math.round((weightHit / weightTotal) * 100) : 0;
  const hardTotal = jdKeywords.filter((k) => k.kind === "skill").length;
  const hardMatched = matched.filter((m) => m.kind === "skill").length;

  checks.push({
    id: "keywords",
    group: "match",
    severity: matchRate >= 75 ? "pass" : matchRate >= 50 ? "warn" : "fail",
    label: `Keyword match rate is ${matchRate}%`,
    detail: jdKeywords.length === 0 ? "Paste a job posting to match against." : matchRate >= 75 ? "You carry most of what the posting asks for." : `The posting asks for ${jdKeywords.length} terms; you match ${matched.length}. Work the true ones into your bullets and skills.`,
  });
  for (const m of missing.filter((x) => x.kind === "skill").slice(0, 5)) {
    recs.push(`Missing keyword "${m.label}"${m.jdFreq > 1 ? ` (asked ${m.jdFreq} times)` : ""}. Add it only if it is genuinely true of you.`);
  }

  // ── Title match ───────────────────────────────────────────────
  const jdTitle = extractTitle(jobDescription);
  const titleFound = jdTitle ? titleMatches(jdTitle, resumeText) : false;
  if (jdTitle) {
    checks.push({
      id: "title",
      group: "content",
      severity: titleFound ? "pass" : "warn",
      label: "Target title appears in your resume",
      detail: titleFound ? `"${jdTitle}" shows up in your resume, which title-matchers reward.` : `The posting is for "${jdTitle}". Put that exact title in your headline if your history honestly supports it.`,
    });
    if (!titleFound) recs.push(`Set your headline to "${jdTitle}" if it is an honest description of your level.`);
  }

  // ── Experience (years) ────────────────────────────────────────
  const reqYears = yearsRequired(jobDescription);
  const eviYears = yearsEvidenced(resumeText, now);
  if (reqYears > 0) {
    const ok = eviYears >= reqYears;
    checks.push({
      id: "experience",
      group: "content",
      severity: ok ? "pass" : eviYears >= reqYears - 1 ? "warn" : "fail",
      label: `Meets the ${reqYears}+ years asked for`,
      detail: ok
        ? `The posting asks for ${reqYears}+ years; your history shows about ${eviYears}.`
        : `The posting asks for ${reqYears}+ years; your resume evidences about ${eviYears}. Make your date ranges explicit, or state total years in the summary if the total is higher.`,
    });
    if (!ok) recs.push(`State your total years up front. The posting wants ${reqYears}+ and your dates only add up to about ${eviYears}.`);
  }

  // ── Content length ────────────────────────────────────────────
  checks.push({
    id: "length",
    group: "content",
    severity: resumeWords >= 250 && resumeWords <= 900 ? "pass" : "warn",
    label: "Length fits one to two pages",
    detail: resumeWords < 250 ? `${resumeWords} words is thin; add detail to your recent roles.` : resumeWords > 900 ? `${resumeWords} words runs long; trim older roles.` : `${resumeWords} words, a normal one to two pages.`,
  });

  // ── Score ─────────────────────────────────────────────────────
  const parseChecks = checks.filter((c) => c.group === "parse");
  const parseScore = Math.round((parseChecks.filter((c) => c.severity === "pass").length / parseChecks.length) * 100);
  const titleScore = jdTitle ? (titleFound ? 100 : 40) : 100;
  const contentScore = resumeWords >= 250 && resumeWords <= 900 ? 100 : 60;

  // weighting mirrors how ATS lean: keywords dominate, then parse-safety, then title/content
  const score = Math.round(matchRate * 0.55 + parseScore * 0.25 + titleScore * 0.1 + contentScore * 0.1);

  return {
    score,
    matchRate,
    subscores: { keywords: matchRate, title: titleScore, parse: parseScore, content: contentScore },
    matched: matched.sort((a, b) => b.jdFreq - a.jdFreq),
    missing: missing.sort((a, b) => b.jdFreq - a.jdFreq),
    title: { jdTitle, found: titleFound },
    experience: { required: reqYears, evidenced: eviYears },
    checks,
    recommendations: recs.slice(0, 8),
    meta: { resumeWords, jdWords, hardTotal, hardMatched },
  };
}

function occurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let n = 0;
  let i = haystack.indexOf(needle);
  while (i !== -1) {
    n++;
    i = haystack.indexOf(needle, i + needle.length);
  }
  return n;
}

function titleMatches(title: string, resume: string): boolean {
  const words = normalizeText(title)
    .split(" ")
    .filter((w) => w.length > 2 && !["senior", "junior", "lead", "staff", "principal", "mid", "level"].includes(w));
  if (words.length === 0) return false;
  const r = normalizeText(resume);
  const hit = words.filter((w) => r.includes(w)).length;
  return hit / words.length >= 0.6;
}

export function scoreBand(score: number): { label: string; tone: Severity } {
  if (score >= 80) return { label: "Strong match", tone: "pass" };
  if (score >= 60) return { label: "Worth tuning", tone: "warn" };
  return { label: "Needs work", tone: "fail" };
}
