import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap select-none transition-[background-color,border-color,color,box-shadow,transform] duration-150 disabled:opacity-50 disabled:pointer-events-none active:translate-y-px";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:brightness-110 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
  secondary: "border border-border bg-surface text-ink hover:bg-raised",
  ghost: "text-ink-dim hover:bg-raised hover:text-ink",
  danger: "text-danger hover:bg-danger-soft",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "md", extra?: string) {
  return cn(base, variants[variant], sizes[size], extra);
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({ variant = "secondary", size = "md", loading, className, children, disabled, ...rest }: Props) {
  return (
    <button
      type="button"
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner className="size-3.5" />}
      {children}
    </button>
  );
}

/** Icon-only button. `label` is required so it always has an accessible name. */
export function IconButton({
  label,
  className,
  size = "md",
  children,
  ...rest
}: Omit<Props, "variant" | "children"> & { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sub transition-colors hover:bg-raised hover:text-ink disabled:opacity-40 disabled:pointer-events-none",
        size === "sm" ? "size-8" : "size-10",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
