"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/useGsapStory";
import { BuildAct } from "./BuildAct";
import { ClosingAct } from "./ClosingAct";
import { CompareAct } from "./CompareAct";
import { FitAct } from "./FitAct";
import { HeroAct } from "./HeroAct";
import { ProgressRail } from "./ProgressRail";
import { StoryBackdrop } from "./StoryBackdrop";
import { TemplatesAct } from "./TemplatesAct";
import { ToolsAct } from "./ToolsAct";
import { WhyUsAct } from "./WhyUsAct";

/**
 * The shared scroll-driven landing body, theme-token-driven so Cloud (light) and
 * Bench (dark) render the same acts. Nav and Footer are supplied per theme.
 */
export function ScrollStory() {
  // The live sheet and display fonts settle their height after first paint, which
  // moves every pin's start/end. Refresh once they're done so pins line up.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    const t = setTimeout(refresh, 500);
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);
    return () => {
      clearTimeout(t);
      window.removeEventListener("load", refresh);
    };
  }, []);

  return (
    <>
      <StoryBackdrop />
      <ProgressRail />
      <main id="main" className="relative z-[1]">
        <HeroAct />
        <BuildAct />
        <ToolsAct />
        <TemplatesAct />
        <FitAct />
        <WhyUsAct />
        <CompareAct />
        <ClosingAct />
      </main>
    </>
  );
}
