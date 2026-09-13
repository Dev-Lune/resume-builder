"use client";

/* Turn an uploaded resume file into plain text, in the browser. PDF via pdf.js,
   DOCX via mammoth, everything else read as text. Loaded lazily so the parsers
   never touch the server bundle or the initial page load. */

export type FileKind = "pdf" | "docx" | "txt";
export type Extracted = { text: string; kind: FileKind; chars: number; pages?: number; error?: string };

export const ACCEPT = ".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";
export const MAX_BYTES = 8 * 1024 * 1024;

export async function extractFile(file: File): Promise<Extracted> {
  if (file.size > MAX_BYTES) return { text: "", kind: "txt", chars: 0, error: "That file is over 8 MB. Export a lighter PDF or DOCX." };
  const name = file.name.toLowerCase();
  try {
    if (name.endsWith(".pdf") || file.type === "application/pdf") return await extractPdf(file);
    if (name.endsWith(".docx") || file.type.includes("wordprocessingml")) return await extractDocx(file);
    const text = await file.text();
    return { text, kind: "txt", chars: text.length };
  } catch (e) {
    return { text: "", kind: name.endsWith(".pdf") ? "pdf" : name.endsWith(".docx") ? "docx" : "txt", chars: 0, error: (e as Error).message || "Could not read that file." };
  }
}

async function extractPdf(file: File): Promise<Extracted> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let line = "";
    let lastY: number | null = null;
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const y = item.transform?.[5] ?? null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 3) {
        parts.push(line.trim());
        line = "";
      }
      line += item.str + (item.hasEOL ? "" : " ");
      lastY = y;
    }
    if (line.trim()) parts.push(line.trim());
    parts.push("");
  }
  await doc.destroy();
  const text = parts.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return { text, kind: "pdf", chars: text.length, pages: doc.numPages };
}

async function extractDocx(file: File): Promise<Extracted> {
  // The browser build avoids Node's fs; extractRawText keeps paragraph breaks.
  const mammoth = await import("mammoth/mammoth.browser.js");
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  const text = value.replace(/\n{3,}/g, "\n\n").trim();
  return { text, kind: "docx", chars: text.length };
}
