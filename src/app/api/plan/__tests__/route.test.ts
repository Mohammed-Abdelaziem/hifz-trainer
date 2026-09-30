import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/server/hifz-service", () => ({
  addToSabaq: vi.fn(),
}));

import { POST } from "@/app/api/plan/route";
import { getSessionUser } from "@/lib/server/auth";
import { addToSabaq } from "@/lib/server/hifz-service";
import { SABAQ_BATCH_MAX } from "@/lib/constants";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const addToSabaqMock = addToSabaq as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1", role: "user" });
  addToSabaqMock.mockResolvedValue({ added: 1, skipped: 0 });
});

describe("/api/plan", () => {
  it("returns 401 for unauthenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await POST(makeRequest({ verseKeys: ["1:1"] }));
    expect(res.status).toBe(401);
    expect(addToSabaqMock).not.toHaveBeenCalled();
  });

  it("adds explicit verse keys", async () => {
    const res = await POST(makeRequest({ verseKeys: ["1:1", "1:2"] }));
    expect(res.status).toBe(200);
    expect(addToSabaqMock).toHaveBeenCalledWith({
      userId: "u1",
      verseKeys: ["1:1", "1:2"],
    });
  });

  it("expands a surah range", async () => {
    await POST(makeRequest({ surahId: 1, fromAyah: 1, toAyah: 4 }));
    expect(addToSabaqMock).toHaveBeenCalledWith({
      userId: "u1",
      verseKeys: ["1:1", "1:2", "1:3", "1:4"],
    });
  });

  it("defaults a single-ayah range", async () => {
    await POST(makeRequest({ surahId: 112, toAyah: 3 }));
    expect(addToSabaqMock).toHaveBeenCalledWith({
      userId: "u1",
      verseKeys: ["112:1", "112:2", "112:3"],
    });
  });

  it("rejects an out-of-range surah", async () => {
    const res = await POST(makeRequest({ surahId: 115, fromAyah: 1, toAyah: 2 }));
    expect(res.status).toBe(400);
    expect(addToSabaqMock).not.toHaveBeenCalled();
  });

  it("rejects an inverted ayah range", async () => {
    const res = await POST(makeRequest({ surahId: 1, fromAyah: 5, toAyah: 2 }));
    expect(res.status).toBe(400);
  });

  it("rejects an ayah number beyond the largest in the Quran", async () => {
    const res = await POST(makeRequest({ surahId: 1, fromAyah: 1, toAyah: 500 }));
    expect(res.status).toBe(400);
  });

  it("rejects a range larger than the batch cap", async () => {
    const res = await POST(makeRequest({ surahId: 2, fromAyah: 1, toAyah: 200 }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain(String(SABAQ_BATCH_MAX));
  });

  it("rejects a key list larger than the batch cap", async () => {
    const keys = Array.from({ length: SABAQ_BATCH_MAX + 1 }, (_, i) => `1:${i + 1}`);
    const res = await POST(makeRequest({ verseKeys: keys }));
    expect(res.status).toBe(400);
  });

  it("rejects a malformed body", async () => {
    const res = await POST(
      new Request("http://localhost/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      })
    );
    expect(res.status).toBe(400);
  });

  it("rejects a body with neither keys nor a range", async () => {
    const res = await POST(makeRequest({ nothing: true }));
    expect(res.status).toBe(400);
  });

  it("drops keys that do not match surah:ayah", async () => {
    const res = await POST(makeRequest({ verseKeys: ["1:1", "nope", "1:2"] }));
    expect(res.status).toBe(200);
    expect(addToSabaqMock).toHaveBeenCalledWith({
      userId: "u1",
      verseKeys: ["1:1", "1:2"],
    });
  });

  it("returns 400 when every key is malformed", async () => {
    const res = await POST(makeRequest({ verseKeys: ["nope", "also bad"] }));
    expect(res.status).toBe(400);
  });

  it("reports how many were added and skipped", async () => {
    addToSabaqMock.mockResolvedValue({ added: 3, skipped: 2 });
    const res = await POST(makeRequest({ verseKeys: ["1:1"] }));
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, added: 3, skipped: 2 });
  });

  it("returns 500 when the service throws", async () => {
    addToSabaqMock.mockRejectedValue(new Error("db down"));
    const res = await POST(makeRequest({ verseKeys: ["1:1"] }));
    expect(res.status).toBe(500);
  });
});
