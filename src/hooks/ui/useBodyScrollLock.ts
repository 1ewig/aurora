/**
 * Aurora — src/hooks/ui/useBodyScrollLock.ts
 *
 * Locks body scroll when a modal/drawer is open by toggling `overflow: hidden`.
 */

import { useEffect } from "react";

/** Locks or unlocks body scroll. Cleanup restores overflow on unmount. */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [locked]);
}
