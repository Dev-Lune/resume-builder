import { Hero } from "./Hero";
import { AnyAi, Compare, Faq, Features, FinalCta, Footer, Nav, Privacy, Showcase, Steps, WorksWith } from "./sections";

/** The landing. Hero E (the banner) won the Sep 2026 lab; A-D live in hero-variants.tsx. */
export function Landing() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-canvas">
      <Nav />
      <main id="main">
        <Hero />
        <WorksWith />
        <Steps />
        <Features />
        <Showcase />
        <AnyAi />
        <Compare />
        <Privacy />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
