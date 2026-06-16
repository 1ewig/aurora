/**
 * Aurora — src/components/product/listing/ProductListing.tsx
 *
 * Full product listing page with search, filter, sort, and product grid.
 */
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/product/listing/PageHeader";
import { FilterDrawer } from "@/components/product/listing/FilterDrawer";
import { ProductGrid } from "@/components/product/listing/ProductGrid";
import { useProductFilter } from "@/hooks/useProductFilter";

interface ProductListingProps {
  initialCategory?: string;
  onCategoryChange?: (category: string) => void;
}

/** Renders the full product listing with search bar, filter drawer, and animated product grid. */
export function ProductListing({ initialCategory = "All", onCategoryChange }: ProductListingProps) {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const {
    activeCategory,
    handleCategoryChange,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    filtered,
    categories,
    isLoading,
  } = useProductFilter({
    initialCategory,
    onCategoryChange: (name) => {
      onCategoryChange?.(name);
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
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input Container */}
            <div className="relative flex-1 md:w-80 md:flex-initial">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-secondary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-5 py-3 bg-bg-secondary border border-border-medium rounded-full text-sm placeholder-text-muted text-text-primary focus:border-text-primary focus:outline-none transition-colors duration-300"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-4 flex items-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="p-3 bg-bg-secondary border border-border-medium rounded-full text-text-primary hover:border-text-primary transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2"
              aria-label="Open filters"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>
        </div>

        <ProductGrid products={filtered} isLoading={isLoading} />
      </div>

      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        categories={categories}
        activeCategory={activeCategory}
        sortBy={sortBy}
        onApply={(category, sort) => {
          handleCategoryChange(category);
          setSortBy(sort);
        }}
      />
    </main>
  );
}
