"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTajweedCheck } from "@/hooks/use-tajweed-check";
import { cn } from "@/lib/utils";

interface TajweedRecorderProps {
  verseKey: string;
  onResult?: (result: TajweedResult) => void;
  className?: string;
}

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

export function TajweedRecorder({ verseKey, onResult, className }: TajweedRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { isChecking, result, checkRecitation, reset } = useTajweedCheck();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleCheck = useCallback(async () => {
    if (!audioBlob) return;
    await checkRecitation(audioBlob, verseKey);
  }, [audioBlob, verseKey, checkRecitation]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 50) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Mic className="h-4 w-4" />
            Record
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            <Square className="h-4 w-4" />
            Stop
          </Button>
        )}

        {audioBlob && !isRecording && (
          <Button
            onClick={handleCheck}
            variant="default"
            size="sm"
            disabled={isChecking}
            className="gap-2"
          >
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Check Recitation"
            )}
          </Button>
        )}

        {result && (
          <Button onClick={reset} variant="ghost" size="sm">
            Reset
          </Button>
        )}
      </div>

      {result && (
        <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
          {result.error ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {result.error}
            </p>
          ) : (
            <>
              <div className="mb-3">
                <span className={cn("text-2xl font-bold", getScoreColor(result.score || 0))}>
                  {result.score}/100
                </span>
                {result.similarity && (
                  <span className="ml-3 text-sm text-stone-500">
                    {result.similarity}% similar to reference
                  </span>
                )}
              </div>

              {result.transcription && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    Your Recitation:
                  </p>
                  <p dir="rtl" className="font-quran text-lg">
                    {result.transcription}
                  </p>
                </div>
              )}

              {result.issues && result.issues.length > 0 && (
                <div className="space-y-2">
                  {result.issues.map((issue, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded p-2 text-sm",
                        issue.severity === "error"
                          ? "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                          : issue.severity === "warning"
                          ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                          : "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                      )}
                    >
                      <p className="font-medium">{issue.rule}</p>
                      <p>{issue.message}</p>
                      <p className="text-xs opacity-75">{issue.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.reference && (
                <div className="mt-3 border-t border-stone-200 pt-3 dark:border-stone-700">
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    Reference:
                  </p>
                  <p dir="rtl" className="font-quran text-lg">
                    {result.reference}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
