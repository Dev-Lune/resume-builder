"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/useGsapStory";

/** A hairline accent bar under the nav that fills with page scroll progress. */
export function ProgressRail() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    gsap.set(el, { scaleX: 0, transformOrigin: "left center" });
    const st = ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => gsap.set(el, { scaleX: self.progress }),
    });
    return () => st.kill();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[2px]" aria-hidden="true">
      <div ref={bar} className="h-full w-full bg-accent" />
    </div>
  );
}
