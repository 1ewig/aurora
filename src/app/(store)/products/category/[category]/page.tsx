/**
 * Aurora — src/app/(store)/products/category/[category]/page.tsx
 *
 * Category-based product listing page.
 */

import type { Metadata } from "next";
import CategoryPageClient from "@/components/product/listing/CategoryPageClient";

const categoryMap: Record<string, string> = {
  outerwear: "Outerwear",
  knitwear: "Knitwear",
  trousers: "Trousers",
  dresses: "Dresses",
  accessories: "Accessories",
};

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

/** Generate metadata based on the category slug. */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryName = categoryMap[category.toLowerCase()] || "Collection";
  return {
    title: `${categoryName} | Aurora`,
    description: `Discover our collection of premium ${categoryName.toLowerCase()} designed for the considered wardrobe.`,
  };
}

/** Category product listing page. */
export default async function CategoryPage({ params }: CategoryPageProps) {
  return <CategoryPageClient params={params} />;
}

