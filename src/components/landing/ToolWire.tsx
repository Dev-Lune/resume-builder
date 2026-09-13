import Link from "next/link";
import { ArrowUpRight, FileUp, ListChecks, PenLine, ScanSearch, type LucideIcon } from "lucide-react";
import { ScaledSheet } from "@/components/resume/ScaledSheet";
import { SAMPLE_RESUME } from "@/lib/sample";

/**
 * "Four tools, one sheet." A patch panel: four tools on the left, each a real
 * link, with energy travelling the cable to the single resume on the right.
 * Cables are one SVG strip (viewBox 0..100, non-scaling strokes); the light is a
 * tapered comet of dashes on a pathLength-100 path. Adapted from DevLune's wire.
 */

type Tool = { id: string; label: string; line: string; href: string; Icon: LucideIcon };

const TOOLS: Tool[] = [
  { id: "interview", label: "Interview draft", href: "/new", line: "Answer a short interview; get a first draft written for the role.", Icon: PenLine },
  { id: "import", label: "Import and edit", href: "/new?mode=import", line: "Bring a PDF or DOCX; it is restructured, then yours to edit.", Icon: FileUp },
  { id: "scan", label: "Scan and tailor", href: "/scan", line: "Match against a posting, see the gaps, apply the rewrite.", Icon: ScanSearch },
  { id: "track", label: "Track applications", href: "/applications", line: "Every job you are chasing, the version you sent, its score.", Icon: ListChecks },
];

// Row centres for four equal rows, as viewBox-y percentages.
const YS = [12.5, 37.5, 62.5, 87.5];
const cable = (y: number) => `M0,${y} C45,${y} 45,50 90,50`;

const COMET_LAYERS = [
  { dash: "16 84", width: 5, opacity: 0.1, lag: 0.14, glow: 0 },
  { dash: "10 90", width: 3, opacity: 0.3, lag: 0.08, glow: 0 },
  { dash: "5 95", width: 2, opacity: 0.9, lag: 0.03, glow: 6 },
  { dash: "2 98", width: 1.4, opacity: 1, lag: 0, glow: 10 },
];

function Cable({ y, delay }: { y: number; delay: number }) {
  const d = cable(y);
  return (
    <g>
      <path className="wire-base" d={d} stroke="var(--accent)" strokeWidth="1" opacity="0.22" vectorEffect="non-scaling-stroke" />
      {COMET_LAYERS.map((l, i) => (
        <path
          key={i}
          className="wire-comet"
          d={d}
          pathLength={100}
          vectorEffect="non-scaling-stroke"
          stroke="var(--accent)"
          strokeWidth={l.width}
          strokeDasharray={l.dash}
          opacity={l.opacity}
          style={{ animationDelay: `${delay - l.lag}s`, filter: l.glow ? `drop-shadow(0 0 ${l.glow}px var(--accent))` : undefined }}
        />
      ))}
    </g>
  );
}

function Jack({ Icon }: { Icon: LucideIcon }) {
  return (
    <span
      aria-hidden="true"
      className="wire-node grid size-11 shrink-0 place-items-center rounded-full border border-accent-line bg-surface"
      style={{ boxShadow: "0 0 14px var(--accent-soft)" }}
    >
      <Icon className="size-[18px] text-accent" strokeWidth={1.75} />
    </span>
  );
}

export function ToolWire() {
  return (
    <section id="tools" className="mx-auto max-w-6xl px-5 py-24 hairline-t md:px-8 md:py-32">
      <div className="max-w-2xl">
        <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.01em]">Four tools, one sheet.</h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-dim">
          Everything feeds the same resume, kept in your browser. Each tool is one click from here.
        </p>
      </div>

      {/* Desktop: the patch panel */}
      <div className="mt-14 hidden h-[360px] grid-cols-[minmax(0,1fr)_130px_minmax(0,300px)] items-stretch gap-0 lg:grid">
        <ul className="flex flex-col justify-between py-1">
          {TOOLS.map((t) => (
            <li key={t.id} className="wire-row">
              <Link
                href={t.href}
                className="group flex items-center gap-4 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-surface"
              >
                <Jack Icon={t.Icon} />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 font-display text-xl">
                    {t.label}
                    <ArrowUpRight className="size-4 text-sub opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.75} />
                  </span>
                  <span className="mt-0.5 block max-w-[42ch] text-[14px] leading-relaxed text-ink-dim">{t.line}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="relative" aria-hidden="true">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 90 100" preserveAspectRatio="none">
            {YS.map((y, i) => (
              <Cable key={y} y={y} delay={i * 0.5} />
            ))}
          </svg>
        </div>

        <div className="flex items-center">
          <Link href="/resumes" className="wire-row group block w-full" aria-label="Your resume">
            <div className="wire-node overflow-hidden rounded-xl border border-border bg-raised p-3 shadow-float">
              <div className="overflow-hidden rounded-md">
                <ScaledSheet resume={SAMPLE_RESUME} guides={false} />
              </div>
              <div className="flex items-center justify-between px-1 pt-3">
                <span className="font-display text-lg">One sheet</span>
                <span className="flex items-center gap-1 text-[13px] text-accent">
                  Open <ArrowUpRight className="size-3.5" strokeWidth={2} />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile: plain link cards */}
      <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
        {TOOLS.map((t) => (
          <li key={t.id}>
            <Link href={t.href} className="flex h-full items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent">
              <Jack Icon={t.Icon} />
              <span>
                <span className="font-display text-lg">{t.label}</span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-dim">{t.line}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
