/**
 * Aurora — src/hooks/ui/useMediaQuery.ts
 *
 * Tracks whether a CSS media query matches. Updates on window resize.
 */

import { useState, useEffect } from "react";

/** Returns whether the given CSS media query currently matches. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const handler = () => setMatches(media.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
