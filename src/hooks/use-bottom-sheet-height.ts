"use client";

import { useEffect } from "react";

/**
 * Publishes the live rendered height of the fixed reader bottom sheet to
 * `--bottom-sheet-h` on `documentElement` so floating toasts/drawers ride
 * cleanly above it across responsive breakpoints.
 */
export function useBottomSheetHeight(elementId = "reader-bottom-sheet") {
  useEffect(() => {
    const sheet = document.getElementById(elementId);
    if (!sheet) return;
    const apply = () => {
      const h = Math.round(sheet.getBoundingClientRect().height);
      if (h > 0) {
        document.documentElement.style.setProperty("--bottom-sheet-h", `${h}px`);
      }
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(sheet);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--bottom-sheet-h");
    };
  }, [elementId]);
}
