"use client";

import { StoryHero } from "@/components/story/StoryHero";
import { PhilosophySection } from "@/components/story/PhilosophySection";
import { ParallaxBreakout } from "@/components/story/ParallaxBreakout";
import { AtelierSection } from "@/components/story/AtelierSection";
import { StoryCta } from "@/components/story/StoryCta";

export default function StoryPageClient() {
  return (
    <main id="main-content" tabIndex={-1} className="pt-28 pb-32">
      <StoryHero />
      <PhilosophySection />
      <ParallaxBreakout />
      <AtelierSection />
      <StoryCta />
    </main>
  );
}
