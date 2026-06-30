/**
 * Aurora — src/components/product/listing/ProductListing.tsx
 *
 * Presentational product listing page with search, filter, sort, and product grid.
 * Receives all state and handlers via props from ProductListingContainer.
 */
"use client";

import { PageHeader } from "@/components/product/listing/PageHeader";
import { FilterDrawer } from "@/components/product/listing/FilterDrawer";
import { ProductGrid } from "@/components/product/listing/ProductGrid";
import { Pagination } from "@/components/ui/Pagination";
import type { Product } from "@/data/products";

interface ProductListingProps {
  activeCategory: string;
  sortBy: string;
  applyFilters: (category: string, sort: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearchSubmit: (e?: React.FormEvent) => void;
  handleClearSearch: () => void;
  filtered: Product[];
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  categories: readonly string[];
  isFilterDrawerOpen: boolean;
  onOpenFilterDrawer: () => void;
  onCloseFilterDrawer: () => void;
}

/** Renders the full product listing with search bar, filter drawer, and animated product grid. */
export function ProductListing({
  activeCategory,
  sortBy,
  applyFilters,
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  handleClearSearch,
  filtered,
  categories,
  isLoading,
  totalPages,
  currentPage,
  onPageChange,
  isFilterDrawerOpen,
  onOpenFilterDrawer,
  onCloseFilterDrawer,
}: ProductListingProps) {

  return (
    <main id="main-content" tabIndex={-1} className="pt-28 pb-32">
      <div className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <PageHeader category={activeCategory} />
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input Container */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-80 md:flex-initial">
              <button
                type="submit"
                className="absolute inset-y-0 left-4 flex items-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                aria-label="Submit search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-bg-secondary border border-border-medium rounded-full text-sm placeholder-text-muted text-text-primary focus:border-text-primary focus:outline-none transition-colors duration-300"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-4 flex items-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={onOpenFilterDrawer}
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

        {/* Dynamic Pagination Control */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>

      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={onCloseFilterDrawer}
        categories={categories}
        activeCategory={activeCategory}
        sortBy={sortBy}
        onApply={(category, sort) => {
          applyFilters(category, sort);
        }}
      />
    </main>
  );
}
