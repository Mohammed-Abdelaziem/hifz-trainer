import type { Grade, MemoryState, SchedulerKind } from "@/types/quran";
import { DEFAULT_RETENTION } from "@/lib/constants";
import { NEW_MEMORY_STATE, schedule as scheduleSm2, type Sm2Input } from "./sm2";
import { scheduleFsrs, type FsrsInput } from "./fsrs";
import { applyHifzRouting } from "./routing";

export interface SchedulerStateInput {
  state: MemoryState;
  intervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  lapses: number;
  difficulty: number | null;
  stability: number | null;
}

export interface ScheduleOutcome {
  state: MemoryState;
  intervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  lapses: number;
  difficulty: number | null;
  stability: number | null;
  dueDate: Date;
}

export interface ScheduleOptions {
  now?: Date;
  requestRetention?: number;
}

export interface SrsScheduler {
  readonly kind: SchedulerKind;
  schedule(prev: SchedulerStateInput | null, grade: Grade, opts?: ScheduleOptions): ScheduleOutcome;
}

function nextLapses(prev: SchedulerStateInput | null, grade: Grade): number {
  const prevState = prev?.state ?? "SABAQ";
  return grade === "AGAIN" && prevState !== "SABAQ"
    ? (prev?.lapses ?? 0) + 1
    : (prev?.lapses ?? 0);
}

const sm2Scheduler: SrsScheduler = {
  kind: "sm2",
  schedule(prev, grade, opts) {
    const now = opts?.now ?? new Date();
    const input: Sm2Input = prev
      ? {
          easeFactor: prev.easeFactor,
          intervalDays: prev.intervalDays,
          repetitionCount: prev.repetitionCount,
          state: prev.state,
        }
      : NEW_MEMORY_STATE;
    const outcome = scheduleSm2(input, grade, now);
    return {
      state: outcome.state,
      intervalDays: outcome.intervalDays,
      easeFactor: outcome.easeFactor,
      repetitionCount: outcome.repetitionCount,
      lapses: nextLapses(prev, grade),
      difficulty: null,
      stability: null,
      dueDate: outcome.dueDate,
    };
  },
};

const fsrsScheduler: SrsScheduler = {
  kind: "fsrs",
  schedule(prev, grade, opts) {
    const now = opts?.now ?? new Date();
    const retention = opts?.requestRetention ?? DEFAULT_RETENTION;
    const prevState = prev?.state ?? "SABAQ";
    const input: FsrsInput = {
      difficulty: prev?.difficulty ?? 0,
      stability: prev?.stability ?? 0,
      repetitionCount: prev?.repetitionCount ?? 0,
      lapses: prev?.lapses ?? 0,
    };
    const out = scheduleFsrs(input, grade, now, retention);
    return {
      state: applyHifzRouting(prevState, grade, out.intervalDays),
      intervalDays: out.intervalDays,
      easeFactor: prev?.easeFactor ?? 2.5,
      repetitionCount: input.repetitionCount + 1,
      lapses: nextLapses(prev, grade),
      difficulty: out.difficulty,
      stability: out.stability,
      dueDate: out.dueDate,
    };
  },
};

const SCHEDULERS: Record<SchedulerKind, SrsScheduler> = {
  sm2: sm2Scheduler,
  fsrs: fsrsScheduler,
};

export function getScheduler(kind: SchedulerKind): SrsScheduler {
  return SCHEDULERS[kind] ?? sm2Scheduler;
}

export function scheduleReview(
  kind: SchedulerKind,
  prev: SchedulerStateInput | null,
  grade: Grade,
  opts?: ScheduleOptions
): ScheduleOutcome {
  return getScheduler(kind).schedule(prev, grade, opts);
}
