/**
 * Aurora — src/components/admin/inventory/InventoryTable.tsx
 *
 * Searchable, filterable product table with edit/delete actions.
 */
"use client";

import { type ProductData } from "@/stores/useAdminStore";
import { categories } from "@/data/products";
import { Button } from "@/components/ui/Button";


interface InventoryTableProps {
  filteredProducts: ProductData[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  onEditClick: (product: ProductData) => void;
  isAdmin: boolean;
  onRefresh: () => void;
  loading: boolean;
}


/** Renders a product table with search, category filter, and edit row actions. */
export function InventoryTable({
  filteredProducts,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onEditClick,
  isAdmin,
  onRefresh,
  loading,
}: InventoryTableProps) {

  return (
    <div className="space-y-8">
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
            fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search product ID, name, or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-bg-secondary border border-border-medium rounded-full focus:border-accent-primary focus:outline-none text-sm transition-colors"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="block px-5 py-3 pr-12 bg-bg-secondary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none transition-colors cursor-pointer appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B6B6B' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/></svg>")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1rem"
          }}
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <Button variant="ghost" size="md" onClick={onRefresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>


      {/* Main Table */}
      {filteredProducts.length === 0 ? (
        <div className="p-20 text-center text-text-secondary text-sm border border-border-subtle rounded-2xl bg-white">
          No products found.
        </div>
      ) : (
        <div className="overflow-x-auto border border-border-subtle rounded-[24px] bg-bg-secondary shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-primary/50 uppercase tracking-wider text-[10px] font-semibold text-text-secondary">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock levels</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredProducts.map((p) => {
                const totalStock = p.sizes.reduce((sum, s) => sum + s.stock, 0);
                const isLowStock = p.sizes.some((s) => s.stock < 5);

                return (
                  <tr key={p.id} className="hover:bg-bg-primary/25 transition-colors">
                    <td className="px-6 py-4">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.altText}
                          className="w-12 h-16 object-cover rounded-[8px] border border-border-subtle"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-bg-primary rounded-[8px] flex items-center justify-center text-[10px] text-text-muted">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-text-primary">
                      {p.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-text-primary">{p.name}</div>
                      <div className="text-xs text-text-muted mt-0.5">{p.slug}</div>
                    </td>
                    <td className="px-6 py-4 capitalize text-text-secondary">
                      {p.category}
                    </td>
                    <td className="px-6 py-4 font-semibold text-text-primary">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {p.sizes.map((s) => (
                          <span
                            key={s.size}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              s.stock < 5
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-bg-primary text-text-secondary border-border-subtle"
                            }`}
                          >
                            {s.size}: {s.stock}
                          </span>
                        ))}
                      </div>
                      <div className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1.5">
                        <span>Total Stock: {totalStock}</span>
                        {isLowStock && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" title="Low stock alert" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isAdmin && (
                        <button
                          onClick={() => onEditClick(p)}
                          className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-primary hover:text-accent-primary transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
