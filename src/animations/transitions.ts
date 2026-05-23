export const springSmooth = { type: "spring" as const, stiffness: 300, damping: 30 };
export const springBouncy = { type: "spring" as const, stiffness: 400, damping: 20 };
export const springStiff = { type: "spring" as const, stiffness: 500, damping: 35 };
export const springGentle = { type: "spring" as const, stiffness: 180, damping: 22 };
export const easeOutQuart = [0.25, 0.46, 0.45, 0.94] as const;
export const easeInOutCubic = [0.65, 0, 0.35, 1] as const;
