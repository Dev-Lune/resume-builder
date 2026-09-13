import { z } from "zod";
import { BulletsOut, CoverOut, DraftResume, LinkedInOut, QuestionsOut, SkillsOut, TailorOut, VariantsOut } from "./schema";

/** For letters and LinkedIn: first person is fine, unlike a resume. */
export const PROSE_SYSTEM = `You write job-search prose: cover letters and LinkedIn profiles, built only from the facts in the person's resume. First person is expected. Never invent an employer, title, date, degree, tool, or number; use only what the resume gives. Plain ASCII punctuation, no em dashes, no emoji, no markdown. Avoid cliches: no "results-driven", "passionate", "synergy", "leverage", "detail-oriented", "team player", "dynamic". Concrete verbs and real specifics only. Output valid JSON matching the schema exactly.`;

export const SYSTEM = `You write resumes that pass applicant tracking systems and survive a recruiter's seven-second skim.

Rules you never break:
- Implied first person. Never write "I", "my", "we" or "our".
- A bullet is one sentence, 12 to 28 words, opening with a strong verb (past tense for past roles, present tense for a current role): what was done, how, and the measurable result when the facts include one. No trailing period.
- Never invent employers, titles, dates, degrees, tools, or numbers. When a figure is missing, write the bullet without one. Never estimate.
- Plain ASCII punctuation. No em dashes, no emoji, no markdown, no bullet characters inside strings.
- Use the exact terminology of the target role where it is truthful. Standard section vocabulary only.
- Skills are concrete tools, languages, methods and domains. Never list soft skills like "team player" or "hard-working".
- Empty string for anything unknown. Never write "N/A" or "Unknown".
- Output valid JSON matching the schema exactly.`;

const str = z.string().max(20000);
const short = z.string().max(400);

export type Task<I, O> = {
  input: z.ZodType<I>;
  output: z.ZodType<O>;
  system: string;
  user: (i: I) => string;
  temperature: number;
  /** Use the prose voice (first person allowed) instead of the resume voice. */
  prose?: boolean;
};

const def = <I, O>(t: Task<I, O>) => t;

const answersLine = (a: { question: string; answer: string }[]) =>
  a
    .filter((x) => x.answer.trim())
    .map((x, i) => `Q${i + 1}: ${x.question}\nA${i + 1}: ${x.answer.trim()}`)
    .join("\n\n");

export const TASKS = {
  questions: def({
    input: z.object({
      role: short,
      level: short,
      industry: short.default(""),
      known: str.default(""),
      count: z.number().int().min(4).max(12).default(8),
    }),
    output: QuestionsOut,
    temperature: 0.6,
    system: `You are interviewing someone so that their resume can be drafted from the answers. Ask concrete questions a person can answer in two to four sentences from memory. Every question should pull out facts a resume needs: employer, title, dates, scope, tools, and above all numbers (users, revenue, cost, time saved, team size, volume). Never ask for name or contact details. Never ask yes/no questions. One question per topic; do not repeat what is already known. The hint is a one-sentence example of the shape of a good answer, phrased for this role, not a generic tip.`,
    user: (i) =>
      `Target role: ${i.role}\nExperience level: ${i.level}${i.industry ? `\nIndustry: ${i.industry}` : ""}\n${
        i.known ? `\nAlready known about this person (do not ask again):\n${i.known}\n` : ""
      }\nWrite exactly ${i.count} questions in this order: the most recent role and its two or three biggest results first, then earlier roles, then projects or education (weight education higher for students and people under two years of experience), then tools and skills, then one question that helps write the summary (what they want next and what they are known for).`,
  }),

  draft: def({
    input: z.object({
      role: short,
      level: short,
      basics: z.record(z.string(), z.string()).default({}),
      answers: z.array(z.object({ question: short, answer: str })).max(20),
      notes: str.default(""),
    }),
    output: DraftResume,
    temperature: 0.5,
    system: `Draft a complete resume from interview answers. Use only facts the person gave. Split answers into roles, projects, education and certifications. Where a date or location was not stated leave it empty. Write three to five bullets for the most recent role and two to four for each earlier role, each carrying a number when the answers include one. Write a 40 to 70 word summary that names the target role, years or scale, and the two strongest proofs. Group skills into two to four named groups (for example Languages, Frameworks, Tools, Practices) with 8 to 20 items in total, all evidenced by the answers. Copy contact fields exactly as given. Set headline to the target role. Leave any section empty rather than pad it.`,
    user: (i) =>
      `Target role: ${i.role}\nExperience level: ${i.level}\n\nContact (copy exactly):\n${JSON.stringify(i.basics)}\n\nInterview:\n${answersLine(i.answers)}${
        i.notes ? `\n\nOther notes:\n${i.notes}` : ""
      }`,
  }),

  import: def({
    input: z.object({ text: str, role: short.default("") }),
    output: DraftResume,
    temperature: 0.2,
    system: `Parse pasted resume text into the schema. Keep every employer, title, date, degree, certification and number exactly as written. Keep bullet wording, but: remove a leading "I" or "Responsible for", split a bullet that contains two unrelated achievements, and drop bullet characters. Put skills into two to four named groups. If a target role is given set headline to it; otherwise use the most recent title. Put anything that does not fit a field into the nearest sensible one rather than dropping it (for example awards go into certifications with the awarding body as issuer).`,
    user: (i) => `${i.role ? `Target role: ${i.role}\n\n` : ""}Resume text:\n${i.text}`,
  }),

  summary: def({
    input: z.object({ resume: str, targetRole: short.default("") }),
    output: VariantsOut,
    temperature: 0.7,
    system: `Write three alternative professional summaries for this resume, each 40 to 70 words, each a different angle: the first leads with scope and years, the second leads with the single strongest measurable outcome, the third leads with the specialty or domain. Every summary names the target role. Use only facts present in the resume.`,
    user: (i) => `${i.targetRole ? `Target role: ${i.targetRole}\n\n` : ""}Resume:\n${i.resume}`,
  }),

  bullet: def({
    input: z.object({
      bullet: str,
      role: short.default(""),
      company: short.default(""),
      targetRole: short.default(""),
    }),
    output: VariantsOut,
    temperature: 0.7,
    system: `Rewrite one resume bullet three ways. Keep every fact and figure from the original; add none. Variant one: tightest version, number as early as possible. Variant two: emphasise ownership and scope (what was led, built or owned). Variant three: emphasise the outcome for the business or user. Each 12 to 28 words. If the original has no number, none of the variants may have one; instead make the scope concrete with the nouns the original gives.`,
    user: (i) =>
      `Role: ${i.role || "unknown"} at ${i.company || "unknown"}${i.targetRole ? `\nApplying for: ${i.targetRole}` : ""}\n\nOriginal bullet:\n${i.bullet}`,
  }),

  suggestBullets: def({
    input: z.object({
      role: short,
      company: short.default(""),
      targetRole: short.default(""),
      existing: z.array(str).max(20).default([]),
      context: str.default(""),
    }),
    output: BulletsOut,
    temperature: 0.7,
    system: `Write three new bullets for a role. Do not repeat anything already covered by the existing bullets. Because you do not know this person's exact results, put a square-bracket placeholder where a figure belongs, for example "[X%]" or "[N] users", one placeholder per bullet at most, so they can fill it in. Everything else in the bullet must be plausible for the stated role and company type, phrased in the terminology of the target role. Each 12 to 28 words.`,
    user: (i) =>
      `Role: ${i.role}${i.company ? ` at ${i.company}` : ""}${i.targetRole ? `\nApplying for: ${i.targetRole}` : ""}\n\nExisting bullets:\n${
        i.existing.filter(Boolean).map((b) => `- ${b}`).join("\n") || "(none)"
      }${i.context ? `\n\nContext from the rest of the resume:\n${i.context}` : ""}`,
  }),

  skills: def({
    input: z.object({ resume: str, targetRole: short.default("") }),
    output: SkillsOut,
    temperature: 0.4,
    system: `Extract the skills evidenced in this resume and group them into three to five named groups (choose from: Languages, Frameworks, Tools, Platforms, Practices, Domain, Data, Design, Languages spoken). 8 to 20 items in total. Include a skill only if the resume text supports it or it is a direct, unavoidable companion of a listed one (for example HTML and CSS for a React engineer); at most three such additions. Use the canonical spelling of each tool.`,
    user: (i) => `${i.targetRole ? `Target role: ${i.targetRole}\n\n` : ""}Resume:\n${i.resume}`,
  }),

  tailor: def({
    input: z.object({
      resume: z.object({
        headline: short,
        summary: str,
        experience: z.array(z.object({ index: z.number().int(), role: short, company: short, bullets: z.array(str) })),
        skills: z.array(z.object({ name: short, items: z.array(short) })),
        other: str.default(""),
      }),
      jobDescription: str,
    }),
    output: TailorOut,
    temperature: 0.4,
    system: `Tailor a resume to one job posting without inventing anything.
1. keywords: pull the hard skills, tools, certifications, methods and domain terms the posting asks for (15 to 30). Put each in matched if the resume evidences it, else in missing. Use the posting's spelling.
2. headline: the posting's job title if the candidate's history honestly supports that title, otherwise the candidate's current headline.
3. summary: 40 to 70 words, leading with the posting's top priorities, built only from facts in the resume.
4. experience: for every index provided, return the same number of bullets, rewritten to use the posting's terminology where the underlying fact is the same, and reordered so the most relevant bullet comes first. Never add a tool or responsibility the original bullets do not contain.
5. skills: regroup with matched keywords first, in two to four named groups, including only skills the resume evidences.
6. notes: three to five short lines, each one change made or one missing keyword the candidate should add only if it is true of them.`,
    user: (i) => `Job posting:\n${i.jobDescription}\n\nResume (JSON):\n${JSON.stringify(i.resume)}`,
  }),

  cover: def({
    input: z.object({ resume: str, jobDescription: str, name: short.default(""), company: short.default("") }),
    output: CoverOut,
    temperature: 0.7,
    prose: true,
    system: `Write a cover letter of 180 to 260 words in three or four short paragraphs. Paragraph one: the role, and the single strongest reason this person fits it, stated as a fact from the resume. Paragraph two and three: two specific proofs from the resume that map to the posting's stated needs, with the numbers the resume gives. Last paragraph: one sentence on what they want to do in the role, then a plain close. No greeting flattery, no "I am writing to", no "passionate", no "excited", no "leverage", no "synergy". Address it "Dear Hiring Manager," unless the posting names a person. Sign off with the person's name. Use only facts from the resume; never invent a reason for wanting the company. Plain text, blank line between paragraphs.`,
    user: (i) => `${i.name ? `Applicant: ${i.name}
` : ""}${i.company ? `Company: ${i.company}
` : ""}
Job posting:
${i.jobDescription}

Resume:
${i.resume}`,
  }),

  linkedin: def({
    input: z.object({ resume: str, targetRole: short.default("") }),
    output: LinkedInOut,
    temperature: 0.7,
    prose: true,
    system: `Write a LinkedIn headline and About section from this resume. LinkedIn reads warmer than a resume and is written in the first person, but stays concrete and free of fluff.
- headline: up to 200 characters. The role, the two or three things this person is known for, and the value they bring. At most three segments separated by " | "; do not pad with buzzwords.
- about: three to five short paragraphs in the first person. Open with what they do and the single strongest proof. Then scope, domains and specialties, woven with the terms a recruiter would search. Then what they are looking for next. Close with one short line inviting contact. Only facts from the resume.
- tips: three to five short, specific profile tips for this person, each one sentence (which skills to pin, what the banner or featured section should show, which keywords are thin).`,
    user: (i) => `${i.targetRole ? `Target role: ${i.targetRole}\n\n` : ""}Resume:\n${i.resume}`,
  }),
};

export type TaskName = keyof typeof TASKS;
