"use client";

import { motion } from "framer-motion";

interface CategoryFilterProps {
  categories: readonly string[];
  activeCategory: string;
  onChange: (category: string) => void;
}

export function CategoryFilter({ categories, activeCategory, onChange }: CategoryFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter catalog"
      className="flex flex-wrap gap-2 md:gap-3"
    >
      {categories.map((category) => {
        const isSelected = category === activeCategory;
        return (
          <button
            key={category}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(category)}
            className="relative px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors duration-300 cursor-pointer overflow-hidden select-none outline-none focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2"
          >
            {isSelected && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-bg-ink"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-300 ${
                isSelected ? "text-text-inverted" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {category}
            </span>
          </button>
        );
      })}
    </div>
  );
}
