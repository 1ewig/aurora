/**
 * Aurora — src/components/landing/ui/MentionBadge.tsx
 *
 * Animated floating social mention badge with configurable appearance.
 */

"use client";

import { motion } from "framer-motion";

interface MentionBadgeProps {
  handle: string;
  style?: React.CSSProperties;
  delay?: number;
  dark?: boolean;
}

/** Floating animated badge displaying a social handle with configurable color scheme. */
export function MentionBadge({
  handle,
  style,
  delay = 0,
  dark = true,
}: MentionBadgeProps) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={`absolute px-4 py-2 rounded-full text-sm font-medium shadow-lg cursor-default select-none z-20 ${
        dark
          ? "bg-bg-ink text-text-inverted"
          : "bg-accent-primary text-white"
      }`}
      style={style}
    >
      {handle}
    </motion.div>
  );
}
