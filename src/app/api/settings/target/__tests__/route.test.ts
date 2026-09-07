import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

vi.mock("@/lib/server/auth", () => ({
  getSessionUser: vi.fn(),
}));

import { POST } from "@/app/api/settings/target/route";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/server/auth";

function makePostRequest(body: unknown) {
  return new Request("http://localhost/api/settings/target", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockUser = { id: "user-1", email: "test@test.com" };
const mockDb = {
  user: { update: vi.fn().mockResolvedValue({}) },
};

beforeEach(() => {
  vi.clearAllMocks();
  (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
  (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);
});

describe("/api/settings/target", () => {
  it("returns 401 when not authenticated", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await POST(makePostRequest({ dailyTargetCount: 10 }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new Request("http://localhost/api/settings/target", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when dailyTargetCount is missing", async () => {
    const res = await POST(makePostRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Nothing to update");
  });

  it("returns 400 for non-integer value", async () => {
    const res = await POST(makePostRequest({ dailyTargetCount: 10.5 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for value below minimum (4)", async () => {
    const res = await POST(makePostRequest({ dailyTargetCount: 4 }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("between 5 and 50");
  });

  it("returns 400 for value above maximum (51)", async () => {
    const res = await POST(makePostRequest({ dailyTargetCount: 51 }));
    expect(res.status).toBe(400);
  });

  it("accepts minimum value (5)", async () => {
    const res = await POST(makePostRequest({ dailyTargetCount: 5 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.dailyTargetCount).toBe(5);
  });

  it("accepts maximum value (50)", async () => {
    const res = await POST(makePostRequest({ dailyTargetCount: 50 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.dailyTargetCount).toBe(50);
  });

  it("updates DB with correct user ID", async () => {
    await POST(makePostRequest({ dailyTargetCount: 20 }));
    expect(mockDb.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { dailyTargetCount: 20 },
    });
  });

  it("returns 500 on DB failure", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db crash"));
    const res = await POST(makePostRequest({ dailyTargetCount: 10 }));
    expect(res.status).toBe(500);
  });

  it("returns 400 for string value", async () => {
    const res = await POST(makePostRequest({ dailyTargetCount: "ten" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for null value", async () => {
    const res = await POST(makePostRequest({ dailyTargetCount: null }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for boolean value", async () => {
    const res = await POST(makePostRequest({ dailyTargetCount: true }));
    expect(res.status).toBe(400);
  });
});
