/**
 * Aurora — src/components/story/StoryPageClient.tsx
 *
 * Story page client component composing all story sub-sections into a single page layout.
 */

"use client";

import { StoryHero } from "@/components/story/StoryHero";
import { PhilosophySection } from "@/components/story/PhilosophySection";
import { ParallaxBreakout } from "@/components/story/ParallaxBreakout";
import { AtelierSection } from "@/components/story/AtelierSection";
import { StoryCta } from "@/components/story/StoryCta";

/** Story page layout composing hero, philosophy, parallax, atelier, and CTA sections. */
export default function StoryPageClient() {
  return (
    <main id="main-content" tabIndex={-1}>
      <StoryHero />
      <PhilosophySection />
      <ParallaxBreakout />
      <AtelierSection />
      <StoryCta />
    </main>
  );
}
