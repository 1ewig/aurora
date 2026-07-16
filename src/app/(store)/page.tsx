/**
 * Aurora — src/app/(store)/page.tsx
 *
 * Home / landing page — server component delegating to LandingClient container.
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
  const landingData = await getLandingData();
  return <LandingClient initialData={landingData} />;
}
