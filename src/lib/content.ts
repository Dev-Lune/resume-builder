/** One source of marketing copy. Each design lays it out differently; none rewords it. */

export const HERO = {
  headline: "A resume cut to the job, not off the rack.",
  sub: "Answer a short interview, get a first draft, edit it beside a live sheet, tailor it to any posting, and export a PDF that parsers read cleanly.",
  primary: { href: "/new", label: "Build my resume" },
  secondary: { href: "/new?mode=import", label: "Paste an existing resume" },
};

export const STEPS = [
  { n: 1, title: "Answer", body: "Eight questions, one at a time, written for the role you name. They ask for the numbers a resume needs. Skip any you like, or paste an old resume and skip the lot." },
  { n: 2, title: "Edit", body: "The sheet sits beside the form and updates as you type. Rewrite any bullet three ways with the model and keep the one you would have written yourself." },
  { n: 3, title: "Tailor and export", body: "Paste a posting. See which keywords it wants and which you already have, apply the rewrite, and export a PDF, Word file, or plain text that parses the way it reads." },
];

export const TOOLS = [
  { id: "interview", name: "Interview draft", line: "Questions written for your role, a resume written from your answers." },
  { id: "rewrite", name: "Bullet rewrite", line: "Three versions of any line. Same facts, sharper verbs, number first." },
  { id: "tailor", name: "Tailor to a posting", line: "Keyword gap, rewritten summary and bullets, nothing invented." },
  { id: "fit", name: "Fit score", line: "Twelve checks a parser and a recruiter both make, each explained." },
] as const;

import type { Template } from "./schema";

export const TEMPLATES: { id: Template; name: string; line: string }[] = [
  { id: "classic", name: "Classic", line: "Georgia, hairline rules under each heading. The safe default for any industry." },
  { id: "modern", name: "Modern", line: "Helvetica, a larger name, indigo headings. Reads current, parses plain." },
  { id: "compact", name: "Compact", line: "Calibri at 9.75pt with tight leading. Ten years of history on one page." },
  { id: "executive", name: "Executive", line: "Centered serif header, roman-numeral calm. For senior and leadership roles." },
  { id: "technical", name: "Technical", line: "Monospace labels and dates, a thin accent rule. Built for engineers." },
];

export const CLOSING = {
  headline: "Your next resume takes twelve minutes.",
  sub: "No account. Your resume lives in this browser. Only the text you hand the model is ever sent, to whichever AI you pick, or nothing at all with a local model or manual mode.",
};

export const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#tools", label: "Tools" },
  { href: "#templates", label: "Templates" },
  { href: "#why", label: "Why us" },
];

/** The differentiators, in the product's own voice. `key` maps to an icon in the act. */
export const WHY_US: { key: "ai" | "private" | "free" | "honest"; title: string; body: string }[] = [
  { key: "ai", title: "Runs on any AI, even none", body: "Pick a local model on your machine, a free hosted one, or paste the prompt into ChatGPT or Claude. No key required, ever." },
  { key: "private", title: "Nothing leaves your browser", body: "No account, no server. Your resume lives on this device, and only the text you hand the model is sent. Local mode sends nothing." },
  { key: "free", title: "Free to export, always", body: "PDF, Word and plain text, with no download paywall and no watermark. The file you see on screen is the file that prints." },
  { key: "honest", title: "It won't invent your career", body: "The model is held to your facts, so no fabricated employers, titles or numbers, and a fit score where every check points to its fix." },
];

/** Us vs the typical paywalled AI builder. Kept generic on purpose. */
export const COMPARE: { label: string; us: string; them: string }[] = [
  { label: "Cost to download your resume", us: "Free", them: "Usually paywalled" },
  { label: "Account required", us: "None", them: "Required" },
  { label: "Where your data lives", us: "Your browser", them: "Their servers" },
  { label: "Use your own or a free AI", us: "Local, free, or any chat model", them: "Their model only" },
  { label: "ATS score you can act on", us: "Every check jumps to the fix", them: "A number, often gated" },
  { label: "Makes up facts to fill space", us: "Never", them: "Sometimes" },
];
