/**
 * Aurora — src/app/(store)/story/page.tsx
 *
 * Brand story / about page.
 */

import type { Metadata } from "next";
import StoryPageClient from "@/components/story/StoryPageClient";

/** Metadata for the story page. */
export const metadata: Metadata = {
  title: "Our Story",
  description: "Learn about the philosophy, atelier, and conscious craftsmanship behind Aurora's clothing.",
  openGraph: {
    title: "Our Story | Aurora",
    description: "Learn about the philosophy, atelier, and conscious craftsmanship behind Aurora's clothing.",
    type: "website",
    url: "https://aurora-nu-three.vercel.app/story",
  },
  twitter: {
    card: "summary",
    title: "Our Story | Aurora",
    description: "Learn about the philosophy, atelier, and conscious craftsmanship behind Aurora's clothing.",
  },
};

/** Brand story page. */
export default function StoryPage() {
  return <StoryPageClient />;
}

