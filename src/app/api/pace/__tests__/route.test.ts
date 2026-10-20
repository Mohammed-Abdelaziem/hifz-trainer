import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

import { GET } from "../route";
import { getSessionUser } from "@/lib/server/auth";
import { getDb } from "@/lib/db";

describe("/api/pace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for unauthenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("counts marked verses against the deployed corpus size", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue({
      userMemoryState: { count: vi.fn().mockResolvedValue(17) },
      verse: { count: vi.fn().mockResolvedValue(6236) },
    });
    const res = await GET();
    const data = await res.json();
    expect(data.memorized).toBe(17);
    expect(data.total).toBe(6236);
    expect(
      (getDb as ReturnType<typeof vi.fn>).mock.calls.length
    ).toBeGreaterThan(0);
  });

  it("stays self-consistent on a partial corpus (tests, staging)", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue({
      userMemoryState: { count: vi.fn().mockResolvedValue(4) },
      verse: { count: vi.fn().mockResolvedValue(11) },
    });
    const res = await GET();
    const data = await res.json();
    expect(data.memorized).toBe(4);
    expect(data.total).toBe(11);
  });

  it("returns 500 when the db throws", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    (getDb as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db down"));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});
