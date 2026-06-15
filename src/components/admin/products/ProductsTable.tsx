"use client";

import { type ProductData } from "@/stores/useAdminStore";

interface ProductsTableProps {
  filteredProducts: ProductData[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onEditClick: (product: ProductData) => void;
  onDeleteClick: (product: ProductData) => void;
}

export function ProductsTable({
  filteredProducts,
  searchQuery,
  onSearchChange,
  onEditClick,
  onDeleteClick,
}: ProductsTableProps) {
  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Search product ID, name, or category..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full md:max-w-md px-5 py-3 bg-bg-secondary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none transition-colors"
        />
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
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => onEditClick(p)}
                          className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-primary hover:text-accent-primary transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteClick(p)}
                          className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-error hover:text-red-700 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
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
