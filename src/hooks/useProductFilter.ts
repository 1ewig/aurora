import { useState, useEffect } from "react";
import { usePaginatedProductsQuery } from "@/hooks/queries";
import { categories } from "@/data/products";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface UseProductFilterOptions {
  initialCategory?: string;
  onCategoryChange?: (category: string) => void;
}

/** Manages category, sort, and search filters for the products listing page with server-side pagination and URL sync. */
export function useProductFilter(options: UseProductFilterOptions = {}) {
  const {
    initialCategory = "All",
    onCategoryChange,
  } = options;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  
  // Read current filters directly from URL search parameters as the source of truth
  const page = Number(searchParams.get("page")) || 1;
  const sortBy = searchParams.get("sortBy") || "featured";
  const searchParam = searchParams.get("search") || "";

  // Local state for the text input field (allows editing without instant searching)
  const [searchQuery, setSearchQuery] = useState<string>(searchParam);

  // Sync activeCategory with initialCategory when prop changes
  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  // Keep input text synced with URL (e.g. on back navigation)
  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  // Update page via router navigation
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  // Submit search query to the URL
  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim() !== "") {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset page to 1
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  // Clear search query and reload results
  const handleClearSearch = () => {
    setSearchQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.set("page", "1"); // Reset page to 1
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  // Apply both category and sorting concurrently to avoid double navigation push
  const applyFilters = (category: string, newSortBy: string) => {
    setActiveCategory(category);

    const slug = category === "All" ? "" : category.toLowerCase();
    const url = slug ? `/products/category/${slug}` : "/products";

    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSortBy);
    params.set("page", "1"); // Reset page to 1

    router.push(`${url}?${params.toString()}`, { scroll: false });
    onCategoryChange?.(category);
  };

  // Fetch paginated, filtered, and sorted products from server
  const { data, isLoading } = usePaginatedProductsQuery({
    category: activeCategory,
    page,
    limit: 12,
    search: searchParam, // Query using the committed URL parameter
    sortBy,
  });

  const filtered = data?.products || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 12);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);

    const slug = category === "All" ? "" : category.toLowerCase();
    const url = slug ? `/products/category/${slug}` : "/products";

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset page to 1

    router.push(`${url}?${params.toString()}`, { scroll: false });
    onCategoryChange?.(category);
  };

  return {
    activeCategory,
    setActiveCategory,
    handleCategoryChange,
    sortBy,
    applyFilters,
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    handleClearSearch,
    filtered,
    isLoading,
    total,
    totalPages,
    currentPage: page,
    onPageChange: handlePageChange,
    categories: ["All", ...categories] as const,
  };
}

