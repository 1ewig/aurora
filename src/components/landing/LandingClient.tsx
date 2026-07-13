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
import { useMemo } from "react";
import { useProductsQuery, useEditorialQuery, useDailyCategoriesQuery, useLookbookQuery, useMaterialsQuery } from "@/hooks/queries";
import { useNewsletterSubmit } from "@/hooks/useNewsletterSubmit";
import type { Product } from "@/data/products";
import { Hero } from "./Hero";

const SignaturePieces = dynamic(() => import("./SignaturePieces").then((m) => m.SignaturePieces), { loading: () => <div className="h-96" /> });
const FeaturedCollection = dynamic(() => import("./FeaturedCollection").then((m) => m.FeaturedCollection), { loading: () => <div className="h-96" /> });
const MaterialIndex = dynamic(() => import("./MaterialIndex").then((m) => m.MaterialIndex), { loading: () => <div className="h-[50vh]" /> });
const LookbookSlider = dynamic(() => import("./LookbookSlider").then((m) => m.LookbookSlider), { loading: () => <div className="h-[60vh]" /> });
const DesignerStory = dynamic(() => import("./DesignerStory").then((m) => m.DesignerStory), { loading: () => <div className="h-[50vh]" /> });
const PressClientNotes = dynamic(() => import("./PressClientNotes").then((m) => m.PressClientNotes), { loading: () => <div className="h-80" /> });
const Newsletter = dynamic(() => import("./Newsletter").then((m) => m.Newsletter), { loading: () => <div className="h-96" /> });

export default function LandingClient() {
  const { data: allProducts = [] } = useProductsQuery();
  const { data: dailyCategories = [] } = useDailyCategoriesQuery();
  const { data: dbSlides = [] } = useLookbookQuery();
  const { data: editorialItems = [] } = useEditorialQuery();
  const { data: materials = [] } = useMaterialsQuery();
  const newsletter = useNewsletterSubmit();

  const heroProducts = useMemo(() => {
    if (!allProducts.length) return [];
    const len = allProducts.length;
    const day = new Date().getDate();
    const selected: Product[] = [];
    for (let i = 0; i < Math.min(5, len); i++) {
      const index = (day + i * 3) % len;
      selected.push(allProducts[index]);
    }
    return selected;
  }, [allProducts]);

  const signatureProducts = useMemo(() => {
    if (!allProducts.length) return [];
    const len = allProducts.length;
    const day = new Date().getDate();
    const selected: Product[] = [];
    for (let i = 0; i < Math.min(3, len); i++) {
      const index = (day + 7 + i * 5) % len;
      selected.push(allProducts[index]);
    }
    return selected;
  }, [allProducts]);

  const slides = dbSlides.slice(0, 6);
  const designerImage = editorialItems.find((item) => item.id === "designer")?.imageUrl;

  return (
    <main id="main-content" tabIndex={-1}>
      <Hero products={heroProducts} />
      <SignaturePieces products={signatureProducts} />
      <FeaturedCollection categories={dailyCategories} />
      <MaterialIndex materials={materials} />
      {slides.length > 0 && <LookbookSlider slides={slides} />}
      <DesignerStory imageUrl={designerImage} />
      <PressClientNotes />
      <Newsletter {...newsletter} />
    </main>
  );
}
