import type { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1] },
  },
};

export const getCardRotation = (index: number): number => {
  const rotations = [-10, -5, 0, 6, 12, 18];
  return rotations[index] ?? 0;
};

export const cardCascade = (index: number): Variants => ({
  hidden: {
    opacity: 0,
    y: 80,
    rotate: getCardRotation(index) - 3,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotate: getCardRotation(index),
    transition: {
      duration: 0.9,
      delay: index * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
});

export const mentionFloat = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
  },
};

export const navbarReveal: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const drawerSlide: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.35, ease: [0.55, 0.06, 0.68, 0.19] },
  },
};

export const overlayMenu: Variants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.4, ease: [0.55, 0.06, 0.68, 0.19] },
  },
};

export const menuItemVariant: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};
