"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/utils/cn";

type ButtonVariant = "filled" | "ghost" | "gold" | "icon";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

const buttonStyles: Record<ButtonVariant, string> = {
  filled:
    "bg-bg-ink text-text-inverted hover:bg-text-primary border border-bg-ink",
  ghost:
    "bg-transparent text-text-primary border border-text-primary hover:bg-text-primary hover:text-text-inverted",
  gold: "bg-accent-primary text-white hover:bg-accent-vivid border border-accent-primary hover:border-accent-vivid",
  icon: "bg-white border border-border-subtle hover:border-border-medium",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-sm",
  md: "px-7 py-3.5 text-sm",
  lg: "px-9 py-4 text-base",
};

export function Button({
  variant = "filled",
  size = "md",
  fullWidth = false,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "rounded-full font-medium transition-all duration-300 inline-flex items-center justify-center gap-2 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2",
        buttonStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
