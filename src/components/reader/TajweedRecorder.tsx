"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTajweedCheck } from "@/hooks/use-tajweed-check";
import { cn } from "@/lib/utils";
import type { TajweedResult } from "@/types/tajweed";

interface TajweedRecorderProps {
  verseKey: string;
  onResult?: (result: TajweedResult) => void;
  className?: string;
}

const MAX_RECORDING_SECONDS = 120; // 2 minutes

export function TajweedRecorder({ verseKey, onResult, className }: TajweedRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { isChecking, result, checkRecitation, reset } = useTajweedCheck();

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Call onResult when result changes
  useEffect(() => {
    if (result && onResult) {
      onResult(result);
    }
  }, [result, onResult]);

  const startRecording = useCallback(async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Find supported MIME type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer with auto-stop at max
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => {
          if (t + 1 >= MAX_RECORDING_SECONDS) {
            // Auto-stop at max
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
            }
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setIsRecording(false);
            return MAX_RECORDING_SECONDS;
          }
          return t + 1;
        });
      }, 1000);
    } catch (error) {
      const msg =
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Microphone access denied. Please allow mic access."
          : "Could not start recording. Check your microphone.";
      setMicError(msg);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const handleCheck = useCallback(async () => {
    if (!audioBlob) return;
    await checkRecitation(audioBlob, verseKey);
  }, [audioBlob, verseKey, checkRecitation]);

  const handleReset = useCallback(() => {
    reset();
    setAudioBlob(null);
    setRecordingTime(0);
    setMicError(null);
  }, [reset]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 50) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Error display */}
      {micError && (
        <p className="text-sm text-red-600 dark:text-red-400">{micError}</p>
      )}

      {/* Recording controls */}
      <div className="flex items-center gap-2">
        {!isRecording ? (
          <Button onClick={startRecording} variant="outline" size="sm" className="gap-2">
            <Mic className="h-4 w-4" />
            Record
          </Button>
        ) : (
          <Button onClick={stopRecording} variant="destructive" size="sm" className="gap-2">
            <Square className="h-4 w-4" />
            Stop
          </Button>
        )}

        {isRecording && (
          <span className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            {formatTime(recordingTime)}
          </span>
        )}

        {audioBlob && !isRecording && !result && (
          <Button onClick={handleCheck} variant="default" size="sm" disabled={isChecking} className="gap-2">
            {isChecking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Check Recitation"
            )}
          </Button>
        )}

        {(result || audioBlob) && !isRecording && (
          <Button onClick={handleReset} variant="ghost" size="sm">
            Reset
          </Button>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
          {result.error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
          ) : (
            <>
              <div className="mb-3">
                <span className={cn("text-2xl font-bold", getScoreColor(result.score || 0))}>
                  {result.score}/100
                </span>
                {result.similarity != null && (
                  <span className="ml-3 text-sm text-stone-500">
                    {result.similarity}% accuracy
                  </span>
                )}
              </div>

              {result.transcription && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    Your Recitation:
                  </p>
                  <p dir="rtl" className="font-quran text-lg leading-relaxed">
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
                  <p dir="rtl" className="font-quran text-lg leading-relaxed">
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
