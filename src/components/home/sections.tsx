"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ClipboardCopy,
  Cloud,
  FileDown,
  Gauge,
  HardDrive,
  KeyRound,
  LayoutTemplate,
  Laptop,
  Lock,
  Menu,
  MessageSquareText,
  Minus,
  PanelsTopLeft,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  type LucideIcon,
} from "lucide-react";
import { ScaledSheet } from "@/components/resume/ScaledSheet";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { buttonClass } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { fitLabel } from "@/lib/ats";
import { cn } from "@/lib/cn";
import { TEMPLATES } from "@/lib/content";
import { SAMPLE_RESUME } from "@/lib/sample";
import { ANY_AI, COMPARE, FAQ, FEATURES, FINAL, HERO, PRIVACY, STEPS, WORKS_WITH } from "./copy";
import { Reveal } from "./Reveal";
import { CtaRow, FitRing, SAMPLE_FIT } from "./visuals";

/* ── Shared bits ── */

function SectionHead({ kicker, title, sub, center = true }: { kicker?: string; title: string; sub?: string; center?: boolean }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {kicker && <p className="text-[14px] font-semibold text-accent">{kicker}</p>}
      <h2 className="mt-2 font-display text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1]">{title}</h2>
      {sub && <p className="mt-4 text-lg leading-relaxed text-ink-dim">{sub}</p>}
    </div>
  );
}

function IconTile({ Icon, tone = "accent" }: { Icon: LucideIcon; tone?: "accent" | "ok" }) {
  return (
    <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", tone === "ok" ? "bg-ok-soft text-ok" : "bg-accent-soft text-accent")}>
      <Icon className="size-5" strokeWidth={1.75} />
    </span>
  );
}

const cardClass = "rounded-[20px] border border-line bg-surface shadow-card";
const liftClass = "transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-float";

/* ── Nav ── */

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#ai", label: "Any AI" },
  { href: "#faq", label: "FAQ" },
];

const GLASS: React.CSSProperties = {
  background: "color-mix(in srgb, var(--surface) 72%, transparent)",
  backdropFilter: "blur(28px) saturate(170%)",
  WebkitBackdropFilter: "blur(28px) saturate(170%)",
};

export function Nav() {
  const [open, setOpen] = useState(false);

  // Close on Escape, and when the window grows past the breakpoint that shows the links.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="sticky top-3 z-40 mt-3 px-3">
      <div className="relative mx-auto max-w-6xl">
        <header className="flex h-14 items-center justify-between gap-2 rounded-2xl border border-line pl-4 pr-2 shadow-card sm:pl-5" style={GLASS}>
          <Wordmark />
          <nav aria-label="Sections" className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-[14px] text-ink-dim transition-colors hover:bg-raised hover:text-ink">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/resumes" className={cn(buttonClass("ghost", "sm"), "hidden lg:inline-flex")}>
              My resumes
            </Link>
            <Link href={HERO.primary.href} className={cn(buttonClass("primary", "sm"), "rounded-lg")}>
              <span className="sm:hidden">Start</span>
              <span className="hidden sm:inline">{HERO.primary.label}</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-9 place-items-center rounded-lg text-ink-dim transition-colors hover:bg-raised hover:text-ink lg:hidden"
            >
              {open ? <X className="size-5" strokeWidth={1.75} /> : <Menu className="size-5" strokeWidth={1.75} />}
            </button>
          </div>
        </header>

        {open && (
          <>
            {/* Scrim and panel are siblings so the panel's blur samples the page, not the scrim. */}
            <div aria-hidden="true" onClick={close} className="manual-scrim fixed inset-0 -z-10" style={{ background: "color-mix(in srgb, var(--bg) 45%, transparent)" }} />
            <nav id="site-menu" aria-label="Menu" className="menu-in absolute inset-x-0 top-[calc(100%+8px)] rounded-2xl border border-line p-2 shadow-float lg:hidden" style={GLASS}>
              <ul className="flex flex-col">
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} onClick={close} className="flex min-h-12 items-center rounded-xl px-4 text-[16px] font-medium text-ink transition-colors hover:bg-raised">
                      {l.label}
                    </a>
                  </li>
                ))}
                <li className="my-1 border-t border-line" aria-hidden="true" />
                {[
                  { href: "/resumes", label: "My resumes" },
                  { href: "/scan", label: "ATS scan" },
                  { href: "/applications", label: "Applications" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={close} className="flex min-h-12 items-center rounded-xl px-4 text-[16px] text-ink-dim transition-colors hover:bg-raised hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={HERO.primary.href} onClick={close} className={cn(buttonClass("primary", "lg"), "mt-2 w-full rounded-xl")}>
                {HERO.primary.label}
              </Link>
            </nav>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Works with ── */

export function WorksWith() {
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6">
      <Reveal>
        <p className="text-center text-[14px] font-medium text-sub">Works with the AI you already use, or none at all</p>
        <ul className="mt-5 flex flex-wrap justify-center gap-2.5">
          {WORKS_WITH.map((n) => (
            <li key={n} className="rounded-full border border-line bg-surface px-4 py-2 text-[14px] font-semibold text-ink-dim shadow-card">
              {n}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

/* ── How it works ── */

const STEP_ICONS: LucideIcon[] = [Target, MessageSquareText, FileDown];

export function Steps() {
  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:px-6">
      <Reveal>
        <SectionHead kicker="How it works" title="Three steps. About twelve minutes." />
      </Reveal>
      <ol className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <Reveal delay={i * 90} className="h-full">
              <div className={cn(cardClass, liftClass, "relative h-full p-6")}>
                <span className="absolute -top-3 left-6 grid size-7 place-items-center rounded-full bg-accent text-[13px] font-bold text-accent-ink shadow-card">{i + 1}</span>
                <IconTile Icon={STEP_ICONS[i]} />
                <h3 className="mt-5 text-[19px] font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">{s.body}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ── Features ── */

const FEATURE_ICONS: Record<(typeof FEATURES)[number]["key"], LucideIcon> = {
  interview: MessageSquareText,
  preview: PanelsTopLeft,
  tailor: Target,
  score: Gauge,
  templates: LayoutTemplate,
  export: FileDown,
};

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24 md:px-6">
      <Reveal>
        <SectionHead kicker="Features" title="Everything you need to apply with confidence" />
      </Reveal>
      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.key} delay={(i % 3) * 80} className="h-full">
            <div className={cn(cardClass, liftClass, "h-full p-6")}>
              <IconTile Icon={FEATURE_ICONS[f.key]} />
              <h3 className="mt-5 text-[18px] font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">{f.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── Showcase: switch templates, read the score ── */

export function Showcase() {
  const [idx, setIdx] = useState(0);
  const tpl = TEMPLATES[idx];
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24 md:px-6">
      <Reveal>
        <div className={cn(cardClass, "grid grid-cols-1 gap-10 overflow-hidden p-6 md:p-10 lg:grid-cols-[0.95fr_1.05fr]")}>
          <div className="flex flex-col">
            <p className="text-[14px] font-semibold text-accent">Templates and score</p>
            <h2 className="mt-2 font-display text-[clamp(1.8rem,3.6vw,2.5rem)] leading-[1.1]">Pick a look. Keep every word.</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-ink-dim">Switch templates any time and nothing needs retyping. The score checks what hiring software checks and points to each fix.</p>

            <div className="mt-6 flex flex-wrap gap-2" role="radiogroup" aria-label="Template">
              {TEMPLATES.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={i === idx}
                  onClick={() => setIdx(i)}
                  className={cn(
                    "min-h-10 rounded-full border px-4 text-[14px] font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97]",
                    i === idx ? "border-accent bg-accent text-accent-ink" : "border-border bg-surface text-ink-dim hover:border-accent hover:text-ink",
                  )}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <p key={tpl.id} className="swap-in mt-3 min-h-[3em] text-[14px] leading-relaxed text-sub">
              {tpl.line}
            </p>

            <div className="mt-auto rounded-2xl bg-raised p-5">
              <div className="flex items-center gap-4">
                <FitRing score={SAMPLE_FIT.score} size={60} stroke={6} />
                <div>
                  <p className="text-[16px] font-semibold text-ink">ATS score {SAMPLE_FIT.score} of 100</p>
                  <p className="text-[14px] text-sub">{fitLabel(SAMPLE_FIT.score)} for this sample</p>
                </div>
              </div>
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SAMPLE_FIT.checks.slice(0, 6).map((c) => (
                  <li key={c.id} className="flex items-center gap-2 text-[13.5px] text-ink-dim">
                    {c.ok ? <Check className="size-4 shrink-0 text-ok" strokeWidth={2.5} /> : <Minus className="size-4 shrink-0 text-dim" strokeWidth={2.5} />}
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative flex items-start justify-center rounded-2xl bg-canvas p-4 md:p-6">
            <div key={tpl.id} className="swap-in w-full max-w-[460px] overflow-hidden rounded-xl shadow-sheet">
              <ScaledSheet resume={{ ...SAMPLE_RESUME, template: tpl.id }} guides={false} />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ── Any AI, or none ── */

const AI_ICONS: LucideIcon[] = [Laptop, Cloud, KeyRound, ClipboardCopy];

export function AnyAi() {
  return (
    <section id="ai" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24 md:px-6">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <SectionHead kicker="Your AI, your choice" title={ANY_AI.title} sub={ANY_AI.sub} center={false} />
          <ul className="mt-8 flex flex-col gap-3">
            {ANY_AI.options.map((o, i) => (
              <li key={o.name} className={cn(cardClass, "flex items-start gap-4 p-4")}>
                <IconTile Icon={AI_ICONS[i]} tone={i === 3 ? "ok" : "accent"} />
                <span>
                  <span className="block text-[16px] font-semibold text-ink">{o.name}</span>
                  <span className="mt-0.5 block text-[14.5px] leading-relaxed text-ink-dim">{o.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          {/* A picture of Manual mode: two steps, one copy and one paste. */}
          <div className={cn(cardClass, "p-5 md:p-7")} aria-hidden="true">
            <p className="text-[13px] font-semibold text-sub">No key? It takes two steps.</p>
            <div className="mt-4 rounded-2xl border border-line bg-raised p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-ok text-white">
                  <Check className="size-4" strokeWidth={2.5} />
                </span>
                <span className="text-[15px] font-semibold text-ink">Copy the prompt</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 pl-10">
                <span className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-ink">
                  <ClipboardCopy className="size-4" strokeWidth={1.75} /> Copied
                </span>
                {["ChatGPT", "Claude", "Gemini"].map((n) => (
                  <span key={n} className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-3 text-[13px] font-medium text-ink">
                    {n}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-accent-line bg-accent-soft p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-accent text-[13px] font-semibold text-accent-ink">2</span>
                <span className="text-[15px] font-semibold text-ink">Paste the whole reply</span>
              </div>
              <div className="ml-10 mt-3 rounded-xl border border-ok bg-surface px-3 py-2.5 font-mono text-[12px] leading-relaxed text-sub">
                {'{ "basics": { "name": "Priya Nair", "headline": "Senior Frontend..." }'}
              </div>
              <p className="ml-10 mt-2 flex items-center gap-1.5 text-[13px] font-medium text-ok">
                <Sparkles className="size-3.5" strokeWidth={2} /> Looks right. Building your resume.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Compare ── */

export function Compare() {
  return (
    <section className="mx-auto max-w-4xl px-5 pb-24 md:px-6">
      <Reveal>
        <SectionHead kicker="Compared" title="How it stacks up" sub="The same job, without the account, the paywall or the guesswork." />
        <div className={cn(cardClass, "mt-12 overflow-x-auto")}>
          <table className="w-full text-left text-[13.5px] sm:text-[15px]">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="px-3 py-3.5 sm:px-5 sm:py-4 font-medium text-sub">
                  <span className="sr-only">Feature</span>
                </th>
                <th scope="col" className="bg-accent-soft px-3 py-3.5 sm:px-5 sm:py-4 font-display text-[17px] text-ink">
                  Bespoke
                </th>
                <th scope="col" className="px-3 py-3.5 sm:px-5 sm:py-4 font-medium text-sub">
                  Typical sites
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r, i) => (
                <tr key={r.label} className={cn(i < COMPARE.length - 1 && "border-b border-line")}>
                  <th scope="row" className="px-3 py-3.5 sm:px-5 sm:py-4 font-medium text-ink-dim">
                    {r.label}
                  </th>
                  <td className="bg-accent-soft px-3 py-3.5 sm:px-5 sm:py-4 font-semibold text-ink">
                    <span className="flex items-center gap-2">
                      <Check className="size-4 shrink-0 text-ok" strokeWidth={2.5} /> {r.us}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 sm:px-5 sm:py-4 text-sub">{r.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </section>
  );
}

/* ── Privacy ── */

const PRIVACY_ICONS: LucideIcon[] = [Lock, HardDrive, Send];

export function Privacy() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24 md:px-6">
      <Reveal>
        <SectionHead kicker="Private by default" title="Your resume stays yours" />
      </Reveal>
      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {PRIVACY.map((p, i) => (
          <Reveal key={p.title} delay={i * 90} className="h-full">
            <div className={cn(cardClass, "h-full p-6")}>
              <IconTile Icon={PRIVACY_ICONS[i]} tone="ok" />
              <h3 className="mt-5 text-[18px] font-semibold text-ink">{p.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── FAQ: accordion rows in one card; height eases open. ── */

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-5 pb-24 md:px-6">
      <Reveal>
        <SectionHead kicker="Questions" title="Good to know" />
        <div className={cn(cardClass, "mt-12 divide-y divide-line")}>
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            const id = `faq-${i}`;
            return (
              <div key={f.q}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={id}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-[16px] font-semibold text-ink transition-colors hover:text-accent md:px-6"
                  >
                    {f.q}
                    <ChevronDown className={cn("size-5 shrink-0 text-sub transition-transform duration-200 ease-out", isOpen && "rotate-180")} strokeWidth={2} />
                  </button>
                </h3>
                <div id={id} role="region" className={cn("grid transition-[grid-template-rows] duration-300 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-[15px] leading-relaxed text-ink-dim md:px-6">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

/* ── Final call ── */

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-[28px] bg-banner px-6 py-14 text-center text-banner-ink md:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-20 size-72 rounded-full bg-accent opacity-25 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-10 size-80 rounded-full bg-ok opacity-20 blur-3xl" />
          <div className="relative">
            <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(2rem,4.6vw,3.3rem)] leading-[1.08]">{FINAL.title}</h2>
            <p className="mx-auto mt-4 max-w-[44ch] text-lg text-banner-ink/75">{FINAL.sub}</p>
            <CtaRow onDark center className="mt-8" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ── Footer ── */

export function Footer() {
  const year = 2026;
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-12 md:grid-cols-4 md:px-6">
        <div className="col-span-2 md:col-span-1">
          <Wordmark />
          <p className="mt-3 max-w-[30ch] text-[14px] leading-relaxed text-sub">A free, open-source AI resume builder. No account, no paywall.</p>
        </div>
        <FooterCol
          title="Build"
          links={[
            { href: "/new", label: "New resume" },
            { href: "/new?mode=import", label: "Import a resume" },
            { href: "/resumes", label: "My resumes" },
          ]}
        />
        <FooterCol
          title="Tools"
          links={[
            { href: "/scan", label: "ATS scan" },
            { href: "/scan/bulk", label: "Bulk scan" },
            { href: "/applications", label: "Applications" },
          ]}
        />
        <FooterCol
          title="About"
          links={[
            { href: "https://github.com/Dev-Lune/resume-builder", label: "Source code", external: true },
            { href: "https://devlune.in/privacy", label: "Privacy", external: true },
            { href: "https://devlune.in/terms", label: "Terms", external: true },
            { href: "https://devlune.in/data-deletion", label: "Data policy", external: true },
          ]}
        />
      </div>
      <div className="border-t border-line">
        <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-5 text-[13px] text-sub md:px-6">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-ok" strokeWidth={1.75} /> Open source under MIT. {year}.
          </span>
          <span>
            Built by{" "}
            <a href="https://devlune.in" target="_blank" rel="noreferrer" className="font-medium text-ink-dim hover:text-ink">
              DevLune
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string; external?: boolean }[] }) {
  return (
    <div>
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.label}>
            {l.external ? (
              <a href={l.href} target="_blank" rel="noreferrer" className="text-[14px] text-sub transition-colors hover:text-ink">
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="text-[14px] text-sub transition-colors hover:text-ink">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
