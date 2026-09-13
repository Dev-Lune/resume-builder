"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Runs a GSAP setup scoped to a section, once on mount, and reverts it on unmount.
 * The setup gets a `gsap.matchMedia` so each act can gate the heavy pin/scrub to
 * desktop with motion allowed; on mobile or with reduced motion it simply never
 * builds, and the DOM (authored in its final, visible state) stays as-is.
 *
 * DESKTOP query: `(min-width: 900px) and (prefers-reduced-motion: no-preference)`.
 */
export const STORY_DESKTOP = "(min-width: 900px) and (prefers-reduced-motion: no-preference)";

export function useGsapStory<T extends HTMLElement = HTMLDivElement>(setup: (mm: gsap.MatchMedia, scope: T) => void) {
  const scope = useRef<T>(null);

  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      setup(mm, el);
    }, el);
    return () => ctx.revert();
    // The landing acts are static; the mount-time setup closure is all we need.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return scope;
}

export { gsap, ScrollTrigger };
