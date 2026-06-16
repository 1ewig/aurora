/**
 * Aurora — src/hooks/ui/useInView.ts
 *
 * Wraps Framer Motion's `useInView` to trigger once when an element scrolls into view.
 */

import { useInView as useFramerInView, type UseInViewOptions as FramerInViewOptions } from "framer-motion";
import { useRef } from "react";

/** Returns a ref and visibility flag that triggers once on scroll entry. */
export function useInView(options: Omit<FramerInViewOptions, "root"> = {}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useFramerInView(ref, {
    once: true,
    ...options,
  });
  return { ref, isInView };
}
