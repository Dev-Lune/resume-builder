"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Field, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import type { LinkedInResult, Resume } from "@/lib/schema";
import { resumeToText } from "@/lib/text";
import { useAi } from "./useAi";

export function LinkedInDrawer({ open, onClose, resume }: { open: boolean; onClose: () => void; resume: Resume }) {
  const { run, busy, error } = useAi();
  const [result, setResult] = useState<LinkedInResult | null>(null);
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [copied, setCopied] = useState<"headline" | "about" | null>(null);

  const generate = async () => {
    const out = await run<LinkedInResult>("linkedin", { resume: resumeToText(resume), targetRole: resume.targetRole || resume.basics.headline });
    if (out) {
      setResult(out);
      setHeadline(out.headline);
      setAbout(out.about);
    }
  };

  const copy = async (what: "headline" | "about", text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(what);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="LinkedIn"
      width="max-w-2xl"
      footer={
        <div className="flex items-center justify-end">
          <Button variant="primary" onClick={generate} loading={busy}>
            {result ? "Regenerate" : "Generate from my resume"}
          </Button>
        </div>
      }
    >
      {!result && !busy && (
        <p className="text-[15px] leading-relaxed text-ink-dim">
          Turn this resume into a LinkedIn headline and About section, written in the first person the way LinkedIn reads, keyword-rich for recruiter search, and built only from what is on your resume.
        </p>
      )}
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {result && (
        <div className="fade flex flex-col gap-6">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[13px] font-medium text-ink-dim">Headline</span>
              <span className="flex items-center gap-2">
                <span className={cn("font-mono text-[11px] tabular", headline.length > 220 ? "text-danger" : "text-sub")}>{headline.length}/220</span>
                <button type="button" onClick={() => copy("headline", headline)} className="inline-flex items-center gap-1 text-[12px] text-accent hover:underline">
                  {copied === "headline" ? <Check className="size-3" strokeWidth={2.5} /> : <Copy className="size-3" strokeWidth={1.75} />} Copy
                </button>
              </span>
            </div>
            <Textarea value={headline} onChange={(e) => setHeadline(e.target.value)} minRows={2} aria-label="LinkedIn headline" />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[13px] font-medium text-ink-dim">About</span>
              <button type="button" onClick={() => copy("about", about)} className="inline-flex items-center gap-1 text-[12px] text-accent hover:underline">
                {copied === "about" ? <Check className="size-3" strokeWidth={2.5} /> : <Copy className="size-3" strokeWidth={1.75} />} Copy
              </button>
            </div>
            <Textarea value={about} onChange={(e) => setAbout(e.target.value)} minRows={10} aria-label="LinkedIn about" className="leading-relaxed" />
          </div>

          {result.tips.length > 0 && (
            <div>
              <span className="text-[13px] font-medium text-ink-dim">Profile tips</span>
              <ul className="mt-2 flex flex-col gap-2 text-[14px] leading-relaxed text-ink-dim">
                {result.tips.map((t, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="mt-[7px] h-px w-3 shrink-0 bg-accent" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
