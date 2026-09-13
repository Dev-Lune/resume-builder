import { cn } from "@/lib/cn";

/** A circular score gauge. Track plus an accent arc; the number sits in the middle. */
export function ScoreRing({
  value,
  max = 100,
  size = 132,
  stroke = 10,
  label,
  sublabel,
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}) {
  const v = Math.max(0, Math.min(max, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = (v / max) * c;
  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="meter"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label ?? "Score"}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--raised)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
          style={{ transition: "stroke-dasharray 800ms var(--ease-out-quart)" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-[2.4rem] leading-none tabular text-ink">{Math.round(v)}</div>
        {sublabel && <div className="mt-1 text-[11px] uppercase tracking-wider text-sub">{sublabel}</div>}
      </div>
    </div>
  );
}
