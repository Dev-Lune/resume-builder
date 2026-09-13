import { cn } from "@/lib/cn";

/**
 * The tape measure. One ruled strip, numerals every ten, a chalk-indigo marker
 * at the current value. Used wherever the product measures something: interview
 * progress, the fit score.
 */
export function Tape({
  value,
  max = 100,
  label,
  showValue = true,
  format,
  className,
}: {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  format?: (v: number) => string;
  className?: string;
}) {
  const v = Math.max(0, Math.min(max, value));
  const pct = max === 0 ? 0 : (v / max) * 100;
  const edge = pct < 6 ? "start" : pct > 94 ? "end" : undefined;
  const nums = Array.from({ length: 11 }, (_, i) => i * 10);
  return (
    <div
      className={cn("tape", className)}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={v}
      aria-valuetext={format ? format(v) : String(v)}
    >
      <div className="tape-ticks" aria-hidden="true" />
      {nums.map((n) => (
        <span
          key={n}
          className="tape-num"
          data-minor={n % 50 !== 0 && n !== 0 && n !== 100 ? "true" : undefined}
          data-edge={n === 0 ? "start" : n === 100 ? "end" : undefined}
          style={{ left: `${n}%` }}
          aria-hidden="true"
        >
          {Math.round((n / 100) * max)}
        </span>
      ))}
      <div className="tape-marker" style={{ left: `${pct}%` }} aria-hidden="true" />
      {showValue && (
        <span className="tape-value" data-edge={edge} style={{ left: `${pct}%` }} aria-hidden="true">
          {format ? format(v) : v}
        </span>
      )}
    </div>
  );
}
