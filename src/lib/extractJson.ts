/**
 * Every top-level {...} object in a blob of text (code fences stripped, strings
 * and escapes respected). A model often wraps JSON in prose or echoes the schema
 * before the answer, so callers try each candidate and keep the first that
 * validates rather than slicing first-brace..last-brace (which merges objects).
 */
export function jsonCandidates(text: string): string[] {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const out: string[] = [];
  let depth = 0;
  let start = -1;
  let inStr = false;
  let esc = false;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (c === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        out.push(body.slice(start, i + 1));
        start = -1;
      }
    }
  }
  if (out.length === 0) out.push(body.trim());
  return out;
}
