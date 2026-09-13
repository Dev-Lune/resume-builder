"use client";

import { ToolWire } from "@/components/landing/ToolWire";
import { gsap, STORY_DESKTOP, useGsapStory } from "@/lib/useGsapStory";

/** Act 3 — the patch panel. Rows deal in as the section enters; the cable comet
    keeps travelling on its own (that motion already reads as energy on the wire). */
export function ToolsAct() {
  const scope = useGsapStory(() => {
    gsap.matchMedia().add(STORY_DESKTOP, () => {
      gsap.from(".wire-row", {
        opacity: 0,
        y: 26,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".wire-row", start: "top 82%" },
      });
    });
  });

  return (
    <div ref={scope}>
      <ToolWire />
    </div>
  );
}
