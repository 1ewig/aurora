/**
 * Aurora — src/components/ui/OptimizedImage.tsx
 *
 * Wrapper around Next.js Image with sensible defaults (fill, lazy loading, 100 quality).
 */

import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  style?: React.CSSProperties;
  sizes?: string;
}

/** Optimized Next.js Image with fill layout and high quality defaults. */
export function OptimizedImage({ src, alt, className, loading = "lazy", style, sizes = "100vw" }: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      loading={loading}
      style={style}
      quality={100}
      sizes={sizes}
    />
  );
}
