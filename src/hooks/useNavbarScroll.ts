import { useScroll, useTransform } from "framer-motion";

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
