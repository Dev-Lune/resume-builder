import { HeroTitle, Kicker, CtaRow, SheetCard, TrustLine } from "./visuals";
import { HERO } from "./copy";

/** E. The banner: a dark card with the promise and the resume inside it. */
export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-5 md:px-6 lg:pt-8">
      <div className="rise relative overflow-hidden rounded-[28px] bg-banner px-5 py-12 sm:px-6 text-banner-ink md:px-12 md:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-24 size-80 rounded-full bg-accent opacity-25 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-10 size-96 rounded-full bg-ok opacity-20 blur-3xl" />
        <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Kicker onDark />
            <HeroTitle className="mt-6 text-banner-ink" size="lg" />
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-banner-ink/75">{HERO.sub}</p>
            <CtaRow onDark className="mt-8" />
            <TrustLine onDark className="mt-5" />
          </div>
          <div className="mx-auto w-[min(380px,80vw)] rotate-[-2deg] transition-transform duration-300 ease-out hover:rotate-0">
            <SheetCard glow={false} chips={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
