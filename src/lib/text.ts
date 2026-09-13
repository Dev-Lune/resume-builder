import { SECTION_LABELS, type Resume } from "./schema";

const dates = (start: string, end: string, current?: boolean) =>
  [start, current ? "Present" : end].filter(Boolean).join(" - ");

/** Plain text for pasting into application forms. Same order as the sheet. */
export function resumeToText(r: Resume): string {
  const b = r.basics;
  const out: string[] = [];
  if (b.name) out.push(b.name.toUpperCase());
  if (b.headline) out.push(b.headline);
  const contact = [b.email, b.phone, b.location, b.linkedin, b.github, b.website].filter(Boolean);
  if (contact.length) out.push(contact.join(" | "));

  for (const sec of r.sectionOrder) {
    const title = SECTION_LABELS[sec].toUpperCase();
    if (sec === "summary" && r.summary.trim()) out.push("", title, r.summary.trim());
    if (sec === "experience" && r.experience.length) {
      out.push("", title);
      for (const e of r.experience) {
        out.push([e.role, e.company].filter(Boolean).join(", ") + (e.location ? ` - ${e.location}` : ""));
        const d = dates(e.start, e.end, e.current);
        if (d) out.push(d);
        e.bullets.filter((x) => x.trim()).forEach((x) => out.push(`- ${x.trim()}`));
        out.push("");
      }
      out.pop();
    }
    if (sec === "projects" && r.projects.length) {
      out.push("", title);
      for (const p of r.projects) {
        out.push([p.name, p.link].filter(Boolean).join(" | "));
        if (p.description) out.push(p.description);
        p.bullets.filter((x) => x.trim()).forEach((x) => out.push(`- ${x.trim()}`));
        out.push("");
      }
      out.pop();
    }
    if (sec === "skills" && r.skills.length) {
      out.push("", title);
      r.skills.forEach((g) => out.push(`${g.name ? g.name + ": " : ""}${g.items.join(", ")}`));
    }
    if (sec === "education" && r.education.length) {
      out.push("", title);
      for (const e of r.education) {
        out.push([e.degree, e.field].filter(Boolean).join(" in "));
        out.push([e.school, e.location].filter(Boolean).join(", ") + (dates(e.start, e.end) ? ` | ${dates(e.start, e.end)}` : ""));
        if (e.notes) out.push(e.notes);
      }
    }
    if (sec === "certifications" && r.certifications.length) {
      out.push("", title);
      r.certifications.forEach((c) => out.push([c.name, c.issuer, c.date].filter(Boolean).join(" | ")));
    }
  }
  return out.join("\n").trim() + "\n";
}
