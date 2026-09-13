import { ClipboardType, Cpu, MonitorSmartphone, Sparkles, Waypoints, Zap } from "lucide-react";
import type { ProviderChoice } from "@/lib/aiProvider";
import { cn } from "@/lib/cn";

/** A brand-colored badge per provider. Distinct marks in each brand's hue,
    drawn from icons (not trademarked logos), tinted so they read at a glance. */
const MARK: Record<ProviderChoice, { Icon: typeof Cpu; color: string }> = {
  auto: { Icon: Sparkles, color: "var(--accent)" },
  ollama: { Icon: MonitorSmartphone, color: "var(--ink)" },
  openrouter: { Icon: Waypoints, color: "#6566f1" },
  nim: { Icon: Zap, color: "#76b900" },
  openai: { Icon: Cpu, color: "#10a37f" },
  manual: { Icon: ClipboardType, color: "var(--ink-dim)" },
};

export function ProviderIcon({ id, className }: { id: ProviderChoice; className?: string }) {
  const { Icon, color } = MARK[id];
  return (
    <span
      className={cn("grid size-7 shrink-0 place-items-center rounded-lg", className)}
      style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
      aria-hidden="true"
    >
      <Icon className="size-4" strokeWidth={1.75} />
    </span>
  );
}
