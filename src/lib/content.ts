/** Template names and one-line descriptions, shown in the editor and on the landing. */

import type { Template } from "./schema";

export const TEMPLATES: { id: Template; name: string; line: string }[] = [
  { id: "classic", name: "Classic", line: "Georgia, hairline rules under each heading. The safe default for any industry." },
  { id: "modern", name: "Modern", line: "Helvetica, a larger name, indigo headings. Reads current, parses plain." },
  { id: "compact", name: "Compact", line: "Calibri at 9.75pt with tight leading. Ten years of history on one page." },
  { id: "executive", name: "Executive", line: "Centered serif header, roman-numeral calm. For senior and leadership roles." },
  { id: "technical", name: "Technical", line: "Monospace labels and dates, a thin accent rule. Built for engineers." },
];
