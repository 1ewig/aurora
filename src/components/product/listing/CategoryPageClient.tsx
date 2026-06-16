/**
 * Aurora — src/components/product/listing/CategoryPageClient.tsx
 *
 * Resolves a URL category slug to a display name and renders ProductListing.
 */
"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/product/listing/ProductListing";

const categoryMap: Record<string, string> = {
  outerwear: "Outerwear",
  knitwear: "Knitwear",
  trousers: "Trousers",
  dresses: "Dresses",
  accessories: "Accessories",
};

interface CategoryPageClientProps {
  params: Promise<{ category: string }>;
}

/** Renders the category page by mapping the URL slug to a display name and rendering ProductListing. */
export default function CategoryPageClient({ params }: CategoryPageClientProps) {
  const { category: categorySlug } = use(params);
  const categoryName = categoryMap[categorySlug.toLowerCase()];

  if (!categoryName) {
    notFound();
  }

  return <ProductListing initialCategory={categoryName} />;
}

