import type { Metadata } from "next";
import StoryPageClient from "@/components/story/StoryPageClient";

export const metadata: Metadata = {
  title: "Our Story | Aurora",
  description: "Learn about the philosophy, atelier, and conscious craftsmanship behind Aurora's clothing.",
};

export default function StoryPage() {
  return <StoryPageClient />;
}

