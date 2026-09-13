import {
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
  convertInchesToTwip,
  type IParagraphOptions,
} from "docx";
import { SECTION_LABELS, type Resume } from "./schema";

/* Word export. Same content order and single-column structure as the sheet,
   so a .docx upload parses the same way the PDF does. */

const TPL: Record<Resume["template"], { font: string; body: number; name: number; title: number; accent: string; caps: boolean; gap: number }> = {
  classic: { font: "Georgia", body: 21, name: 40, title: 20, accent: "1A1A1A", caps: true, gap: 120 },
  modern: { font: "Arial", body: 20, name: 46, title: 19, accent: "2D4A8E", caps: true, gap: 120 },
  compact: { font: "Calibri", body: 19.5, name: 34, title: 18, accent: "1A1A1A", caps: true, gap: 80 },
  executive: { font: "Georgia", body: 21, name: 46, title: 21, accent: "1A1A1A", caps: true, gap: 130 },
  technical: { font: "Arial", body: 20, name: 40, title: 18, accent: "2D4A8E", caps: true, gap: 110 },
};

const dates = (start: string, end: string, current?: boolean) => [start, current ? "Present" : end].filter(Boolean).join(" - ");

export function buildDocx(r: Resume): Document {
  const t = TPL[r.template];
  const b = r.basics;
  const pageW = r.paper === "a4" ? 11906 : 12240;
  const pageH = r.paper === "a4" ? 16838 : 15840;
  const marginX = convertInchesToTwip(r.template === "compact" ? 0.6 : 0.7);
  const marginY = convertInchesToTwip(r.template === "compact" ? 0.5 : 0.6);
  const rightTab = pageW - marginX * 2;
  const muted = "4A4A4A";

  const p = (opts: IParagraphOptions) => new Paragraph(opts);
  const run = (text: string, extra: Partial<ConstructorParameters<typeof TextRun>[0] & object> = {}) =>
    new TextRun({ text, font: t.font, size: t.body, ...(extra as object) });

  const title = (text: string) =>
    p({
      spacing: { before: t.gap * 2, after: t.gap },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accented ? "C9D0E3" : t.accent, space: 2 } },
      children: [run(t.caps ? text.toUpperCase() : text, { bold: true, size: t.title, color: t.accent, characterSpacing: 20 })],
    });

  const row = (left: TextRun[], right: string) =>
    p({
      tabStops: [{ type: TabStopType.RIGHT, position: rightTab }],
      spacing: { before: t.gap, after: 20 },
      keepNext: true,
      children: [...left, ...(right ? [run(`\t${right}`, { color: muted, size: t.body - 2 })] : [])],
    });

  const bullet = (text: string) =>
    p({ bullet: { level: 0 }, spacing: { after: 20 }, children: [run(text)] });

  const children: Paragraph[] = [];

  children.push(p({ spacing: { after: 40 }, children: [run(b.name || "Your name", { bold: true, size: t.name })] }));
  const accented = t.accent !== "1A1A1A";
  if (b.headline) children.push(p({ spacing: { after: 60 }, children: [run(b.headline, { color: accented ? t.accent : muted, bold: accented })] }));
  const contact = [b.email, b.phone, b.location, b.linkedin, b.github, b.website].filter(Boolean);
  if (contact.length) children.push(p({ spacing: { after: 60 }, children: [run(contact.join("  |  "), { color: muted, size: t.body - 2 })] }));

  for (const sec of r.sectionOrder) {
    const label = SECTION_LABELS[sec];
    if (sec === "summary" && r.summary.trim()) {
      children.push(title(label), p({ children: [run(r.summary.trim())] }));
    }
    if (sec === "experience" && r.experience.some((e) => e.role || e.company)) {
      children.push(title(label));
      for (const e of r.experience) {
        const left = [run(e.role, { bold: true })];
        if (e.company) left.push(run(`${e.role ? ", " : ""}${e.company}`, { color: muted }));
        if (e.location) left.push(run(`, ${e.location}`, { color: muted }));
        children.push(row(left, dates(e.start, e.end, e.current)));
        e.bullets.filter((x) => x.trim()).forEach((x) => children.push(bullet(x.trim())));
      }
    }
    if (sec === "projects" && r.projects.some((x) => x.name)) {
      children.push(title(label));
      for (const pr of r.projects) {
        const left = [run(pr.name, { bold: true })];
        if (pr.description) left.push(run(`. ${pr.description}`, { color: muted }));
        children.push(row(left, pr.link));
        pr.bullets.filter((x) => x.trim()).forEach((x) => children.push(bullet(x.trim())));
      }
    }
    if (sec === "skills" && r.skills.some((g) => g.items.length)) {
      children.push(title(label));
      for (const g of r.skills.filter((x) => x.items.length)) {
        children.push(p({ spacing: { after: 20 }, children: [...(g.name ? [run(`${g.name}: `, { bold: true })] : []), run(g.items.join(", "))] }));
      }
    }
    if (sec === "education" && r.education.some((e) => e.school || e.degree)) {
      children.push(title(label));
      for (const e of r.education) {
        const deg = [e.degree, e.field].filter(Boolean).join(" in ");
        const left = [run(deg, { bold: true })];
        if (e.school) left.push(run(`${deg ? ", " : ""}${e.school}`, { color: muted }));
        if (e.location) left.push(run(`, ${e.location}`, { color: muted }));
        children.push(row(left, dates(e.start, e.end)));
        if (e.notes) children.push(p({ children: [run(e.notes, { color: muted })] }));
      }
    }
    if (sec === "certifications" && r.certifications.some((c) => c.name)) {
      children.push(title(label));
      for (const c of r.certifications) {
        const left = [run(c.name, { bold: true })];
        if (c.issuer) left.push(run(`, ${c.issuer}`, { color: muted }));
        children.push(row(left, c.date));
      }
    }
  }

  return new Document({
    creator: b.name || "Bespoke",
    title: r.title,
    styles: { default: { document: { run: { font: t.font, size: t.body } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: pageW, height: pageH },
            margin: { top: marginY, bottom: marginY, left: marginX, right: marginX },
          },
        },
        children,
      },
    ],
  });
}

export async function downloadDocx(r: Resume) {
  const blob = await Packer.toBlob(buildDocx(r));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(r.title || "resume").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "resume"}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
