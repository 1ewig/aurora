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
    "bg-[#0D0D0D] text-[#F7F7F5] hover:bg-[#111111] border border-[#0D0D0D]",
  ghost:
    "bg-transparent text-[#111111] border border-[#111111] hover:bg-[#111111] hover:text-[#F7F7F5]",
  gold: "bg-[#C8A882] text-white hover:bg-[#B8860B] border border-[#C8A882] hover:border-[#B8860B]",
  icon: "bg-white border border-[#E8E8E4] hover:border-[#D0CFC9]",
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
        "rounded-full font-medium transition-all duration-300 inline-flex items-center justify-center gap-2 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#C8A882] focus-visible:outline-offset-2",
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
