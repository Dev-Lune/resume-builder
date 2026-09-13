import { cn } from "@/lib/cn";
import { SECTION_LABELS, type Resume, type SectionId } from "@/lib/schema";

const dates = (start: string, end: string, current?: boolean) =>
  [start, current ? "Present" : end].filter(Boolean).join(" - ");

const hasContent = (r: Resume, s: SectionId) =>
  s === "summary"
    ? r.summary.trim().length > 0
    : s === "experience"
      ? r.experience.some((e) => e.role || e.company)
      : s === "education"
        ? r.education.some((e) => e.school || e.degree)
        : s === "projects"
          ? r.projects.some((p) => p.name)
          : s === "skills"
            ? r.skills.some((g) => g.items.length)
            : r.certifications.some((c) => c.name);

/**
 * The resume document. One column, real text, system fonts; the same markup
 * prints to PDF. Never put anything here a parser cannot read as text.
 */
export function Sheet({ resume: r, className, id }: { resume: Resume; className?: string; id?: string }) {
  const b = r.basics;
  const contact = [b.email, b.phone, b.location, b.linkedin, b.github, b.website].filter(Boolean);
  const empty = !b.name && !contact.length && !r.sectionOrder.some((s) => hasContent(r, s));

  return (
    <article
      id={id}
      className={cn("sheet", `tpl-${r.template}`, r.paper === "a4" && "paper-a4", className)}
      aria-label={`Resume preview, ${r.template} template`}
    >
      <header>
        <h1 className="name">{b.name || <span className="empty">Your name</span>}</h1>
        {b.headline && <p className="headline">{b.headline}</p>}
        {contact.length > 0 && (
          <p className="contact">
            {b.email && <span>{b.email}</span>}
            {b.phone && <span>{b.phone}</span>}
            {b.location && <span>{b.location}</span>}
            {b.linkedin && <span>{b.linkedin}</span>}
            {b.github && <span>{b.github}</span>}
            {b.website && <span>{b.website}</span>}
          </p>
        )}
      </header>

      {empty && (
        <p className="empty" style={{ marginTop: "18pt" }}>
          The sheet fills in as you type. Start with your name on the left.
        </p>
      )}

      {r.sectionOrder.filter((s) => hasContent(r, s)).map((s) => (
        <section key={s} className={cn("section", r.pageBreaks?.includes(s) && "break-before")}>
          <h2 className="section-title">{SECTION_LABELS[s]}</h2>
          {s === "summary" && <p>{r.summary}</p>}

          {s === "experience" &&
            r.experience.map((e) => (
              <div key={e.id} className="entry">
                <div className="row">
                  <span>
                    <span className="role">{e.role}</span>
                    {e.company && <span className="org">{e.role ? ", " : ""}{e.company}</span>}
                    {e.location && <span className="org">{", "}{e.location}</span>}
                  </span>
                  <span className="r">{dates(e.start, e.end, e.current)}</span>
                </div>
                {e.bullets.some((x) => x.trim()) && (
                  <ul>
                    {e.bullets.filter((x) => x.trim()).map((x, i) => (
                      <li key={i}>{x.trim()}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

          {s === "projects" &&
            r.projects.map((p) => (
              <div key={p.id} className="entry">
                <div className="row">
                  <span>
                    <span className="role">{p.name}</span>
                    {p.description && <span className="org">{". "}{p.description}</span>}
                  </span>
                  {p.link && <span className="r">{p.link}</span>}
                </div>
                {p.bullets.some((x) => x.trim()) && (
                  <ul>
                    {p.bullets.filter((x) => x.trim()).map((x, i) => (
                      <li key={i}>{x.trim()}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

          {s === "skills" &&
            r.skills.filter((g) => g.items.length).map((g) => (
              <p key={g.id} className="skills-row">
                {g.name && <b>{g.name}: </b>}
                {g.items.join(", ")}
              </p>
            ))}

          {s === "education" &&
            r.education.map((e) => (
              <div key={e.id} className="entry">
                <div className="row">
                  <span>
                    <span className="role">{[e.degree, e.field].filter(Boolean).join(" in ")}</span>
                    {e.school && <span className="org">{e.degree || e.field ? ", " : ""}{e.school}</span>}
                    {e.location && <span className="org">{", "}{e.location}</span>}
                  </span>
                  <span className="r">{dates(e.start, e.end)}</span>
                </div>
                {e.notes && <p className="org">{e.notes}</p>}
              </div>
            ))}

          {s === "certifications" &&
            r.certifications.map((c) => (
              <div key={c.id} className="row entry">
                <span>
                  <span className="role">{c.name}</span>
                  {c.issuer && <span className="org">{", "}{c.issuer}</span>}
                </span>
                <span className="r">{c.date}</span>
              </div>
            ))}
        </section>
      ))}
    </article>
  );
}

export const PAGE_PX = {
  letter: { w: 816, h: 1056 },
  a4: { w: 793.7, h: 1122.5 },
} as const;
