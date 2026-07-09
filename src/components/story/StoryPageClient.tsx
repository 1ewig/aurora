/**
 * Aurora — src/components/story/StoryPageClient.tsx
 *
 * Story page client component composing all story sub-sections into a single page layout.
 */

"use client";

import { useEditorialQuery } from "@/hooks/queries";
import { StoryHero } from "@/components/story/StoryHero";
import { PhilosophySection } from "@/components/story/PhilosophySection";
import { AtelierSection } from "@/components/story/AtelierSection";
import { StoryCta } from "@/components/story/StoryCta";

/** Story page layout composing hero, philosophy, atelier, and CTA sections. */
export default function StoryPageClient() {
  const { data: editorialItems = [] } = useEditorialQuery();

  const designerContent = editorialItems.find((item) => item.id === "designer");
  const loomContent = editorialItems.find((item) => item.id === "loom");
  const foldingContent = editorialItems.find((item) => item.id === "folding");

  return (
    <main id="main-content" tabIndex={-1}>
      <StoryHero />
      <PhilosophySection content={designerContent} />
      <AtelierSection loomContent={loomContent} foldingContent={foldingContent} />
      <StoryCta />
    </main>
  );
}
