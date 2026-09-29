"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Field, Input, Textarea } from "@/components/ui/Field";
import type { Resume } from "@/lib/schema";
import { resumeToText } from "@/lib/text";
import { useAi } from "./useAi";

export function CoverLetterDrawer({ open, onClose, resume }: { open: boolean; onClose: () => void; resume: Resume }) {
  const { run, busy, error } = useAi();
  // null = follow the resume's saved posting; a string = a one-off override for this letter.
  const [jd, setJd] = useState<string | null>(null);
  const [company, setCompany] = useState("");
  const [letter, setLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const posting = jd ?? resume.jobDescription;
  const usingSaved = jd === null && !!resume.jobDescription.trim();

  const write = async () => {
    const out = await run<{ letter: string }>("cover", {
      resume: resumeToText(resume),
      jobDescription: posting,
      name: resume.basics.name,
      company,
      customInstructions: resume.customInstructions,
    });
    if (out) setLetter(out.letter);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Cover letter"
      width="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          {letter && (
            <Button variant="secondary" onClick={copy}>
              {copied ? "Copied" : "Copy letter"}
            </Button>
          )}
          <Button variant="primary" onClick={write} loading={busy} disabled={posting.trim().length < 80}>
            {letter ? "Write another" : "Write the letter"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <Field label="Company (optional)">{(id) => <Input id={id} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Kestrel Pay" />}</Field>
        <Field
          label="Job posting"
          hint={
            usingSaved
              ? "Using the job description saved on this resume. Edit here for a one-off letter; the saved one stays as is."
              : `Paste the posting. The letter answers what it asks for, with facts from your resume.${resume.customInstructions.trim() ? " Your custom instructions apply too." : ""}`
          }
          error={error ?? undefined}
        >
          {(id, by) => <Textarea id={id} aria-describedby={by} minRows={6} value={posting} onChange={(e) => setJd(e.target.value)} />}
        </Field>
        {jd !== null && resume.jobDescription.trim() && jd !== resume.jobDescription && (
          <button type="button" className="-mt-3 w-fit text-xs font-medium text-accent hover:underline" onClick={() => setJd(null)}>
            Use the saved job description again
          </button>
        )}
        {letter && (
          <Field label="Your letter" hint="Edit freely. Around 220 words; four short paragraphs.">
            {(id, by) => <Textarea id={id} aria-describedby={by} minRows={14} value={letter} onChange={(e) => setLetter(e.target.value)} className="leading-relaxed" />}
          </Field>
        )}
      </div>
    </Drawer>
  );
}
