"use client";

interface SortFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortFilter({ value, onChange }: SortFilterProps) {
  const options = [
    { value: "featured", label: "Featured" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A-Z" },
    { value: "name-desc", label: "Name: Z-A" },
  ];

  return (
    <div className="relative">
      <label htmlFor="sort-select" className="sr-only">
        Sort products
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block min-w-[200px] px-6 py-3 bg-bg-secondary border border-border-medium rounded-full text-sm font-semibold uppercase tracking-wider text-text-primary hover:border-text-primary transition-all duration-300 shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2 appearance-none pr-12"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B6B6B' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/></svg>")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1.5rem center",
          backgroundSize: "1rem"
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-bg-secondary text-text-primary">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
