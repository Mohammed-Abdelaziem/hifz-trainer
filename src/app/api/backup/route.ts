import { isVerseKey } from "@/lib/quran/verse-key";
import { getSessionUser } from "@/lib/server/auth";
import { getDb } from "@/lib/db";
import { MAX_RETENTION, MIN_RETENTION } from "@/lib/srs/fsrs";
import {
  DEFAULT_RETENTION,
  DAILY_TARGET_MAX,
  DAILY_TARGET_MIN,
} from "@/lib/constants";
import type { MemoryState } from "@/types/quran";

export const dynamic = "force-dynamic";

export const BACKUP_FORMAT = "wholly-quran-backup";
export const BACKUP_VERSION = 1 as const;

const VALID_SCHEDULERS = new Set(["sm2", "fsrs"]);
const VALID_MEMORY_STATES = new Set<MemoryState>(["SABAQ", "SABQI", "MANZIL", "KNOWN"]);
// The Quran has 6,236 verses, so this bounds the array before anything
// expensive happens to it.
const MAX_MEMORY_STATES = 6500;

interface BackupProfile {
  scheduler: "sm2" | "fsrs";
  requestRetention: number;
  dailyTargetCount: number;
}

interface ExportedMemoryState {
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

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isOptionalDate(v: unknown): v is string | null {
  return v === null || v === undefined || (typeof v === "string" && !Number.isNaN(Date.parse(v)));
}

function isDate(v: unknown): v is string {
  return typeof v === "string" && !Number.isNaN(Date.parse(v));
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const db = await getDb();

    const [profile, rows] = await Promise.all([
      db.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          scheduler: true,
          requestRetention: true,
          dailyTargetCount: true,
        },
      }),
      db.userMemoryState.findMany({
        where: { userId: user.id },
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

    const backup = {
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

    return Response.json(backup, {
      headers: { "Content-Disposition": `attachment; filename="wholly-quran-backup.json"` },
    });
  } catch (err) {
    console.error("[/api/backup]", err);
    return Response.json({ error: "Failed to export backup" }, { status: 500 });
  }
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

function parseMemoryState(raw: unknown, userId: string): CreateMemoryStateData | null {
  if (typeof raw !== "object" || raw === null) return null;
  const item = raw as ImportMemoryStatePayload;
  if (typeof item.verseKey !== "string" || !isVerseKey(item.verseKey)) return null;
  if (typeof item.state !== "string" || !VALID_MEMORY_STATES.has(item.state as MemoryState)) {
    return null;
  }
  const intervalDays = isFiniteNumber(item.intervalDays) && item.intervalDays >= 0 ? item.intervalDays : 0;
  const easeFactor = isFiniteNumber(item.easeFactor) && item.easeFactor >= 1 && item.easeFactor <= 4 ? item.easeFactor : 2.5;
  const repetitionCount =
    isFiniteNumber(item.repetitionCount) && Number.isInteger(item.repetitionCount) && item.repetitionCount >= 0
      ? item.repetitionCount
      : 0;
  const lapses =
    isFiniteNumber(item.lapses) && Number.isInteger(item.lapses) && item.lapses >= 0 ? item.lapses : 0;
  const difficulty = isFiniteNumber(item.difficulty) ? item.difficulty : null;
  const stability = isFiniteNumber(item.stability) ? item.stability : null;
  const readCount =
    isFiniteNumber(item.readCount) && Number.isInteger(item.readCount) && item.readCount >= 0
      ? item.readCount
      : 0;
  if (!isDate(item.dueDate) || !isOptionalDate(item.lastReviewedAt) || !isOptionalDate(item.lastReadAt)) {
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

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as
      | { format?: unknown; version?: unknown; profile?: unknown; memoryStates?: unknown }
      | null;
    if (!body) return Response.json({ error: "Invalid JSON body" }, { status: 400 });

    if (body.format !== BACKUP_FORMAT) {
      return Response.json({ error: "Not a wholly-quran-backup file" }, { status: 400 });
    }
    if (body.version !== BACKUP_VERSION) {
      return Response.json(
        { error: `Unsupported backup version: ${String(body.version)}` },
        { status: 400 }
      );
    }

    // Profile is optional: an import that restores only memory states is fine.
    const profile = body.profile as BackupProfile | undefined;
    const profileData: Partial<BackupProfile> = {};
    if (profile !== undefined) {
      if (typeof profile !== "object" || profile === null) {
        return Response.json({ error: "profile must be an object" }, { status: 400 });
      }
      if (profile.scheduler !== undefined) {
        if (typeof profile.scheduler !== "string" || !VALID_SCHEDULERS.has(profile.scheduler)) {
          return Response.json(
            { error: "profile.scheduler must be 'sm2' or 'fsrs'" },
            { status: 400 }
          );
        }
        profileData.scheduler = profile.scheduler as "sm2" | "fsrs";
      }
      if (profile.requestRetention !== undefined) {
        const r = Number(profile.requestRetention);
        if (!Number.isFinite(r) || r < MIN_RETENTION || r > MAX_RETENTION) {
          return Response.json(
            { error: `profile.requestRetention must be between ${MIN_RETENTION} and ${MAX_RETENTION}` },
            { status: 400 }
          );
        }
        profileData.requestRetention = Math.round(r * 100) / 100;
      }
      if (profile.dailyTargetCount !== undefined) {
        const t = Number(profile.dailyTargetCount);
        if (!Number.isInteger(t) || t < DAILY_TARGET_MIN || t > DAILY_TARGET_MAX) {
          return Response.json(
            {
              error: `profile.dailyTargetCount must be between ${DAILY_TARGET_MIN} and ${DAILY_TARGET_MAX}`,
            },
            { status: 400 }
          );
        }
        profileData.dailyTargetCount = t;
      }
    }

    if (!Array.isArray(body.memoryStates)) {
      return Response.json({ error: "memoryStates array required" }, { status: 400 });
    }
    if (body.memoryStates.length > MAX_MEMORY_STATES) {
      return Response.json(
        { error: `memoryStates exceeds the maximum of ${MAX_MEMORY_STATES} entries` },
        { status: 400 }
      );
    }

    const parsed: CreateMemoryStateData[] = [];
    let skipped = 0;
    const seen = new Set<string>();
    for (const raw of body.memoryStates as unknown[]) {
      const item = parseMemoryState(raw, user.id);
      if (item === null) {
        skipped += 1;
        continue;
      }
      // Later entries win, matching re-imported edits.
      if (seen.has(item.verseKey)) {
        skipped += 1;
        continue;
      }
      seen.add(item.verseKey);
      parsed.push(item);
    }

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
        // The backup is authoritative for the keys it carries: existing rows
        // are replaced for those keys while the rest of the account is
        // untouched. MemoryState rows carry FKs to Verse, so unknown verse
        // keys (a backup from a corpus with rows this database lacks) land in
        // `skipped` before anything is written.
        await db.$transaction([
          db.userMemoryState.deleteMany({
            where: { userId: user.id, verseKey: { in: restorable.map((p) => p.verseKey) } },
          }),
          db.userMemoryState.createMany({ data: restorable, skipDuplicates: false }),
        ]);
        imported = restorable.length;
      }
    }

    let profileApplied = false;
    if (Object.keys(profileData).length > 0) {
      const db = await getDb();
      await db.user.update({ where: { id: user.id }, data: profileData });
      profileApplied = true;
    }

    return Response.json({ ok: true, imported, skipped, profileApplied });
  } catch (err) {
    console.error("[/api/backup]", err);
    return Response.json({ error: "Failed to import backup" }, { status: 500 });
  }
}

export type { BackupProfile, ExportedMemoryState };
