import type { ScanResult } from "@/lib/ats/scan";

/** A print-only, theme-independent report of a scan. Fixed black-on-white so it
    saves to a clean PDF regardless of the app theme. */
export function ScanReport({ result, resumeLabel }: { result: ScanResult; resumeLabel: string }) {
  const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const ink = "#141414";
  const muted = "#555";
  const rule = "1px solid #ccc";
  return (
    <div
      className="print-only"
      style={{ padding: "0.6in 0.7in", color: ink, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "10.5pt", lineHeight: 1.4 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `2px solid ${ink}`, paddingBottom: "6pt" }}>
        <h1 style={{ margin: 0, fontSize: "18pt" }}>ATS scan report</h1>
        <span style={{ fontSize: "9pt", color: muted }}>Bespoke · {date}</span>
      </div>

      <div style={{ display: "flex", gap: "24pt", marginTop: "14pt", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "40pt", fontWeight: 700, lineHeight: 1 }}>{result.score}</div>
          <div style={{ fontSize: "9pt", color: muted }}>of 100 overall</div>
        </div>
        <table style={{ borderCollapse: "collapse", fontSize: "9.5pt" }}>
          <tbody>
            {[
              ["Keyword match", `${result.matchRate}%`],
              ["Hard skills", `${result.meta.hardMatched}/${result.meta.hardTotal}`],
              ["Parse", `${result.subscores.parse}`],
              ["Title / content", `${result.subscores.title} / ${result.subscores.content}`],
            ].map(([k, v]) => (
              <tr key={k}>
                <td style={{ padding: "1pt 12pt 1pt 0", color: muted }}>{k}</td>
                <td style={{ padding: "1pt 0", fontWeight: 700 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: "6pt", fontSize: "9pt", color: muted }}>Resume: {resumeLabel}</p>

      <Section title="Keywords in your resume">
        <p style={{ margin: 0 }}>{result.matched.map((m) => m.label).join(", ") || "None."}</p>
      </Section>
      <Section title="Asked for, missing">
        <p style={{ margin: 0 }}>{result.missing.map((m) => m.label).join(", ") || "Nothing missing."}</p>
      </Section>

      <Section title="Parse safety">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9.5pt" }}>
          <tbody>
            {result.checks.map((c) => (
              <tr key={c.id} style={{ borderBottom: rule }}>
                <td style={{ padding: "3pt 8pt 3pt 0", width: "16pt", fontWeight: 700 }}>{c.severity === "pass" ? "OK" : c.severity === "warn" ? "!" : "X"}</td>
                <td style={{ padding: "3pt 0" }}>
                  <b>{c.label}.</b> <span style={{ color: muted }}>{c.detail}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {result.recommendations.length > 0 && (
        <Section title="What to fix first">
          <ol style={{ margin: 0, paddingLeft: "16pt" }}>
            {result.recommendations.map((r, i) => (
              <li key={i} style={{ marginBottom: "3pt" }}>{r}</li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: "14pt", breakInside: "avoid" }}>
      <h2 style={{ margin: "0 0 5pt", fontSize: "11pt", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid #141414", paddingBottom: "2pt" }}>{title}</h2>
      {children}
    </section>
  );
}
