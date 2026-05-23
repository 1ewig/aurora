import { useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

export function useScrollProgress() {
  const { scrollY, scrollYProgress } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 80);
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollPercent(Math.round(latest * 100));
  });

  return { scrollY, scrollYProgress, isScrolled, scrollPercent };
}
