import { formatCurrency } from "@/utils/formatCurrency";
import type { Product } from "@/data/products";

export function ProductInfo({ product }: { product: Product }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {product.badge && (
          <span className="inline-block px-3 py-1 rounded-full bg-accent-secondary/50 text-[10px] font-bold uppercase tracking-wider text-accent-primary">
            {product.badge}
          </span>
        )}
        <p className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
          {product.category}
        </p>
        <h1 className="font-display font-black text-3xl md:text-4xl lg:text-5xl tracking-tight text-text-primary">
          {product.name}
        </h1>
        <div className="flex items-baseline gap-4 mt-2">
          <span className="font-mono text-xl md:text-2xl font-semibold text-text-primary">
            {formatCurrency(product.price)}
          </span>
        </div>
      </div>

      <div className="border-t border-border-subtle pt-6">
        <p className="text-text-secondary leading-relaxed text-sm md:text-base">
          {product.description}
        </p>
      </div>
    </div>
  );
}
