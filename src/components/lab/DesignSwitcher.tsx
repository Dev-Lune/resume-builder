"use client";

import { useSyncExternalStore } from "react";
import { BenchLanding } from "@/components/designs/bench/Landing";
import { CloudLanding } from "@/components/designs/cloud/Landing";
import { themeStore } from "@/components/theme/theme";

/** Landing layout follows the theme: Cloud in light, Night Bench in dark. */
export function DesignSwitcher() {
  const resolved = useSyncExternalStore(themeStore.subscribe, themeStore.resolved, themeStore.serverResolved);
  return resolved === "dark" ? <BenchLanding /> : <CloudLanding />;
}
