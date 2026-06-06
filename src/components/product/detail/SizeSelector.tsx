"use client";

import { cn } from "@/utils/cn";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onChange: (size: string) => void;
  onOpenSizeGuide: () => void;
}

export function SizeSelector({ sizes, selectedSize, onChange, onOpenSizeGuide }: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Select Size
        </span>
        <button
          type="button"
          onClick={onOpenSizeGuide}
          className="text-xs text-accent-primary hover:underline cursor-pointer bg-transparent border-none p-0 outline-none"
        >
          Size Guide
        </button>
      </div>
      <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Product size selection">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={isSelected ? "true" : "false"}
              onClick={() => onChange(size)}
              className={cn(
                "min-w-[50px] h-[50px] px-3 border rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center cursor-pointer select-none",
                isSelected
                  ? "bg-bg-ink border-bg-ink text-text-inverted"
                  : "bg-bg-secondary border-border-subtle text-text-primary hover:border-text-primary"
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
