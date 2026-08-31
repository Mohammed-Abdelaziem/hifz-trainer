import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/server/guest", () => ({
  isGuestSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

import { GET, POST } from "../route";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";
import { getDb } from "@/lib/db";

describe("/api/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (isGuestSession as ReturnType<typeof vi.fn>).mockResolvedValue(false);
  });

  it("GET returns defaults for unauthenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await GET();
    const data = await res.json();
    expect(data.scheduler).toBe("sm2");
    expect(data.requestRetention).toBe(0.9);
  });

  it("GET returns actual settings for authenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", scheduler: "fsrs", requestRetention: 0.85 });
    const res = await GET();
    const data = await res.json();
    expect(data.scheduler).toBe("fsrs");
    expect(data.requestRetention).toBe(0.85);
  });

  it("GET normalizes non-fsrs scheduler to sm2", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", scheduler: "other", requestRetention: 0.9 });
    const res = await GET();
    const data = await res.json();
    expect(data.scheduler).toBe("sm2");
  });

  it("POST returns ok for unauthenticated users (no-op)", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const req = new Request("http://localhost/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduler: "fsrs" }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("POST validates scheduler value", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    const req = new Request("http://localhost/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduler: "invalid" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("POST validates requestRetention bounds", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    const req = new Request("http://localhost/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestRetention: 2.0 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("POST rejects empty body", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    const req = new Request("http://localhost/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("POST updates settings for authenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    const db = {
      user: {
        update: vi.fn().mockResolvedValue({}),
        findUniqueOrThrow: vi.fn().mockResolvedValue({ scheduler: "fsrs", requestRetention: 0.85 }),
      },
    };
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);

    const req = new Request("http://localhost/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduler: "fsrs", requestRetention: 0.85 }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.scheduler).toBe("fsrs");
    expect(data.requestRetention).toBe(0.85);
  });
});
