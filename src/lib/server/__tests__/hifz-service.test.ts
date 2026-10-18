import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "@/lib/db";
import { markKnown } from "../hifz-service";

type Row = Partial<{
  verseKey: string;
  state: string;
}>;

function makeDb(states: Row[], verseTable: string[] = []) {
  const created: Record<string, unknown>[] = [];
  const deletedWhere: unknown[] = [];
  const db = {
    userMemoryState: {
      findMany: vi.fn().mockResolvedValue(states),
      deleteMany: vi.fn((args: {
        where: { userId: string; verseKey: unknown };
      }) => {
        deletedWhere.push(args);
        return Promise.resolve({ count: 0 });
      }),
      createMany: vi.fn((args: { data: Record<string, unknown>[] }) => {
        created.push(...args.data);
        return Promise.resolve({ count: args.data.length });
      }),
    },
    verse: {
      findMany: vi.fn().mockResolvedValue(
        verseTable.map((verseKey) => ({ verseKey }))
      ),
    },
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  };
  (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
  return { db, created, deletedWhere };
}

describe("markKnown", () => {
  beforeEach(() => {
    (getDb as ReturnType<typeof vi.fn>).mockReset();
  });

  it("labels existing non-KNOWN rows KNOWN and reports the rest", async () => {
    const { db, created, deletedWhere } = makeDb([
      { verseKey: "112:1", state: "SABAQ" },
      { verseKey: "112:2", state: "SABQI" },
      { verseKey: "112:3", state: "KNOWN" },
    ]);

    const result = await markKnown({
      userId: "u1",
      verseKeys: ["112:1", "112:2", "112:3"],
      known: true,
    });

    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(deletedWhere).toEqual([
      { where: { userId: "u1", verseKey: { in: ["112:1", "112:2"] } } },
    ]);
    expect(created).toHaveLength(2);
    expect(new Set(created.map((c) => (c as { verseKey: string }).verseKey))).toEqual(
      new Set(["112:1", "112:2"])
    );
    for (const row of created) {
      expect((row as { state: string }).state).toBe("KNOWN");
    }
    expect(result).toEqual({
      changed: 2,
      created: 0,
      alreadyKnown: 1,
      untouched: 0,
      invalid: 0,
    });
  });

  it("de-duplicates repeated verse keys", async () => {
    const { db } = makeDb([], ["112:1"]);
    const result = await markKnown({
      userId: "u1",
      verseKeys: ["112:1", "112:1", "112:1"],
      known: true,
    });
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(result.created).toBe(1);
  });

  it("creates rows for untracked verses the user already memorized", async () => {
    const { created } = makeDb([], ["112:1", "112:2"]);

    const result = await markKnown({
      userId: "u1",
      verseKeys: ["112:1", "112:2", "4:177"],
      known: true,
    });

    expect(result.created).toBe(2);
    expect(result.invalid).toBe(1);
    expect(created).toHaveLength(2);
    for (const row of created) {
      expect((row as { state: string }).state).toBe("KNOWN");
    }
  });

  it("returns all-zero and marks everything invalid when nothing matches", async () => {
    const { db } = makeDb([], []);

    const result = await markKnown({
      userId: "u1",
      verseKeys: ["4:177", "5:160"],
      known: true,
    });

    expect(db.$transaction).not.toHaveBeenCalled();
    expect(result).toEqual({
      changed: 0,
      created: 0,
      alreadyKnown: 0,
      untouched: 0,
      invalid: 2,
    });
  });

  it("removes only KNOWN rows on unmark, leaving active hifz intact", async () => {
    const { deletedWhere, created } = makeDb([
      { verseKey: "1:1", state: "SABAQ" },
      { verseKey: "1:2", state: "KNOWN" },
      { verseKey: "1:3", state: "MANZIL" },
    ]);

    const result = await markKnown({
      userId: "u1",
      verseKeys: ["1:1", "1:2", "1:3", "1:4"],
      known: false,
    });

    expect(deletedWhere).toEqual([
      { where: { userId: "u1", verseKey: { in: ["1:2"] } } },
    ]);
    expect(created).toHaveLength(0);
    expect(result).toEqual({
      changed: 1,
      created: 0,
      alreadyKnown: 0,
      untouched: 2,
      invalid: 1,
    });
  });
});
