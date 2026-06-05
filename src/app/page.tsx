"use client";

import { HydrationWrapper } from "./hydration-wrapper";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Hero } from "@/components/sections/Hero";
import { MarqueeBar } from "@/components/sections/MarqueeBar";
import { FeaturedCollection } from "@/components/sections/FeaturedCollection";
import { LookbookSlider } from "@/components/sections/LookbookSlider";
import { DesignerStory } from "@/components/sections/DesignerStory";
import { Testimonials } from "@/components/sections/Testimonials";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { Newsletter } from "@/components/sections/Newsletter";

export default function HomePage() {
  return (
    <HydrationWrapper>
      <ScrollProgress />
      <Navbar />
      <CartDrawer />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <MarqueeBar />
        <FeaturedCollection />
        <LookbookSlider />
        <DesignerStory />
        <Testimonials />
        <ProductGrid />
        <Newsletter />
      </main>
      <Footer />
    </HydrationWrapper>
  );
}
