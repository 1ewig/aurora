/**
 * Aurora — src/components/landing/LandingClient.tsx
 *
 * Page-level client container for the landing page. Fetches all data and
 * resolves business logic, then renders each section with props only.
 */
"use client";

import { useHeroQuery, useEditorialQuery, useDailyCategoriesQuery, useLookbookQuery } from "@/hooks/queries";
import { useNewsletterSubmit } from "@/hooks/useNewsletterSubmit";
import { Hero } from "./Hero";
import { MarqueeBar } from "./MarqueeBar";
import { FeaturedCollection } from "./FeaturedCollection";
import { LookbookSlider } from "./LookbookSlider";
import { DesignerStory } from "./DesignerStory";
import { Testimonials } from "./Testimonials";
import { Newsletter } from "./Newsletter";
import { Craftsmanship } from "./Craftsmanship";

export default function LandingClient() {
  const { data: heroSlides = [] } = useHeroQuery();
  const { data: dailyCategories = [] } = useDailyCategoriesQuery();
  const { data: dbSlides = [] } = useLookbookQuery();
  const { data: editorialItems = [] } = useEditorialQuery();
  const newsletter = useNewsletterSubmit();

  const slides = dbSlides.slice(0, 5);
  const designerImage = editorialItems.find((item) => item.id === "designer")?.imageUrl;

  return (
    <main id="main-content" tabIndex={-1}>
      <Hero heroSlides={heroSlides} />
      <MarqueeBar />
      <FeaturedCollection categories={dailyCategories} />
      <Craftsmanship />
      {slides.length > 0 && <LookbookSlider slides={slides} />}
      <DesignerStory imageUrl={designerImage} />
      <Testimonials />
      <Newsletter {...newsletter} />
    </main>
  );
}
