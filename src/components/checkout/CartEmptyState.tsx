import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function CartEmptyState() {
  return (
    <div className="max-w-md mx-auto text-center py-20 space-y-6">
      <div className="w-16 h-16 bg-border-subtle rounded-full flex items-center justify-center mx-auto mb-6 text-text-secondary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
        </svg>
      </div>
      <h2 className="font-display font-black text-2xl text-text-primary">
        Your Bag is Empty
      </h2>
      <p className="text-text-secondary text-sm md:text-base leading-relaxed">
        You have no items in your shopping bag. Explore our collection of premium outerwear, knitwear, and accessories to find the perfect piece.
      </p>
      <div className="pt-4">
        <Link href="/products">
          <Button variant="filled" size="md">
            Shop the Collection
          </Button>
        </Link>
      </div>
    </div>
  );
}
