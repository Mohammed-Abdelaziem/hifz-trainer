"use client";

import { Headphones } from "lucide-react";
import { LISTEN_NUDGE_THRESHOLD } from "@/lib/constants";

/**
 * One-line invitation to grade after several listens of the same ayah.
 * Renders nothing until the accumulated listen count (across all sessions)
 * passes the threshold — and stays quiet for an ayah already graded in this
 * session, so the prompt can't nag about something just graded.
 */
export function GradeNudge({
  verseKey,
  listenCount,
  hidden,
}: {
  verseKey: string;
  listenCount: number | null;
  /** True when graded this session (server count stays high regardless). */
  hidden: boolean;
}) {
  if (hidden || listenCount === null || listenCount < LISTEN_NUDGE_THRESHOLD) return null;

  return (
    <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
      <Headphones className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
      <span>
        You&apos;ve listened to <strong>{verseKey}</strong> {listenCount}× — grade it below when
        you&apos;re ready to schedule its review.
      </span>
    </p>
  );
}
