/**
 * Aurora — src/components/ui/EyebrowLabel.tsx
 *
 * Small uppercase label used as section headers (muted or gold accent).
 */

import { cn } from "@/utils/cn";

interface EyebrowLabelProps {
  children: React.ReactNode;
  color?: "muted" | "gold";
  className?: string;
}

/** Small uppercase label for section headings. */
export function EyebrowLabel({
  children,
  color = "muted",
  className,
}: EyebrowLabelProps) {
  return (
    <span
      className={cn(
        "text-xs font-medium tracking-[0.12em] uppercase block",
        color === "gold" ? "text-accent-primary" : "text-text-muted",
        className
      )}
    >
      {children}
    </span>
  );
}
