"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Resume } from "@/lib/schema";
import { PAGE_PX, Sheet } from "./Sheet";

/**
 * Renders the sheet at true size and scales it to the container width, so the
 * preview is the exact document that prints. Shows page-break guides when the
 * content runs past a page.
 */
export function ScaledSheet({
  resume,
  className,
  maxScale = 1,
  guides = true,
}: {
  resume: Resume;
  className?: string;
  maxScale?: number;
  guides?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const page = PAGE_PX[resume.paper];

  useEffect(() => {
    const w = wrap.current;
    const i = inner.current;
    if (!w || !i) return;
    const ro = new ResizeObserver(() => {
      setWidth(w.clientWidth);
      setHeight(i.offsetHeight);
    });
    ro.observe(w);
    ro.observe(i);
    return () => ro.disconnect();
  }, [resume.paper]);

  const scale = width ? Math.min(maxScale, width / page.w) : 0;
  const pages = Math.max(1, Math.ceil((height - 1) / page.h));

  return (
    <div ref={wrap} className={cn("relative w-full", className)} style={{ height: height * scale || undefined }}>
      <div
        ref={inner}
        className="absolute left-0 top-0 origin-top-left shadow-sheet transition-opacity"
        style={{ width: page.w, transform: `scale(${scale})`, opacity: scale ? 1 : 0 }}
      >
        <Sheet resume={resume} />
        {guides &&
          pages > 1 &&
          Array.from({ length: pages - 1 }, (_, i) => (
            <div key={i} className="page-guide" style={{ top: page.h * (i + 1) }} aria-hidden="true">
              <span>page {i + 2}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
