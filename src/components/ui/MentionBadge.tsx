"use client";

import { motion } from "framer-motion";

interface MentionBadgeProps {
  handle: string;
  style?: React.CSSProperties;
  delay?: number;
  dark?: boolean;
}

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
          ? "bg-[#0D0D0D] text-[#F7F7F5]"
          : "bg-[#C8A882] text-white"
      }`}
      style={style}
    >
      {handle}
    </motion.div>
  );
}
