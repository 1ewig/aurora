/**
 * Aurora — src/app/(store)/not-found.tsx
 *
 * Custom 404 page for the store route group.
 */

import Link from "next/link";

/** Custom 404 not-found page for the store route group. */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary px-6">
      <h1 className="font-display font-black text-6xl md:text-8xl text-text-primary">
        404
      </h1>
      <p className="text-text-secondary mt-4 text-lg">
        This page does not exist.
      </p>
      <Link
        href="/"
        className="mt-8 px-8 py-4 rounded-full bg-bg-ink text-text-inverted font-medium hover:bg-text-primary transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
