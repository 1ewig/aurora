/**
 * Aurora — src/components/product/detail/Breadcrumbs.tsx
 *
 * Renders breadcrumb navigation for the product detail page.
 */
import Link from "next/link";

/** Renders breadcrumb navigation linking back to Home and Shop. */
export function Breadcrumbs({ category }: { category: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 md:mb-12 text-xs font-semibold uppercase tracking-wider text-text-muted">
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/" className="hover:text-text-primary transition-colors">
            Home
          </Link>
        </li>
        <li>/</li>
        <li>
          <Link href="/products" className="hover:text-text-primary transition-colors">
            Shop
          </Link>
        </li>
        <li>/</li>
        <li>
          <span className="text-text-secondary">{category}</span>
        </li>
      </ol>
    </nav>
  );
}
