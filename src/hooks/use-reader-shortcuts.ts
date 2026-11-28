"use client";

import { useEffect } from "react";
import type { Grade } from "@/types/quran";
import { useReaderStore } from "@/stores/reader-store";

interface UseReaderShortcutsOptions {
  disabled: boolean;
  onGrade: (grade: Grade) => void;
  onKnown: () => void;
  onKnownSurah: () => void;
}

const GRADE_KEYS: Record<string, Grade> = {
  "1": "AGAIN",
  "2": "HARD",
  "3": "GOOD",
  "4": "EASY",
};

export function useReaderShortcuts({
  disabled,
  onGrade,
  onKnown,
  onKnownSurah,
}: UseReaderShortcutsOptions) {
  const setHelpOpen = useReaderStore((s) => s.setHelpOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (disabled) return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      if (
        target.closest(
          "select, [role='combobox'], [role='listbox'], [role='slider'], [role='dialog']"
        )
      ) {
        return;
      }
      const store = useReaderStore.getState();
      if (store.tafsirOpen || store.helpOpen) return;
      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen(!store.helpOpen);
        return;
      }
      if (store.bulkMode) return;
      if (e.shiftKey && (e.key === "5" || e.key === "%")) {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        onKnownSurah();
        return;
      }
      if (e.key === "5") {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        onKnown();
        return;
      }
      const grade = GRADE_KEYS[e.key];
      if (grade) {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        onGrade(grade);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [disabled, onGrade, onKnown, onKnownSurah, setHelpOpen]);
}
