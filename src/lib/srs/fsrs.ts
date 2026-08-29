import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card,
  type Grade as FsrsRating,
} from "ts-fsrs";
import type { Grade } from "@/types/quran";

export type SchedulerKind = "sm2" | "fsrs";

export const MIN_RETENTION = 0.7;
export const MAX_RETENTION = 0.98;

const engineCache = new Map<string, ReturnType<typeof fsrs>>();

function getEngine(requestRetention: number) {
  const clamped = Math.min(MAX_RETENTION, Math.max(MIN_RETENTION, requestRetention));
  const key = clamped.toFixed(2);
  let engine = engineCache.get(key);
  if (!engine) {
    engine = fsrs(
      generatorParameters({
        enable_fuzz: true,
        enable_short_term: false,
        request_retention: clamped,
      })
    );
    engineCache.set(key, engine);
  }
  return engine;
}

export const GRADE_TO_RATING: Record<Grade, FsrsRating> = {
  AGAIN: Rating.Again,
  HARD: Rating.Hard,
  GOOD: Rating.Good,
  EASY: Rating.Easy,
};

export interface FsrsInput {
  difficulty: number;
  stability: number;
  repetitionCount: number;
  lapses: number;
}

export const EMPTY_FSRS_INPUT: FsrsInput = {
  difficulty: 0,
  stability: 0,
  repetitionCount: 0,
  lapses: 0,
};

export interface FsrsOutcome {
  intervalDays: number;
  dueDate: Date;
  difficulty: number;
  stability: number;
}

function toCard(input: FsrsInput, now: Date): Card {
  if (input.repetitionCount === 0) return createEmptyCard(now);
  return {
    due: now,
    stability: input.stability,
    difficulty: input.difficulty,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: input.repetitionCount,
    lapses: input.lapses,
    learning_steps: 0,
    state: State.Review,
  };
}

export function scheduleFsrs(
  input: FsrsInput,
  grade: Grade,
  now = new Date(),
  requestRetention = 0.9
): FsrsOutcome {
  const card = toCard(input, now);
  const result = getEngine(requestRetention).next(card, now, GRADE_TO_RATING[grade]);
  return {
    intervalDays: Math.max(0, result.card.scheduled_days),
    dueDate: result.card.due,
    difficulty: result.card.difficulty,
    stability: result.card.stability,
  };
}
