"use client";

import { useSyncExternalStore } from "react";
import { Moon, MonitorCog, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { themeStore, type Mode } from "./theme";

const NEXT: Record<Mode, Mode> = { system: "light", light: "dark", dark: "system" };
const ICON: Record<Mode, typeof Sun> = { system: MonitorCog, light: Sun, dark: Moon };
const LABEL: Record<Mode, string> = { system: "System theme", light: "Light theme", dark: "Dark theme" };

export function ThemeToggle({ className }: { className?: string }) {
  const mode = useSyncExternalStore(themeStore.subscribe, themeStore.mode, () => "system" as Mode);
  const Icon = ICON[mode];
  return (
    <button
      type="button"
      onClick={() => themeStore.set(NEXT[mode])}
      aria-label={`${LABEL[mode]}. Switch to ${LABEL[NEXT[mode]].toLowerCase()}.`}
      title={LABEL[mode]}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full text-ink-dim transition-colors hover:bg-raised hover:text-ink",
        className,
      )}
    >
      <Icon className="size-4" strokeWidth={1.5} />
    </button>
  );
}
