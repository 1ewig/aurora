/**
 * Aurora — src/hooks/ui/useNavbarScroll.ts
 *
 * Produces animated nav styles (background opacity, border, blur) based on scroll position.
 */

import { useScroll, useTransform } from "framer-motion";

/** Returns motion values for navbar background, border, and blur based on scroll Y. */
export function useNavbarScroll() {
  const { scrollY } = useScroll();

  const navBg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(247,247,245,0)", "rgba(247,247,245,0.92)"]
  );
  const navBorder = useTransform(
    scrollY,
    [0, 80],
    ["rgba(232,232,228,0)", "rgba(232,232,228,1)"]
  );
  const navBlur = useTransform(scrollY, [0, 80], ["blur(0px)", "blur(16px)"]);

  return { navBg, navBorder, navBlur };
}
