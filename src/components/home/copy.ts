/** All landing copy in one place. Plain words, second person, verbs first. */

export const HERO = {
  kicker: "Free. No sign-up. Works with any AI.",
  title: ["Resumes,", "made to measure."],
  accent: "made to measure.",
  sub: "Cut to fit every job you apply for. Answer a few short questions and get a clean, ATS-ready resume in minutes. Tailor it to any job post and download it free. Use ChatGPT, Claude, a free model, or no AI key at all.",
  primary: { href: "/new", label: "Build my resume" },
  secondary: { href: "/new?mode=import", label: "Improve my old resume" },
  trust: "No account. Your resume stays in your browser.",
};

export const WORKS_WITH = ["ChatGPT", "Claude", "Gemini", "Ollama", "OpenRouter", "OpenAI"];

export const STEPS = [
  { title: "Tell us the job", body: "Name the role and your experience. The questions adapt to it." },
  { title: "Answer a few questions", body: "Plain sentences are fine. Numbers make it stronger." },
  { title: "Edit, tailor, download", body: "Fine-tune it beside a live preview, match it to a posting, export PDF or Word." },
];

export const FEATURES = [
  { key: "interview", title: "Written from your answers", body: "No blank template to fill. It asks you questions and writes every line from what you said." },
  { key: "preview", title: "See it as you type", body: "Edit on one side, watch the page update on the other. What you see is what prints." },
  { key: "tailor", title: "Tailored to each job", body: "Paste a job post, see the keywords you are missing, and apply a rewrite in one click." },
  { key: "score", title: "An ATS score that helps", body: "Twelve checks hiring software runs. Each one tells you exactly what to change." },
  { key: "templates", title: "Five clean templates", body: "All single-column and easy for software to read. Switch any time without retyping." },
  { key: "export", title: "Free PDF and Word", body: "No paywall, no watermark, and no account needed to download." },
] as const;

export const ANY_AI = {
  title: "Use any AI. Or no key at all.",
  sub: "Pick how the writing happens. Change it any time from the top bar.",
  options: [
    { name: "On your computer", detail: "Run a local model with Ollama. Nothing leaves your machine." },
    { name: "Free models", detail: "Use free models through OpenRouter with a free key." },
    { name: "Your own key", detail: "Plug in OpenAI or NVIDIA if you already pay for one." },
    { name: "No key at all", detail: "Copy one prompt into ChatGPT or Claude, paste the answer back. Done." },
  ],
};

export const COMPARE: { label: string; us: string; them: string }[] = [
  { label: "Download your resume", us: "Free, always", them: "Usually paid" },
  { label: "Account needed", us: "None", them: "Required" },
  { label: "Where your resume is kept", us: "Your browser", them: "Their servers" },
  { label: "Which AI writes it", us: "Any, or none", them: "Theirs only" },
  { label: "ATS score", us: "Points to each fix", them: "A number, often locked" },
  { label: "Makes things up", us: "Never", them: "Sometimes" },
];

export const PRIVACY = [
  { title: "No account", body: "Start writing right away. There is nothing to sign up for." },
  { title: "Kept in your browser", body: "Your resume is saved on this device, not on our servers." },
  { title: "You choose what is sent", body: "Only the text for one task goes to the AI you pick. Manual and local modes send nothing." },
];

export const FAQ = [
  { q: "Is it really free?", a: "Yes. Writing, editing, tailoring, the ATS score and every download are free. There is no paid plan and no watermark." },
  { q: "Do I need an AI key?", a: "No. Pick Manual and it gives you one prompt to paste into ChatGPT, Claude or Gemini, then you paste the answer back. You can also use a free model or run one on your own computer." },
  { q: "Will it get past applicant tracking systems?", a: "Every template is single-column real text, the layout software reads most reliably. The built-in scan runs the checks those systems run and shows you what to fix." },
  { q: "Where is my resume stored?", a: "Only in your browser on this device. There is no account and no database. Clearing your browser data removes it, so download a copy you want to keep." },
  { q: "Can I start from my old resume?", a: "Yes. Upload a PDF or Word file, or paste the text, and it comes back as a clean resume you can edit. Nothing is invented." },
  { q: "What can I download?", a: "A PDF that matches the preview exactly, a Word file for portals that ask for one, and plain text for application forms." },
];

export const FINAL = {
  title: "Your next resume is about twelve minutes away.",
  sub: "Free, private, and written for the job you want.",
};
