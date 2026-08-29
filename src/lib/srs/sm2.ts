import type { Grade, MemoryState } from "@/types/quran";

export const GRADE_QUALITY: Record<Grade, number> = {
  AGAIN: 2,
  HARD: 3,
  GOOD: 4,
  EASY: 5,
};

export const MIN_EASE_FACTOR = 1.3;
export const MAX_INTERVAL_DAYS = 365;
export const MANZIL_PROMOTION_DAYS = 21;

export interface Sm2Input {
  easeFactor: number;
  intervalDays: number;
  repetitionCount: number;
  state: MemoryState;
}

export interface Sm2Outcome extends Sm2Input {
  dueDate: Date;
}

export const NEW_MEMORY_STATE: Sm2Input = {
  easeFactor: 2.5,
  intervalDays: 0,
  repetitionCount: 0,
  state: "SABAQ",
};

const DAY_MS = 86_400_000;

export function schedule(prev: Sm2Input, grade: Grade, now = new Date()): Sm2Outcome {
  const q = GRADE_QUALITY[grade];
  const easeFactor = Math.max(
    MIN_EASE_FACTOR,
    prev.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );

  let repetitionCount = prev.repetitionCount;
  let intervalDays: number;
  let state: MemoryState = prev.state;

  if (grade === "AGAIN") {
    repetitionCount = 0;
    intervalDays = 10 / 1440;
    if (prev.state === "MANZIL") state = "SABQI";
  } else if (grade === "HARD") {
    repetitionCount += 1;
    intervalDays =
      prev.intervalDays > 0 ? Math.max(1, prev.intervalDays * 1.2) : 1;
  } else if (grade === "GOOD") {
    repetitionCount += 1;
    if (repetitionCount === 1) intervalDays = 1;
    else if (repetitionCount === 2) intervalDays = 6;
    else intervalDays = Math.max(1, prev.intervalDays * easeFactor);
  } else {
    repetitionCount += 1;
    intervalDays =
      repetitionCount === 1
        ? 4
        : Math.max(1, prev.intervalDays * easeFactor * 1.25);
  }

  if (state === "SABAQ" && grade !== "AGAIN" && repetitionCount >= 1) {
    state = "SABQI";
  }
  if (state === "SABQI" && intervalDays >= MANZIL_PROMOTION_DAYS) {
    state = "MANZIL";
  }

  intervalDays = Math.min(MAX_INTERVAL_DAYS, Math.round(intervalDays * 100) / 100);

  return {
    easeFactor,
    intervalDays,
    repetitionCount,
    state,
    dueDate: new Date(now.getTime() + intervalDays * DAY_MS),
  };
}

export function formatInterval(days: number): string {
  const minutes = days * 1440;
  if (minutes < 60) return `${Math.round(minutes)} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} hr`;
  if (days < 30) return `${Math.round(days)} day${Math.round(days) === 1 ? "" : "s"}`;
  if (days < 365) return `${Math.round(days / 30)} mo`;
  return `${(days / 365).toFixed(1)} yr`;
}

export function describeOutcome(
  outcome: Pick<Sm2Outcome, "state" | "intervalDays">,
  grade: Grade
): string {
  const next = `next in ${formatInterval(outcome.intervalDays)}`;
  switch (grade) {
    case "AGAIN":
      return outcome.state === "SABAQ"
        ? `Relearning · retry in ${formatInterval(outcome.intervalDays)}`
        : `Weakened → back to Sabqi · ${next}`;
    case "HARD":
      return `Hard · ${next}`;
    case "GOOD":
      return outcome.state === "MANZIL"
        ? `Good · promoted to Manzil · ${next}`
        : `Good · ${next}`;
    case "EASY":
      return outcome.state === "MANZIL"
        ? `Easy · promoted to Manzil · ${next}`
        : `Easy · ${next}`;
  }
}
