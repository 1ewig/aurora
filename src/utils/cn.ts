/**
 * Aurora — src/utils/cn.ts
 *
 * Utility for merging Tailwind CSS class names with conflict resolution.
 * Combines clsx (conditional class logic) with tailwind-merge (de-duplication).
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges class values, resolving Tailwind conflicts predictably. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
