import { getDb } from "@/lib/db";
import { isVerseKey } from "@/lib/quran/verse-key";
import { DAY_MS, KNOWN_REVISION_INTERVAL_DAYS } from "@/lib/constants";
import { ensureMissingSurahsForKeys } from "./corpus-seeder";

/**
 * Inserts verses into the user's Sabaq (new-memorization) bucket.
 */
export async function addToSabaq(params: {
  userId: string;
  verseKeys: string[];
}): Promise<{ added: number; invalid: number; duplicate: number }> {
  const db = await getDb();
  const now = new Date();

  const keys = [...new Set(params.verseKeys)].filter((k) => isVerseKey(k));
  if (keys.length === 0) return { added: 0, invalid: 0, duplicate: 0 };

  let existingVerses = await db.verse.findMany({
    where: { verseKey: { in: keys } },
    select: { verseKey: true },
  });
  if (existingVerses.length < keys.length) {
    const foundSet = new Set(existingVerses.map((v) => v.verseKey));
    await ensureMissingSurahsForKeys(
      db,
      keys.filter((k) => !foundSet.has(k))
    );
    existingVerses = await db.verse.findMany({
      where: { verseKey: { in: keys } },
      select: { verseKey: true },
    });
  }
  const valid = existingVerses.map((v) => v.verseKey);
  const invalid = keys.length - valid.length;
  if (valid.length === 0) return { added: 0, invalid, duplicate: 0 };

  const alreadyTracked = await db.userMemoryState.findMany({
    where: { userId: params.userId, verseKey: { in: valid } },
    select: { verseKey: true, state: true },
  });
  const trackedActive = new Set(
    alreadyTracked.filter((s) => s.state !== "READ").map((s) => s.verseKey)
  );
  const readOnlyKeys = alreadyTracked
    .filter((s) => s.state === "READ")
    .map((s) => s.verseKey);
  const readOnlySet = new Set(readOnlyKeys);
  const toCreate = valid.filter((k) => !trackedActive.has(k) && !readOnlySet.has(k));

  if (readOnlyKeys.length > 0) {
    await db.userMemoryState.updateMany({
      where: { userId: params.userId, verseKey: { in: readOnlyKeys }, state: "READ" },
      data: { state: "SABAQ", dueDate: now },
    });
  }

  if (toCreate.length > 0) {
    await db.userMemoryState.createMany({
      data: toCreate.map((verseKey) => ({
        userId: params.userId,
        verseKey,
        state: "SABAQ",
        dueDate: now,
      })),
      skipDuplicates: true,
    });
  }

  const added = toCreate.length + readOnlyKeys.length;
  return { added, invalid, duplicate: valid.length - added };
}

export interface KnownMarkResult {
  changed: number;
  created: number;
  alreadyKnown: number;
  untouched: number;
  invalid: number;
}

/**
 * Labels a set of verses as already memorized (or removes that label).
 */
export async function markKnown(params: {
  userId: string;
  verseKeys: string[];
  known: boolean;
}): Promise<KnownMarkResult> {
  const db = await getDb();
  const now = new Date();

  const keys = [...new Set(params.verseKeys)].filter((k) => isVerseKey(k));
  const empty: KnownMarkResult = {
    changed: 0,
    created: 0,
    alreadyKnown: 0,
    untouched: 0,
    invalid: keys.length,
  };
  if (keys.length === 0) return empty;

  const states = await db.userMemoryState.findMany({
    where: { userId: params.userId, verseKey: { in: keys } },
    select: { verseKey: true, state: true },
  });
  const statesByKey = new Map(states.map((s) => [s.verseKey, s.state]));

  if (params.known) {
    const untrackedKeys = keys.filter((k) => !statesByKey.has(k));
    let creatableKeys: string[] = [];
    let invalid = 0;
    if (untrackedKeys.length > 0) {
      let found = await db.verse.findMany({
        where: { verseKey: { in: untrackedKeys } },
        select: { verseKey: true },
      });
      if (found.length < untrackedKeys.length) {
        const foundSet = new Set(found.map((f) => f.verseKey));
        await ensureMissingSurahsForKeys(
          db,
          untrackedKeys.filter((k) => !foundSet.has(k))
        );
        found = await db.verse.findMany({
          where: { verseKey: { in: untrackedKeys } },
          select: { verseKey: true },
        });
      }
      const foundKeys = new Set(found.map((f) => f.verseKey));
      creatableKeys = untrackedKeys.filter((k) => foundKeys.has(k));
      invalid = untrackedKeys.length - creatableKeys.length;
    }

    const toChange: string[] = [];
    let already = 0;
    for (const [verseKey, state] of statesByKey) {
      if (state === "KNOWN") already += 1;
      else toChange.push(verseKey);
    }
    const toCreate = [...toChange, ...creatableKeys];
    if (toCreate.length > 0) {
      await db.$transaction([
        ...(toChange.length > 0
          ? [
              db.userMemoryState.deleteMany({
                where: { userId: params.userId, verseKey: { in: toChange } },
              }),
            ]
          : []),
        db.userMemoryState.createMany({
          data: toCreate.map((verseKey) => ({
            userId: params.userId,
            verseKey,
            state: "KNOWN",
            intervalDays: KNOWN_REVISION_INTERVAL_DAYS,
            dueDate: new Date(now.getTime() + KNOWN_REVISION_INTERVAL_DAYS * DAY_MS),
            repetitionCount: 1,
            lastReviewedAt: now,
          })),
          skipDuplicates: true,
        }),
      ]);
    }
    return {
      changed: toChange.length,
      created: creatableKeys.length,
      alreadyKnown: already,
      untouched: 0,
      invalid,
    };
  }

  let cleared = 0;
  let untouched = 0;
  for (const [, state] of statesByKey) {
    if (state === "KNOWN") cleared += 1;
    else untouched += 1;
  }
  if (cleared > 0) {
    const knownKeys = states
      .filter((s) => s.state === "KNOWN")
      .map((s) => s.verseKey);
    await db.userMemoryState.deleteMany({
      where: { userId: params.userId, verseKey: { in: knownKeys } },
    });
  }
  return {
    changed: cleared,
    created: 0,
    alreadyKnown: 0,
    untouched,
    invalid: keys.length - states.length,
  };
}
