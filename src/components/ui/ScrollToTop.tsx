"use client";

import { useEffect } from "react";

/** Utility component that forces the window scroll position to y=0 on mount. */
export function ScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}
