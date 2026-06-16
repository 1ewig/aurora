/**
 * Aurora — src/animations/transitions.ts
 *
 * Shared Framer Motion transition presets used across the app.
 * Spring configurations for interactive elements, cubic beziers for enter/exit.
 */

/** Standard spring — buttons, cards. */
export const springSmooth = { type: "spring" as const, stiffness: 300, damping: 30 };
/** Bouncier spring — playful ui elements. */
export const springBouncy = { type: "spring" as const, stiffness: 400, damping: 20 };
/** Stiff spring — subtle micro-interactions. */
export const springStiff = { type: "spring" as const, stiffness: 500, damping: 35 };
/** Gentle spring — soft reveals. */
export const springGentle = { type: "spring" as const, stiffness: 180, damping: 22 };
/** Smooth deceleration curve. */
export const easeOutQuart = [0.25, 0.46, 0.45, 0.94] as const;
/** Gentle ease-in-out for fades. */
export const easeInOutCubic = [0.65, 0, 0.35, 1] as const;
