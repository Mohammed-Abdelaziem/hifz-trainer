"use client";

import { useState, useCallback } from "react";

interface TajweedResult {
  transcription?: string;
  score?: number;
  issues?: Array<{
    rule: string;
    severity: string;
    message: string;
    suggestion: string;
  }>;
  duration?: number;
  words_per_minute?: number;
  similarity?: number;
  reference?: string;
  error?: string;
}

interface UseTajweedCheck {
  isChecking: boolean;
  result: TajweedResult | null;
  checkRecitation: (audioBlob: Blob, verseKey: string) => Promise<void>;
  reset: () => void;
}

export function useTajweedCheck(): UseTajweedCheck {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<TajweedResult | null>(null);

  const checkRecitation = useCallback(
    async (audioBlob: Blob, verseKey: string) => {
      setIsChecking(true);
      setResult(null);

      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "recitation.webm");
        formData.append("verseKey", verseKey);

        const response = await fetch("/api/tajweed", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to check recitation");
        }

        const data = await response.json();
        setResult(data);
      } catch (error) {
        setResult({ error: "Failed to analyze recitation" });
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setIsChecking(false);
  }, []);

  return { isChecking, result, checkRecitation, reset };
}
