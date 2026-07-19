/**
 * Aurora — src/app/(store)/page.tsx
 *
 * Landing / home page (server component). Fetches all landing section data
 * on the server and passes it as initialData to LandingClient, avoiding
 * an extra client-side fetch waterfall. The server call to getLandingData()
 * coalesces categories, featured products, lookbook slides, editorial content,
 * and testimonials into a single payload.
 *
 * Why server-fetch here: the landing page is the highest-traffic route;
 * server-rendering the data reduces Time-to-First-Byte (TTFB) and ensures
 * content is immediately available before React hydrates.
 */

import type { Metadata } from "next";
import LandingClient from "@/components/landing/LandingClient";
import { getLandingData } from "@/app/api/landing/route";

export const metadata: Metadata = {
  title: "SS 2026 Collection",
  description:
    "Singular pieces for the considered wardrobe. Designed in solitude. Worn with intention. Explore the Aurora SS 2026 collection of hand-selected essentials.",
  openGraph: {
    title: "Aurora — SS 2026 Collection",
    description:
      "Singular pieces for the considered wardrobe. Designed in solitude. Worn with intention.",
  },
};

/** Home/landing page composing all landing sections. */
export default async function HomePage() {
  // Server-fetch landing data to hydrate the client component immediately.
  const landingData = await getLandingData();
  return <LandingClient initialData={landingData} />;
}
