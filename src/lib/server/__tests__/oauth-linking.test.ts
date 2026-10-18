import { describe, expect, it, vi, beforeEach } from "vitest";
import { findOrCreateOAuthUser, OAuthAccountConflictError } from "@/lib/server/oauth";
import { createSession } from "@/lib/server/auth";
import { getDbWithTest } from "@/lib/db";

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }),
}));

vi.mock("@/lib/server/auth", () => ({
  createSession: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/db", () => ({
  getDbWithTest: vi.fn(),
}));

const db = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  (getDbWithTest as ReturnType<typeof vi.fn>).mockResolvedValue(db);
});

describe("findOrCreateOAuthUser — password-account linking guard", () => {
  it("refuses to sign a provider identity into an email-matched password account", async () => {
    db.user.findUnique.mockResolvedValue({ id: "victim", email: "a@b.co", passwordHash: "x" });

    await expect(
      findOrCreateOAuthUser("google", { email: "a@b.co", name: "A" })
    ).rejects.toBeInstanceOf(OAuthAccountConflictError);

    // No session is minted for the attacker's provider identity.
    expect(createSession).not.toHaveBeenCalled();
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it("still signs in an OAuth-only account with no password", async () => {
    db.user.findUnique.mockResolvedValue({ id: "u1", email: "a@b.co", passwordHash: null });

    await findOrCreateOAuthUser("google", { email: "a@b.co", name: "A" });

    expect(createSession).toHaveBeenCalledWith("u1", true);
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it("creates a fresh account for an unknown email", async () => {
    db.user.findUnique.mockResolvedValue(null);
    db.user.create.mockResolvedValue({ id: "u2", email: "new@b.co" });

    await findOrCreateOAuthUser("github", { email: "new@b.co", name: "N" });

    expect(db.user.create).toHaveBeenCalledWith({ data: { email: "new@b.co" } });
    expect(createSession).toHaveBeenCalledWith("u2", true);
  });
});
