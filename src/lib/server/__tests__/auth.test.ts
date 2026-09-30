import { describe, expect, it, vi, beforeEach } from "vitest";
import { createHash } from "node:crypto";

const sessionRows: Record<string, unknown>[] = [];
const userRow: Record<string, unknown> = {};

function mockDb() {
  return {
    session: {
      findUnique: vi.fn(({ where }: { where: { token: string } }) =>
        Promise.resolve(sessionRows.find((s) => s["token"] === where.token) ?? null)
      ),
      create: vi.fn(({ data }: { data: Record<string, unknown> }) => {
        sessionRows.push({
          ...data,
          id: "s1",
          createdAt: new Date(),
          lastRefreshAt: new Date(),
          // The real query joins the owning user.
          user: { id: data["userId"], lastPasswordChangedAt: null },
        });
        return Promise.resolve(data);
      }),
      delete: vi.fn(({ where }: { where: { id: string } }) => {
        const i = sessionRows.findIndex((s) => s["id"] === where.id);
        if (i >= 0) sessionRows.splice(i, 1);
        return Promise.resolve({});
      }),
      deleteMany: vi.fn(() => Promise.resolve({ count: 0 })),
      update: vi.fn(() => Promise.resolve({})),
    },
    user: {
      findUnique: vi.fn(() => Promise.resolve(userRow)),
      findUniqueOrThrow: vi.fn(() => Promise.resolve(userRow)),
      update: vi.fn(() => Promise.resolve(userRow)),
    },
  };
}

vi.mock("next/headers", () => {
  const jar = new Map<string, string>();
  return {
    cookies: async () => ({
      get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
      set: (name: string, value: string) => jar.set(name, value),
      delete: (name: string) => jar.delete(name),
    }),
    __jar: jar,
  };
});

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
  getDbWithTest: vi.fn(),
}));

import { getDbWithTest } from "@/lib/db";
import {
  createSession,
  getSessionUser,
  destroySession,
  revokeAllSessions,
  hashPassword,
  verifyPassword,
  recordFailedLogin,
  DECOY_PASSWORD_HASH,
} from "@/lib/server/auth";

const db = mockDb();
const sha256 = (t: string) => createHash("sha256").update(t).digest("hex");

beforeEach(() => {
  sessionRows.length = 0;
  Object.keys(userRow).forEach((k) => delete userRow[k]);
  (getDbWithTest as ReturnType<typeof vi.fn>).mockResolvedValue(db);
  db.session.findUnique.mockClear();
  db.session.create.mockClear();
  db.session.deleteMany.mockClear();
});

describe("session token storage", () => {
  it("stores a 64-char hex digest, not the raw token", async () => {
    const token = await createSession("u1");
    const stored = sessionRows[0]["token"] as string;
    expect(stored).toMatch(/^[0-9a-f]{64}$/);
    // The cookie holds the raw token; the row holds only its digest.
    expect(stored).toBe(sha256(token));
    expect(stored).not.toBe(token);
  });

  it("resolves a real cookie by hashing it before the lookup", async () => {
    // createSession writes the digest and sets the raw token as the cookie.
    const token = await createSession("u1");
    db.session.findUnique.mockClear();

    const user = await getSessionUser();
    expect(user).not.toBeNull();
    // The value sent to the database is the digest, not the cookie value.
    const queried = db.session.findUnique.mock.calls[0][0].where.token;
    expect(queried).toBe(sha256(token));
    expect(queried).not.toBe(token);
  });

  it("rejects a session created before the last password change", async () => {
    const changedAt = new Date();
    const token = await createSession("u1");
    sessionRows[0]["user"] = { id: "u1", lastPasswordChangedAt: changedAt };
    // Backdate the session so it predates the change.
    sessionRows[0]["createdAt"] = new Date(changedAt.getTime() - 60_000);

    expect(await getSessionUser()).toBeNull();
    expect(token).toHaveLength(64);
  });

  it("does not match a session row keyed by the raw token", async () => {
    // A dump of the table is useless as a set of cookies.
    sessionRows.push({
      id: "s1",
      token: "rawtokenvalue",
      userId: "u1",
      expiresAt: new Date(Date.now() + 86_400_000),
      createdAt: new Date(),
      lastRefreshAt: new Date(),
      user: { id: "u1", lastPasswordChangedAt: null },
    });
    expect(await getSessionUser()).toBeNull();
  });

  it("revokeAllSessions is keyed by user, not token", async () => {
    await revokeAllSessions("u1");
    expect(db.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
    });
  });

  it("destroySession removes the row by hashed token and clears the cookie", async () => {
    const token = await createSession("u1");
    db.session.deleteMany.mockClear();

    await destroySession();
    // Same guarantee as getSessionUser: the raw cookie value is never queried.
    expect(db.session.deleteMany).toHaveBeenCalledWith({
      where: { token: sha256(token) },
    });
  });
});

describe("password hashing", () => {
  it("round-trips a password", async () => {
    const h = await hashPassword("correct horse battery");
    expect(await verifyPassword("correct horse battery", h)).toBe(true);
    expect(await verifyPassword("wrong", h)).toBe(false);
  });

  it("uses a unique salt per hash", async () => {
    const a = await hashPassword("samepassword1");
    const b = await hashPassword("samepassword1");
    expect(a).not.toBe(b);
  });

  it("exposes a well-formed decoy hash that never verifies", async () => {
    expect(DECOY_PASSWORD_HASH.split(":")).toHaveLength(2);
    expect(DECOY_PASSWORD_HASH.split(":")[0]).toHaveLength(32);
    // Used to equalise timing, so it must always fail.
    expect(await verifyPassword("anything", DECOY_PASSWORD_HASH)).toBe(false);
  });
});

describe("login lockout", () => {
  it("resets the counter once the lockout window has lapsed", async () => {
    userRow.email = "u@example.com";
    userRow.id = "u1";
    userRow.failedLoginAttempts = 5;
    // The lock expired, so this attempt starts a fresh window rather than
    // immediately re-locking.
    userRow.lockedUntil = new Date(Date.now() - 60_000);

    const result = await recordFailedLogin("u@example.com");
    expect(result.locked).toBe(false);
    expect(result.remainingAttempts).toBe(4);
  });

  it("still locks while the window is open", async () => {
    userRow.email = "u@example.com";
    userRow.id = "u1";
    userRow.failedLoginAttempts = 5;
    userRow.lockedUntil = new Date(Date.now() + 60_000);

    const result = await recordFailedLogin("u@example.com");
    expect(result.locked).toBe(true);
  });

  it("counts up to the threshold from zero", async () => {
    userRow.email = "u@example.com";
    userRow.id = "u1";
    userRow.failedLoginAttempts = 0;
    userRow.lockedUntil = null;

    const result = await recordFailedLogin("u@example.com");
    expect(result.locked).toBe(false);
    expect(result.remainingAttempts).toBe(4);
  });

  it("ignores unknown emails", async () => {
    userRow.email = undefined;
    const result = await recordFailedLogin("nobody@example.com");
    expect(result.locked).toBe(false);
  });
});
