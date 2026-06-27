/**
 * Aurora — src/animations/variants.ts
 *
 * Framer Motion animation variants for entry/exit transitions used across the app.
 * Includes fade, slide, scale, card cascade, drawer, and menu animations.
 */

import type { Variants } from "framer-motion";

/** Spring config for card entrance animations. */
export const springCardEnter = {
  type: "spring" as const,
  stiffness: 260,
  damping: 26,
};

/** Easing for card exit animations. */
export const springCardExit = {
  duration: 0.3,
  ease: [0.55, 0.06, 0.68, 0.19] as const,
};

/** Fades in while sliding upward. Used for section reveals. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** Simple fade-in. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

/** Staggers children entrance with delay between each. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

/** Slides in from the left. */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** Slides in from the right. */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** Scales in from 88% with an overshoot ease. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1] },
  },
};

/** Returns a rotation angle for a cascade card based on its index. */
export const getCardRotation = (index: number): number => {
  const rotations = [-10, -5, 0, 6, 12, 18];
  return rotations[index] ?? 0;
};

/** Staggered cascade entrance for a stack of cards with rotation. */
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

/** Floating/keyframe animation for mention badges. */
export const mentionFloat = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
  },
};

/** Navbar slide-down reveal on page load. */
export const navbarReveal: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** Cart drawer slide in from the right edge. */
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

/** Full-screen overlay menu entrance/exit. */
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

/** Mobile menu item slide-in from the right. */
export const menuItemVariant: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** Card entrance with alternating offset based on index. */
export function cardEnter(index: number): Variants {
  const isEven = index % 2 === 0;
  return {
    hidden: {
      opacity: 0,
      y: isEven ? 60 : 30,
      x: isEven ? 0 : 20,
      scale: 0.92,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        ...springCardEnter,
        delay: index * 0.07,
      },
    },
  };
}

/** Card exit variant — shrinks and fades downward. */
export const cardExit: Variants = {
  hidden: { opacity: 1, scale: 1, y: 0 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: {
    opacity: 0,
    scale: 0.85,
    y: 30,
    transition: { duration: 0.25, ease: [0.55, 0.06, 0.68, 0.19] },
  },
};

/** Subtle scale reveal for product card images. */
export const cardImageReveal: Variants = {
  hidden: { scale: 1.08 },
  visible: {
    scale: 1,
    transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** Direction-aware horizontal sliding for quote/testimonial carousels. */
export const testimonialSlide: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};
