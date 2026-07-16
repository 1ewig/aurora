/**
 * Aurora — src/components/ui/AnimatedText.tsx
 *
 * Text reveal animation — slides content up with opacity when it scrolls into view.
 */

"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView as useFramerInView } from "framer-motion";

interface AnimatedTextProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  immediate?: boolean;
}

/** Animated text that reveals on scroll with a vertical slide-up. */
export function AnimatedText({
  children,
  delay = 0,
  className,
  immediate = false,
}: AnimatedTextProps) {
  const ref = useRef(null);
  const isInView = useFramerInView(ref, { once: true });
  const shouldAnimate = immediate || isInView;

  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={shouldAnimate ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
