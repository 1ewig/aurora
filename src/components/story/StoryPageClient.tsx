/**
 * Aurora — src/components/story/StoryPageClient.tsx
 *
 * Story page client component composing all story sub-sections into a single page layout.
 */

"use client";

import { useEditorialQuery, useLookbookQuery } from "@/hooks/queries";
import { StoryHero } from "@/components/story/StoryHero";
import { PhilosophySection } from "@/components/story/PhilosophySection";
import { ParallaxBreakout } from "@/components/story/ParallaxBreakout";
import { AtelierSection } from "@/components/story/AtelierSection";
import { StoryCta } from "@/components/story/StoryCta";

/** Story page layout composing hero, philosophy, parallax, atelier, and CTA sections. */
export default function StoryPageClient() {
  const { data: editorialItems = [] } = useEditorialQuery();
  const { data: dbSlides = [] } = useLookbookQuery();

  const designerContent = editorialItems.find((item) => item.id === "designer");
  const loomContent = editorialItems.find((item) => item.id === "loom");
  const foldingContent = editorialItems.find((item) => item.id === "folding");
  const slide3 = dbSlides.find((s: any) => s.slideNumber === 3);

  return (
    <main id="main-content" tabIndex={-1}>
      <StoryHero />
      <PhilosophySection content={designerContent} />
      <ParallaxBreakout slide={slide3} />
      <AtelierSection loomContent={loomContent} foldingContent={foldingContent} />
      <StoryCta />
    </main>
  );
}
