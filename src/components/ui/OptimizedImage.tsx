import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  style?: React.CSSProperties;
}

export function OptimizedImage({ src, alt, className, loading = "lazy", style }: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      loading={loading}
      style={style}
      quality={100}
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
}
