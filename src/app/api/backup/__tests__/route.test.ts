import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

import { GET, POST, BACKUP_FORMAT } from "../route";
import { getSessionUser } from "@/lib/server/auth";
import { getDb } from "@/lib/db";

const iso = "2026-01-15T10:00:00.000Z";

function backupBody(overrides: Record<string, unknown> = {}) {
  return {
    format: BACKUP_FORMAT,
    version: 1,
    profile: { scheduler: "fsrs", requestRetention: 0.85, dailyTargetCount: 12 },
    memoryStates: [
      {
        verseKey: "112:1",
        state: "KNOWN",
        intervalDays: 30,
        easeFactor: 2.6,
        repetitionCount: 5,
        lapses: 1,
        difficulty: 4.2,
        stability: 33,
        dueDate: iso,
        lastReviewedAt: iso,
        lastReadAt: iso,
        readCount: 9,
      },
    ],
    ...overrides,
  };
}

function postReq(payload: unknown) {
  return new Request("http://localhost/api/backup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

describe("/api/backup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("returns 401 for unauthenticated users", async () => {
      (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it("exports profile plus memory states with ISO dates", async () => {
      (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
      (getDb as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: {
          findUniqueOrThrow: vi.fn().mockResolvedValue({
            scheduler: "sm2",
            requestRetention: 0.9,
            dailyTargetCount: 10,
          }),
        },
        userMemoryState: {
          findMany: vi.fn().mockResolvedValue([
            {
              verseKey: "112:1",
              state: "KNOWN",
              intervalDays: 20,
              easeFactor: 2.5,
              repetitionCount: 3,
              lapses: 0,
              difficulty: null,
              stability: 21,
              dueDate: new Date(iso),
              lastReviewedAt: new Date(iso),
              lastReadAt: null,
              readCount: 4,
            },
          ]),
        },
      });

      const res = await GET();
      const data = await res.json();
      expect(data.format).toBe("wholly-quran-backup");
      expect(data.version).toBe(1);
      expect(data.profile.scheduler).toBe("sm2");
      expect(data.memoryStates).toHaveLength(1);
      expect(data.memoryStates[0].dueDate).toBe(iso);
      expect(data.memoryStates[0].lastReadAt).toBeNull();
      expect(res.headers.get("content-disposition")).toContain("wholly-quran-backup.json");
    });

    it("returns 500 when the db throws", async () => {
      (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
      (getDb as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db down"));
      const res = await GET();
      expect(res.status).toBe(500);
    });
  });

  describe("POST validation", () => {
    beforeEach(() => {
      (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    });

    it("returns 401 for unauthenticated users", async () => {
      (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const res = await POST(postReq(backupBody()));
      expect(res.status).toBe(401);
    });

    it("requires 400 for bodies without the backup format marker", async () => {
      const res = await POST(postReq({ version: 1 }));
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("wholly-quran-backup");
    });

    it("rejects unknown versions", async () => {
      const res = await POST(postReq(backupBody({ version: 99 })));
      expect(res.status).toBe(400);
    });

    it("rejects invalid profile values", async () => {
      const res = await POST(
        postReq(backupBody({ profile: { scheduler: "bogus" } }))
      );
      expect(res.status).toBe(400);
    });

    it("requires the memoryStates array", async () => {
      const res = await POST(postReq(backupBody({ memoryStates: undefined })));
      expect(res.status).toBe(400);
    });

    it("rejects oversized arrays", async () => {
      const huge = Array.from({ length: 7000 }, () => ({
        verseKey: "112:1",
        state: "KNOWN",
        dueDate: iso,
      }));
      const res = await POST(postReq(backupBody({ memoryStates: huge })));
      expect(res.status).toBe(400);
    });
  });

  describe("POST import", () => {
    let tx: Array<unknown>;

    function okDb() {
      tx = [];
      const db = {
        verse: {
          findMany: vi.fn().mockResolvedValue([{ verseKey: "112:1" }]),
        },
        userMemoryState: {
          deleteMany: vi.fn().mockImplementation(() => {
            tx.push("delete");
            return Promise.resolve({});
          }),
          createMany: vi.fn().mockImplementation(() => {
            tx.push("create");
            return Promise.resolve({});
          }),
        },
        user: { update: vi.fn().mockResolvedValue({}) },
        $transaction: vi.fn().mockImplementation((ops) => Promise.resolve(ops)),
      };
      (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);
      return db;
    }

    it("imports valid rows after the verse-existence check and replaces them", async () => {
      const db = okDb();
      const res = await POST(postReq(backupBody()));
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.imported).toBe(1);
      expect(data.skipped).toBe(0);
      expect(data.profileApplied).toBe(true);
      expect(db.userMemoryState.deleteMany).toHaveBeenCalledWith({
        where: { userId: "u1", verseKey: { in: ["112:1"] } },
      });
      expect(db.userMemoryState.createMany).toHaveBeenCalledWith({
        data: [expect.objectContaining({ verseKey: "112:1", state: "KNOWN", userId: "u1" })],
        skipDuplicates: false,
      });
      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { scheduler: "fsrs", requestRetention: 0.85, dailyTargetCount: 12 },
      });
    });

    it("skips malformed rows and unknown verse keys", async () => {
      okDb();
      const body = backupBody({
        memoryStates: [
          { verseKey: "112:1", state: "KNOWN", dueDate: iso },
          { verseKey: "not-a-key", state: "KNOWN", dueDate: iso },
          { verseKey: "112:2", state: "BOGUS", dueDate: iso },
          { verseKey: "112:2", state: "KNOWN", dueDate: "not-a-date" },
          null,
          // Same verseKey twice in one file: the duplicate is dropped.
          { verseKey: "112:1", state: "SABQI", dueDate: iso },
        ],
      });
      const res = await POST(postReq(body));
      const data = await res.json();
      expect(data.imported).toBe(1);
      expect(data.skipped).toBe(5);
      expect(tx).toEqual(["delete", "create"]);
    });

    it("imports only memory states when no profile is present", async () => {
      const db = okDb();
      const body = backupBody();
      delete (body as { profile?: unknown }).profile;
      const res = await POST(postReq(body));
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.profileApplied).toBe(false);
      expect(db.user.update).not.toHaveBeenCalled();
    });
    it("does not touch the store when every row was skipped", async () => {
      const db = okDb();
      const res = await POST(
        postReq(
          backupBody({
            memoryStates: [{ verseKey: "112:9", state: "KNOWN", dueDate: iso }],
          })
        )
      );
      const data = await res.json();
      expect(data.imported).toBe(0);
      expect(data.skipped).toBe(1);
      expect(db.userMemoryState.deleteMany).not.toHaveBeenCalled();
      expect(db.userMemoryState.createMany).not.toHaveBeenCalled();
    });

    it("returns 500 when the db throws", async () => {
      (getDb as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db down"));
      const res = await POST(postReq(backupBody()));
      expect(res.status).toBe(500);
    });
  });
});
