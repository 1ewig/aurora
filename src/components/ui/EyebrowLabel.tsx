import { cn } from "@/utils/cn";

interface EyebrowLabelProps {
  children: React.ReactNode;
  color?: "muted" | "gold";
  className?: string;
}

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
