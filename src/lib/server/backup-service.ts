import { isVerseKey } from "@/lib/quran/verse-key";
import { getDb } from "@/lib/db";
import { DEFAULT_RETENTION } from "@/lib/constants";
import type { MemoryState } from "@/types/quran";
import { validateProfileSettings } from "./validation";

export const BACKUP_FORMAT = "wholly-quran-backup";
export const BACKUP_VERSION = 1 as const;

const VALID_MEMORY_STATES = new Set<MemoryState>(["SABAQ", "SABQI", "MANZIL", "KNOWN"]);
const MAX_MEMORY_STATES = 6500;

export interface BackupProfile {
  scheduler: "sm2" | "fsrs";
  requestRetention: number;
  dailyTargetCount: number;
}

export interface ExportedMemoryState {
  verseKey: string;
  state: MemoryState;
  intervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  lapses: number;
  difficulty: number | null;
  stability: number | null;
  dueDate: string;
  lastReviewedAt: string | null;
  lastReadAt: string | null;
  readCount: number;
}

interface ImportMemoryStatePayload {
  verseKey?: unknown;
  state?: unknown;
  intervalDays?: unknown;
  easeFactor?: unknown;
  repetitionCount?: unknown;
  lapses?: unknown;
  difficulty?: unknown;
  stability?: unknown;
  dueDate?: unknown;
  lastReviewedAt?: unknown;
  lastReadAt?: unknown;
  readCount?: unknown;
}

interface CreateMemoryStateData {
  userId: string;
  verseKey: string;
  state: MemoryState;
  intervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  lapses: number;
  difficulty: number | null;
  stability: number | null;
  dueDate: Date;
  lastReviewedAt: Date | null;
  lastReadAt: Date | null;
  readCount: number;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isOptionalDate(v: unknown): v is string | null {
  return v === null || v === undefined || (typeof v === "string" && !Number.isNaN(Date.parse(v)));
}

function isDate(v: unknown): v is string {
  return typeof v === "string" && !Number.isNaN(Date.parse(v));
}

function parseMemoryState(raw: unknown, userId: string): CreateMemoryStateData | null {
  if (typeof raw !== "object" || raw === null) return null;
  const item = raw as ImportMemoryStatePayload;
  if (typeof item.verseKey !== "string" || !isVerseKey(item.verseKey)) return null;
  if (typeof item.state !== "string" || !VALID_MEMORY_STATES.has(item.state as MemoryState)) {
    return null;
  }
  const intervalDays =
    isFiniteNumber(item.intervalDays) && item.intervalDays >= 0 ? item.intervalDays : 0;
  const easeFactor =
    isFiniteNumber(item.easeFactor) && item.easeFactor >= 1 && item.easeFactor <= 4
      ? item.easeFactor
      : 2.5;
  const repetitionCount =
    isFiniteNumber(item.repetitionCount) &&
    Number.isInteger(item.repetitionCount) &&
    item.repetitionCount >= 0
      ? item.repetitionCount
      : 0;
  const lapses =
    isFiniteNumber(item.lapses) && Number.isInteger(item.lapses) && item.lapses >= 0
      ? item.lapses
      : 0;
  const difficulty = isFiniteNumber(item.difficulty) ? item.difficulty : null;
  const stability = isFiniteNumber(item.stability) ? item.stability : null;
  const readCount =
    isFiniteNumber(item.readCount) && Number.isInteger(item.readCount) && item.readCount >= 0
      ? item.readCount
      : 0;
  if (
    !isDate(item.dueDate) ||
    !isOptionalDate(item.lastReviewedAt) ||
    !isOptionalDate(item.lastReadAt)
  ) {
    return null;
  }
  return {
    userId,
    verseKey: item.verseKey,
    state: item.state as MemoryState,
    intervalDays,
    easeFactor,
    repetitionCount,
    lapses,
    difficulty,
    stability,
    dueDate: new Date(item.dueDate),
    lastReviewedAt: item.lastReviewedAt ? new Date(item.lastReviewedAt) : null,
    lastReadAt: item.lastReadAt ? new Date(item.lastReadAt) : null,
    readCount,
  };
}

export async function exportUserBackup(userId: string) {
  const db = await getDb();
  const [profile, rows] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        scheduler: true,
        requestRetention: true,
        dailyTargetCount: true,
      },
    }),
    db.userMemoryState.findMany({
      where: { userId, state: { not: "READ" } },
      orderBy: { verseKey: "asc" },
      select: {
        verseKey: true,
        state: true,
        intervalDays: true,
        easeFactor: true,
        repetitionCount: true,
        lapses: true,
        difficulty: true,
        stability: true,
        dueDate: true,
        lastReviewedAt: true,
        lastReadAt: true,
        readCount: true,
      },
    }),
  ]);

  const memoryStates: ExportedMemoryState[] = rows.map((r) => ({
    ...r,
    state: r.state as MemoryState,
    dueDate: r.dueDate.toISOString(),
    lastReviewedAt: r.lastReviewedAt ? r.lastReviewedAt.toISOString() : null,
    lastReadAt: r.lastReadAt ? r.lastReadAt.toISOString() : null,
  }));

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    profile: {
      scheduler: profile.scheduler === "fsrs" ? "fsrs" : "sm2",
      requestRetention: profile.requestRetention ?? DEFAULT_RETENTION,
      dailyTargetCount: profile.dailyTargetCount,
    } satisfies BackupProfile,
    memoryStates,
  };
}

export type ImportBackupResult =
  | { ok: true; imported: number; skipped: number; profileApplied: boolean }
  | { ok: false; error: string; status: 400 };

export async function importUserBackup(
  userId: string,
  body: { format?: unknown; version?: unknown; profile?: unknown; memoryStates?: unknown }
): Promise<ImportBackupResult> {
  if (body.format !== BACKUP_FORMAT) {
    return { ok: false, error: "Not a wholly-quran-backup file", status: 400 };
  }
  if (body.version !== BACKUP_VERSION) {
    return {
      ok: false,
      error: `Unsupported backup version: ${String(body.version)}`,
      status: 400,
    };
  }

  let profileData: Partial<BackupProfile> = {};
  if (body.profile !== undefined) {
    if (typeof body.profile !== "object" || body.profile === null) {
      return { ok: false, error: "profile must be an object", status: 400 };
    }
    const validated = validateProfileSettings(body.profile as Record<string, unknown>, "profile.");
    if (!validated.ok) {
      return { ok: false, error: validated.error, status: 400 };
    }
    profileData = validated.data;
  }

  if (!Array.isArray(body.memoryStates)) {
    return { ok: false, error: "memoryStates array required", status: 400 };
  }
  if (body.memoryStates.length > MAX_MEMORY_STATES) {
    return {
      ok: false,
      error: `memoryStates exceeds the maximum of ${MAX_MEMORY_STATES} entries`,
      status: 400,
    };
  }

  const byKey = new Map<string, CreateMemoryStateData>();
  let skipped = 0;
  for (const raw of body.memoryStates as unknown[]) {
    const item = parseMemoryState(raw, userId);
    if (item === null) {
      skipped += 1;
      continue;
    }
    if (byKey.has(item.verseKey)) {
      skipped += 1;
    }
    byKey.set(item.verseKey, item);
  }
  const parsed = [...byKey.values()];

  let imported = 0;
  if (parsed.length > 0) {
    const db = await getDb();
    const rows = await db.verse.findMany({
      where: { verseKey: { in: parsed.map((p) => p.verseKey) } },
      select: { verseKey: true },
    });
    const knownKeys = new Set(rows.map((r) => r.verseKey));
    const restorable = parsed.filter((p) => knownKeys.has(p.verseKey));
    skipped += parsed.length - restorable.length;

    if (restorable.length > 0) {
      await db.$transaction([
        db.userMemoryState.deleteMany({
          where: { userId, verseKey: { in: restorable.map((p) => p.verseKey) } },
        }),
        db.userMemoryState.createMany({ data: restorable, skipDuplicates: false }),
      ]);
      imported = restorable.length;
    }
  }

  let profileApplied = false;
  if (Object.keys(profileData).length > 0) {
    const db = await getDb();
    await db.user.update({ where: { id: userId }, data: profileData });
    profileApplied = true;
  }

  return { ok: true, imported, skipped, profileApplied };
}
