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

const TIMEOUT_MS = 60000; // 60 seconds

export function useTajweedCheck(): UseTajweedCheck {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<TajweedResult | null>(null);

  const checkRecitation = useCallback(
    async (audioBlob: Blob, verseKey: string) => {
      setIsChecking(true);
      setResult(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "recitation.webm");
        formData.append("verseKey", verseKey);

        const response = await fetch("/api/tajweed", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || `Request failed (${response.status})`);
        }

        const data = await response.json();
        setResult(data);
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof DOMException && error.name === "AbortError") {
          setResult({ error: "Request timed out. The model may be loading — try again." });
        } else {
          setResult({
            error: error instanceof Error ? error.message : "Failed to analyze recitation",
          });
        }
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
