"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "./Button";

/**
 * Right-side glass drawer. Scrim and panel are siblings so the panel samples
 * the page, not a filtered ancestor.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  width = "max-w-xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restore.current = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      restore.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "scrim fixed inset-0 z-40 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "glass fixed inset-y-2 right-2 z-50 flex w-[calc(100vw-1rem)] flex-col rounded-xl shadow-float outline-none transition-[transform,opacity] duration-400 ease-out-quart",
          width,
          open ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-6 opacity-0",
        )}
      >
        <header className="flex h-14 shrink-0 items-center justify-between pl-5 pr-3 hairline-b">
          <h2 className="font-display text-xl">{title}</h2>
          <IconButton label="Close" size="sm" onClick={onClose}>
            <X className="size-4" strokeWidth={1.5} />
          </IconButton>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="shrink-0 px-5 py-3 hairline-t">{footer}</footer>}
      </div>
    </>
  );
}
