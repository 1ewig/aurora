"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/product/listing/PageHeader";
import { CategoryFilter } from "@/components/product/listing/CategoryFilter";
import { SortFilter } from "@/components/product/listing/SortFilter";
import { ProductGrid } from "@/components/product/listing/ProductGrid";
import { useProductFilter } from "@/hooks/useProductFilter";

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

export default function CategoryPageClient({ params }: CategoryPageClientProps) {
  const { category: categorySlug } = use(params);
  const categoryName = categoryMap[categorySlug.toLowerCase()];

  if (!categoryName) {
    notFound();
  }

  const {
    activeCategory,
    filtered,
    categories,
    handleCategoryChange,
    sortBy,
    setSortBy,
    isLoading
  } = useProductFilter({
    initialCategory: categoryName,
    onCategoryChange: (name) => {
      const slug = name === "All" ? "" : name.toLowerCase();
      const url = slug ? `/products/category/${slug}` : "/products";
      window.history.pushState(null, "", url);
    },
  });

  return (
    <main id="main-content" tabIndex={-1} className="pt-28 pb-32">
      <div className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <PageHeader category={activeCategory} />
          <div className="flex flex-wrap gap-4 items-center">
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onChange={handleCategoryChange}
            />
            <SortFilter
              value={sortBy}
              onChange={setSortBy}
            />
          </div>
        </div>
        <ProductGrid products={filtered} isLoading={isLoading} />
      </div>
    </main>
  );
}
