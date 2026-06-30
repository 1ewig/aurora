/**
 * Aurora — src/app/(store)/products/category/[category]/page.tsx
 *
 * Category-based product listing page.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListingClient } from "@/components/product/listing/ProductListingClient";

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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurora-nu-three.vercel.app";
  const title = `${categoryName} | Aurora`;
  const description = `Discover our collection of premium ${categoryName.toLowerCase()} designed for the considered wardrobe.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/products/category/${category}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

/** Category product listing page. */
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryName = categoryMap[category.toLowerCase()];

  if (!categoryName) {
    notFound();
  }

  return <ProductListingClient initialCategory={categoryName} />;
}

