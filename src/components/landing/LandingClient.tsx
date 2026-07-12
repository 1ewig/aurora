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

const SignaturePieces = dynamic(() => import("./SignaturePieces").then((m) => m.SignaturePieces), { loading: () => <div className="h-96" /> });
const FeaturedCollection = dynamic(() => import("./FeaturedCollection").then((m) => m.FeaturedCollection), { loading: () => <div className="h-96" /> });
const MaterialIndex = dynamic(() => import("./MaterialIndex").then((m) => m.MaterialIndex), { loading: () => <div className="h-[50vh]" /> });
const LookbookSlider = dynamic(() => import("./LookbookSlider").then((m) => m.LookbookSlider), { loading: () => <div className="h-[60vh]" /> });
const Craftsmanship = dynamic(() => import("./Craftsmanship").then((m) => m.Craftsmanship), { loading: () => <div className="h-80" /> });
const DesignerStory = dynamic(() => import("./DesignerStory").then((m) => m.DesignerStory), { loading: () => <div className="h-[50vh]" /> });
const PressClientNotes = dynamic(() => import("./PressClientNotes").then((m) => m.PressClientNotes), { loading: () => <div className="h-80" /> });
const Newsletter = dynamic(() => import("./Newsletter").then((m) => m.Newsletter), { loading: () => <div className="h-96" /> });
const ServicePromise = dynamic(() => import("./ServicePromise").then((m) => m.ServicePromise), { loading: () => <div className="h-32" /> });

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
      <SignaturePieces />
      <FeaturedCollection categories={dailyCategories} />
      <MaterialIndex />
      {slides.length > 0 && <LookbookSlider slides={slides} />}
      <Craftsmanship />
      <DesignerStory imageUrl={designerImage} />
      <PressClientNotes />
      <Newsletter {...newsletter} />
      <ServicePromise />
    </main>
  );
}
