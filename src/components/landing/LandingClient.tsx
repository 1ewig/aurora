/**
 * Aurora — src/components/landing/LandingClient.tsx
 *
 * Page-level client container for the landing page. Fetches all data and
 * resolves business logic, then renders each section with props only.
 */
"use client";

import { useProductsQuery, useFeaturedProductsQuery, useLookbookQuery } from "@/hooks/queries";
import { useNewsletterSubmit } from "@/hooks/useNewsletterSubmit";
import { Hero } from "./Hero";
import { MarqueeBar } from "./MarqueeBar";
import { FeaturedCollection } from "./FeaturedCollection";
import { LookbookSlider } from "./LookbookSlider";
import { DesignerStory } from "./DesignerStory";
import { Testimonials } from "./Testimonials";
import { Newsletter } from "./Newsletter";

const heroSlugs = [
  "ivory-wool-overcoat",
  "camel-cashmere-turtleneck",
  "ecru-linen-blazer",
  "charcoal-wide-leg-trousers",
  "champagne-silk-slip-dress",
];

export default function LandingClient() {
  const { data: products = [] } = useProductsQuery();
  const { data: featured = [] } = useFeaturedProductsQuery(3);
  const { data: dbSlides = [] } = useLookbookQuery();
  const newsletter = useNewsletterSubmit();

  const heroProducts = products.filter((p) => heroSlugs.includes(p.slug));
  const slides = dbSlides.slice(0, 5);

  return (
    <main id="main-content" tabIndex={-1}>
      <Hero heroProducts={heroProducts} />
      <MarqueeBar />
      <FeaturedCollection featured={featured} />
      {slides.length > 0 && <LookbookSlider slides={slides} />}
      <DesignerStory />
      <Testimonials />
      <Newsletter {...newsletter} />
    </main>
  );
}
