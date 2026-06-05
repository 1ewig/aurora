import { Hero } from "@/components/landing/Hero";
import { MarqueeBar } from "@/components/landing/MarqueeBar";
import { FeaturedCollection } from "@/components/landing/FeaturedCollection";
import { LookbookSlider } from "@/components/landing/LookbookSlider";
import { DesignerStory } from "@/components/landing/DesignerStory";
import { Testimonials } from "@/components/landing/Testimonials";
import { Newsletter } from "@/components/landing/Newsletter";

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Hero />
      <MarqueeBar />
      <FeaturedCollection />
      <LookbookSlider />
      <DesignerStory />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
