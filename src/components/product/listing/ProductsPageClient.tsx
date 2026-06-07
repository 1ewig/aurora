"use client";

import { PageHeader } from "@/components/product/listing/PageHeader";
import { CategoryFilter } from "@/components/product/listing/CategoryFilter";
import { ProductGrid } from "@/components/product/listing/ProductGrid";
import { useProductFilter } from "@/hooks/useProductFilter";

export default function ProductsPageClient() {
  const { activeCategory, filtered, categories, handleCategoryChange, isLoading } = useProductFilter({
    includeHero: true,
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
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onChange={handleCategoryChange}
          />
        </div>
        <ProductGrid products={filtered} isLoading={isLoading} />
      </div>
    </main>
  );
}
