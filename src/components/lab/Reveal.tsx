"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/** True once the window has scrolled past `threshold`. For blend-to-glass headers. */
export function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [threshold]);
  return scrolled;
}

/**
 * Floats its children up as they scroll into view. One observer per element,
 * disconnected after it fires. Respects prefers-reduced-motion (renders shown).
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className,
  ...rest
}: {
  children: React.ReactNode;
  as?: React.ElementType;
  delay?: number;
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      // No observer or reduced motion: show immediately, no animation.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} data-shown={shown} style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties} className={cn("reveal", className)} {...rest}>
      {children}
    </Tag>
  );
}
