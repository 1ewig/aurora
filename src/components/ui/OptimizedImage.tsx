import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  style?: React.CSSProperties;
}

export function OptimizedImage({ src, alt, className, loading = "lazy", style }: OptimizedImageProps) {
  const jpgSrc = src.replace(/\.webp$/, ".jpg");
  const webpSrc = src.replace(/\.jpg$/, ".webp");
  const [failed, setFailed] = useState(false);

  const fallbackSrc = failed ? jpgSrc : webpSrc;

  return (
    <picture>
      {!failed && <source srcSet={webpSrc} type="image/webp" />}
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        loading={loading}
        style={style}
        onError={() => setFailed(true)}
      />
    </picture>
  );
}
