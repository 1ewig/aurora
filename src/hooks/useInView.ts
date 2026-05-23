import { useInView as useFramerInView, type UseInViewOptions as FramerInViewOptions } from "framer-motion";
import { useRef } from "react";

export function useInView(options: Omit<FramerInViewOptions, "root"> = {}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useFramerInView(ref, {
    once: true,
    ...options,
  });
  return { ref, isInView };
}
