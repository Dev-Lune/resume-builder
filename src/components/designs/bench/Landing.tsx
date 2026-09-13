import { ScrollStory } from "@/components/designs/story/ScrollStory";
import { Footer } from "@/components/landing/Footer";
import { Nav } from "@/components/landing/Nav";

/** Bench (dark) landing: editorial nav + footer around the shared scroll story. */
export function BenchLanding() {
  return (
    <>
      <Nav />
      <ScrollStory />
      <Footer />
    </>
  );
}
