import type { Resume, SectionId } from "./schema";

/* ── The fit score: what a parser and a seven-second skim both need ──
   Deterministic, runs in the browser, no model call. Weights sum to 100. */

export type Check = {
  id: string;
  label: string;
  ok: boolean;
  weight: number;
  detail: string;
  section: SectionId | "basics";
};

export type Fit = { score: number; checks: Check[]; words: number; bullets: number };

const WEAK_STARTS = new Set([
  "responsible",
  "worked",
  "helped",
  "assisted",
  "was",
  "were",
  "i",
  "my",
  "we",
  "our",
  "participated",
  "involved",
  "duties",
  "tasked",
  "did",
  "made",
  "had",
  "the",
  "a",
  "an",
  "various",
  "some",
]);

const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const clean = (s: string) => s.replace(/^[\s•\-*]+/, "").trim();

export function allBullets(r: Resume): string[] {
  return [
    ...r.experience.flatMap((e) => e.bullets),
    ...r.projects.flatMap((p) => p.bullets),
  ]
    .map(clean)
    .filter(Boolean);
}

export function totalWords(r: Resume): number {
  const b = r.basics;
  return (
    words([b.name, b.headline, b.email, b.phone, b.location, b.website, b.linkedin, b.github].join(" ")) +
    words(r.summary) +
    r.experience.reduce(
      (n, e) => n + words([e.company, e.role, e.location, e.start, e.end].join(" ")) + e.bullets.reduce((m, x) => m + words(x), 0),
      0,
    ) +
    r.projects.reduce((n, p) => n + words([p.name, p.description].join(" ")) + p.bullets.reduce((m, x) => m + words(x), 0), 0) +
    r.education.reduce((n, e) => n + words([e.school, e.degree, e.field, e.notes].join(" ")), 0) +
    r.skills.reduce((n, g) => n + words(g.name) + g.items.reduce((m, x) => m + words(x), 0), 0) +
    r.certifications.reduce((n, c) => n + words([c.name, c.issuer].join(" ")), 0)
  );
}

const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

export function scoreResume(r: Resume): Fit {
  const bullets = allBullets(r);
  const total = totalWords(r);
  const checks: Check[] = [];
  const add = (c: Omit<Check, "ok"> & { ok: boolean }) => checks.push(c);

  // 1. Contact block
  {
    const missing: string[] = [];
    if (!r.basics.name.trim()) missing.push("name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.basics.email.trim())) missing.push("a valid email");
    if (r.basics.phone.replace(/\D/g, "").length < 7) missing.push("a phone number");
    add({
      id: "contact",
      label: "Contact block is complete",
      ok: missing.length === 0,
      weight: 12,
      section: "basics",
      detail: missing.length ? `Missing ${missing.join(", ")}. Parsers file the whole resume under these fields.` : "Name, email and phone are all present and parse cleanly.",
    });
  }

  // 2. Target title
  add({
    id: "headline",
    label: "A target title sits under your name",
    ok: r.basics.headline.trim().length > 2,
    weight: 5,
    section: "basics",
    detail: r.basics.headline.trim()
      ? `"${r.basics.headline.trim()}" tells the parser which role to match against.`
      : "Add the role you are applying for, word for word from the posting where you can.",
  });

  // 3. Summary length
  {
    const w = words(r.summary);
    add({
      id: "summary",
      label: "Summary is 30 to 90 words",
      ok: w >= 30 && w <= 90,
      weight: 10,
      section: "summary",
      detail: w === 0 ? "No summary yet. Three sentences: who you are, the strongest proof, what you want next." : w < 30 ? `${w} words. Too thin to carry keywords; aim for 30 to 90.` : w > 90 ? `${w} words. Recruiters skim; trim to under 90.` : `${w} words. Right length for a skim.`,
    });
  }

  // 4. Experience with dates
  {
    const good = r.experience.filter((e) => e.role.trim() && e.company.trim() && e.start.trim());
    add({
      id: "experience",
      label: "Every role has a title, company and start date",
      ok: r.experience.length > 0 && good.length === r.experience.length,
      weight: 10,
      section: "experience",
      detail: r.experience.length === 0 ? "No experience entries yet." : good.length === r.experience.length ? `${good.length} ${good.length === 1 ? "role" : "roles"}, all dated. Parsers build your timeline from these.` : `${r.experience.length - good.length} of ${r.experience.length} roles are missing a title, company or start date.`,
    });
  }

  // 5. Bullet count per role
  {
    const counts = r.experience.map((e) => e.bullets.map(clean).filter(Boolean).length);
    const recentOk = counts.length === 0 || counts[0] >= 3;
    const restOk = counts.slice(1).every((n) => n >= 2);
    add({
      id: "bullets",
      label: "Recent role has 3+ bullets, older roles 2+",
      ok: counts.length > 0 && recentOk && restOk,
      weight: 8,
      section: "experience",
      detail: counts.length === 0 ? "Add roles first." : recentOk && restOk ? `${bullets.length} bullets across ${counts.length} ${counts.length === 1 ? "role" : "roles"}.` : !recentOk ? `Your most recent role has ${counts[0]} bullet${counts[0] === 1 ? "" : "s"}; it should carry at least 3.` : "An older role has fewer than 2 bullets.",
    });
  }

  // 6. Action verbs
  {
    const weak = bullets.filter((b) => {
      const first = b.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
      return WEAK_STARTS.has(first);
    });
    const p = bullets.length ? 100 - pct(weak.length, bullets.length) : 0;
    add({
      id: "verbs",
      label: "Bullets open with a verb, not a duty",
      ok: bullets.length > 0 && p >= 80,
      weight: 10,
      section: "experience",
      detail: bullets.length === 0 ? "No bullets yet." : p >= 80 ? `${p}% start with an action. "Led", "Cut", "Built" beat "Responsible for".` : `${weak.length} of ${bullets.length} open weakly ("${weak[0]?.split(" ").slice(0, 3).join(" ")}..."). Rewrite them to start with what you did.`,
    });
  }

  // 7. Numbers
  {
    const withNum = bullets.filter((b) => /\d/.test(b));
    const p = pct(withNum.length, bullets.length);
    add({
      id: "metrics",
      label: "At least 40% of bullets carry a number",
      ok: bullets.length > 0 && p >= 40,
      weight: 10,
      section: "experience",
      detail: bullets.length === 0 ? "No bullets yet." : p >= 40 ? `${p}% have a figure in them. Numbers are what a skim remembers.` : `Only ${p}% have a figure. Add a count, a percentage, a time saved or a team size to ${Math.ceil(bullets.length * 0.4) - withNum.length} more.`,
    });
  }

  // 8. Bullet length
  {
    const lens = bullets.map(words);
    const good = lens.filter((n) => n >= 8 && n <= 32).length;
    const p = pct(good, bullets.length);
    add({
      id: "bulletLength",
      label: "Bullets run 8 to 32 words",
      ok: bullets.length > 0 && p >= 80,
      weight: 5,
      section: "experience",
      detail: bullets.length === 0 ? "No bullets yet." : p >= 80 ? "One or two lines each. Nothing to trim." : `${bullets.length - good} of ${bullets.length} are too short to say anything or too long to skim.`,
    });
  }

  // 9. Skills
  {
    const n = r.skills.reduce((m, g) => m + g.items.filter((x) => x.trim()).length, 0);
    add({
      id: "skills",
      label: "Skills section lists 8+ items",
      ok: n >= 8,
      weight: 10,
      section: "skills",
      detail: n >= 8 ? `${n} skills. Keyword matchers read this section first.` : `${n} skills. Parsers match postings against this list; aim for 8 to 20, grouped.`,
    });
  }

  // 10. Length
  add({
    id: "length",
    label: "Fits one to two pages (250 to 850 words)",
    ok: total >= 250 && total <= 850,
    weight: 10,
    section: "summary",
    detail: total < 250 ? `${total} words. Under a page; add bullets or a project.` : total > 850 ? `${total} words. Past two pages; cut the oldest role down to two bullets.` : `${total} words. ${total <= 550 ? "One page." : "Two pages."}`,
  });

  // 11. Education
  add({
    id: "education",
    label: "Education is listed",
    ok: r.education.some((e) => e.school.trim()),
    weight: 5,
    section: "education",
    detail: r.education.some((e) => e.school.trim()) ? "Present. Keep it short unless you graduated in the last two years." : "Add your highest qualification; many filters require it.",
  });

  // 12. No first person
  {
    const text = [r.summary, ...bullets].join(" ");
    const hits = text.match(/\b(I|me|my|myself|mine)\b/g) ?? [];
    add({
      id: "pronouns",
      label: "No first-person pronouns",
      ok: hits.length === 0,
      weight: 5,
      section: "summary",
      detail: hits.length === 0 ? 'Written in implied first person, the convention parsers and recruiters expect.' : `${hits.length} use${hits.length === 1 ? "" : "s"} of "I" or "my". Drop the pronoun and start with the verb.`,
    });
  }

  const score = checks.reduce((n, c) => n + (c.ok ? c.weight : 0), 0);
  return { score, checks, words: total, bullets: bullets.length };
}

export function fitLabel(score: number): string {
  if (score >= 90) return "Ready to send";
  if (score >= 75) return "Nearly there";
  if (score >= 50) return "Needs alterations";
  return "Still on the table";
}
