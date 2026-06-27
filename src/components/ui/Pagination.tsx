/**
 * Aurora — src/components/ui/Pagination.tsx
 *
 * Premium dynamic pagination control component.
 */

"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Pure helper to generate pagination page numbers and ellipsis indicators. */
function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  return pages;
}

/** Dynamic dynamic pagination component with clean micro-interactions. */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination Navigation"
      className={cn(
        "flex items-center justify-center gap-2.5 mt-16 md:mt-20 select-none",
        className
      )}
    >
      {/* Previous Button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full border border-border-medium bg-bg-secondary text-text-primary transition-all duration-300 shadow-xs",
          currentPage === 1
            ? "opacity-40 cursor-not-allowed border-border-subtle"
            : "hover:border-text-primary hover:scale-105 active:scale-95 cursor-pointer"
        )}
        aria-label="Go to previous page"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5 font-mono text-sm">
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-10 h-10 flex items-center justify-center text-text-muted text-xs tracking-wider"
              >
                •••
              </span>
            );
          }

          const isCurrent = page === currentPage;

          return (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(page as number)}
              className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 text-sm font-medium",
                isCurrent
                  ? "bg-text-primary text-bg-primary font-semibold shadow-md"
                  : "bg-transparent text-text-secondary border border-transparent hover:border-border-medium hover:text-text-primary cursor-pointer hover:scale-105 active:scale-95"
              )}
              aria-label={`Go to page ${page}`}
              aria-current={isCurrent ? "page" : undefined}
            >
              {isCurrent && (
                <motion.span
                  layoutId="activeIndicator"
                  className="absolute bottom-1 w-1.5 h-1.5 bg-bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full border border-border-medium bg-bg-secondary text-text-primary transition-all duration-300 shadow-xs",
          currentPage === totalPages
            ? "opacity-40 cursor-not-allowed border-border-subtle"
            : "hover:border-text-primary hover:scale-105 active:scale-95 cursor-pointer"
        )}
        aria-label="Go to next page"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
