import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/server/guest", () => ({
  isGuestSession: vi.fn(),
}));

vi.mock("@/lib/server/hifz-service", () => ({
  buildMemoryMap: vi.fn(),
}));

import { GET } from "../route";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";
import { buildMemoryMap } from "@/lib/server/hifz-service";

describe("/api/memory-map", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (isGuestSession as ReturnType<typeof vi.fn>).mockResolvedValue(false);
  });

  it("returns empty verses for unauthenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await GET();
    const data = await res.json();
    expect(data.verses).toEqual([]);
  });

  it("returns populated memory map", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    (buildMemoryMap as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, verseKey: "1:1", hifzState: "SABAQI", easeFactor: 2.5, nextReviewAt: new Date("2026-09-01T00:00:00Z") },
    ]);

    const res = await GET();
    const data = await res.json();
    expect(data.verses).toHaveLength(1);
    expect(data.verses[0].verseKey).toBe("1:1");
    expect(buildMemoryMap).toHaveBeenCalledWith("u1");
  });

  it("returns 500 on DB failure", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    (buildMemoryMap as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("down"));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});
