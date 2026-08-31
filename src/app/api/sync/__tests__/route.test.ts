import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/server/guest", () => ({
  isGuestSession: vi.fn(),
}));

vi.mock("@/lib/server/quran-sync", () => ({
  getSyncStatus: vi.fn(),
  syncFullQuran: vi.fn(),
}));

vi.mock("@/lib/server/ayah-data", () => ({
  bulkWarmAyahData: vi.fn(),
}));

import { GET, POST } from "../route";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";
import { getSyncStatus, syncFullQuran } from "@/lib/server/quran-sync";

describe("/api/sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (isGuestSession as ReturnType<typeof vi.fn>).mockResolvedValue(false);
  });

  it("GET returns sync status", async () => {
    (getSyncStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      syncedAt: new Date("2026-08-31T00:00:00Z"),
      count: 114,
    });
    const res = await GET();
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.count).toBe(114);
  });

  it("POST returns ok:synced:0 for unauthenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const req = new Request("http://localhost/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.synced).toBe(0);
  });

  it("POST syncs for authenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    (syncFullQuran as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      synced: 5,
    });

    const req = new Request("http://localhost/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.synced).toBe(5);
    expect(syncFullQuran).toHaveBeenCalled();
  });
});
