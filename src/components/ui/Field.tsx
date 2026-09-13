"use client";

import { useId, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/cn";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: (id: string, describedBy?: string) => React.ReactNode;
};

/** Label above, control, then hint or error. Labels are always visible. */
export function Field({ label, hint, error, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint || error ? `${id}-hint` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-ink-dim">
        {label}
      </label>
      {children(id, hintId)}
      {(error || hint) && (
        <p id={hintId} className={cn("text-xs leading-relaxed", error ? "text-danger" : "text-sub")} role={error ? "alert" : undefined}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("field text-[15px] sm:text-sm", className)} {...rest} />;
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { minRows?: number };

/** Grows with content. No manual resize handle; the sheet beside it is the reference. */
export function Textarea({ className, minRows = 2, value, ...rest }: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={minRows}
      value={value}
      className={cn("field text-[15px] leading-relaxed sm:text-sm", className)}
      {...rest}
    />
  );
}
