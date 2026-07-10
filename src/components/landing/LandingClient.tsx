/**
 * Aurora — src/components/landing/LandingClient.tsx
 *
 * Page-level client container for the landing page. Fetches all data and
 * resolves business logic, then renders each section with props only.
 * Below-fold sections are code-split via next/dynamic to reduce the
 * initial client JS bundle.
 */
"use client";

import dynamic from "next/dynamic";
import { useHeroQuery, useEditorialQuery, useDailyCategoriesQuery, useLookbookQuery } from "@/hooks/queries";
import { useNewsletterSubmit } from "@/hooks/useNewsletterSubmit";
import { Hero } from "./Hero";

const MarqueeBar = dynamic(() => import("./MarqueeBar").then((m) => m.MarqueeBar), { loading: () => <div className="h-16" /> });
const FeaturedCollection = dynamic(() => import("./FeaturedCollection").then((m) => m.FeaturedCollection), { loading: () => <div className="h-96" /> });
const Craftsmanship = dynamic(() => import("./Craftsmanship").then((m) => m.Craftsmanship), { loading: () => <div className="h-80" /> });
const LookbookSlider = dynamic(() => import("./LookbookSlider").then((m) => m.LookbookSlider), { loading: () => <div className="h-[60vh]" /> });
const DesignerStory = dynamic(() => import("./DesignerStory").then((m) => m.DesignerStory), { loading: () => <div className="h-[50vh]" /> });
const Testimonials = dynamic(() => import("./Testimonials").then((m) => m.Testimonials), { loading: () => <div className="h-80" /> });
const Newsletter = dynamic(() => import("./Newsletter").then((m) => m.Newsletter), { loading: () => <div className="h-96" /> });

export default function LandingClient() {
  const { data: heroSlides = [] } = useHeroQuery();
  const { data: dailyCategories = [] } = useDailyCategoriesQuery();
  const { data: dbSlides = [] } = useLookbookQuery();
  const { data: editorialItems = [] } = useEditorialQuery();
  const newsletter = useNewsletterSubmit();

  const slides = dbSlides.slice(0, 6);
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
