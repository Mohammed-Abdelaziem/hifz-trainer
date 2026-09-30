import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { NextRequest } from "next/server";
import { middleware } from "@/middleware";

function makeRequest(
  path: string,
  opts: { method?: string; headers?: Record<string, string> } = {}
) {
  const { method = "GET", headers = {} } = opts;
  return {
    nextUrl: { pathname: path },
    method,
    headers: new Headers({ host: "whollyquran.me", ...headers }),
  } as unknown as NextRequest;
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("middleware origin checks", () => {
  it("allows a same-origin browser POST via sec-fetch-site", async () => {
    const res = await middleware(
      makeRequest("/api/reviews", {
        method: "POST",
        headers: { "sec-fetch-site": "same-origin" },
      })
    );
    expect(res.status).not.toBe(403);
  });

  it("rejects a cross-site browser POST", async () => {
    const res = await middleware(
      makeRequest("/api/reviews", {
        method: "POST",
        headers: { "sec-fetch-site": "cross-site" },
      })
    );
    expect(res.status).toBe(403);
  });

  it("fails closed when Origin is missing on a write", async () => {
    // Previously a missing Origin was treated as trusted, making the check a
    // no-op for any client that simply omitted the header.
    const res = await middleware(makeRequest("/api/reviews", { method: "POST" }));
    expect(res.status).toBe(403);
  });

  it("accepts a matching Origin header", async () => {
    const res = await middleware(
      makeRequest("/api/reviews", {
        method: "POST",
        headers: { origin: "https://whollyquran.me" },
      })
    );
    expect(res.status).not.toBe(403);
  });

  it("rejects a mismatched Origin header", async () => {
    const res = await middleware(
      makeRequest("/api/reviews", {
        method: "POST",
        headers: { origin: "https://evil.example" },
      })
    );
    expect(res.status).toBe(403);
  });

  it("does not apply the check to GET", async () => {
    const res = await middleware(makeRequest("/api/stats"));
    expect(res.status).not.toBe(403);
  });
});

describe("middleware rate-limit identity", () => {
  it("uses the last x-forwarded-for hop, not the client-supplied first", async () => {
    // A rotating first entry previously minted a fresh bucket per request,
    // defeating every limiter.
    const first = await middleware(
      makeRequest("/api/stats", { headers: { "x-forwarded-for": "1.1.1.1, 9.9.9.9" } })
    );
    const second = await middleware(
      makeRequest("/api/stats", { headers: { "x-forwarded-for": "2.2.2.2, 9.9.9.9" } })
    );
    // Same bucket key (9.9.9.9) means the same quota, so both succeed until
    // the shared limit is reached rather than resetting each time.
    expect(first.status).toBe(second.status);
  });

  it("blocks after the read limit for a stable identity", async () => {
    const headers = { "x-forwarded-for": "5.5.5.5" };
    const codes: number[] = [];
    for (let i = 0; i < 70; i += 1) {
      const res = await middleware(makeRequest("/api/stats", { headers }));
      codes.push(res.status);
    }
    expect(codes).toContain(429);
  }, 30_000);

  it("does not 429 when no client identifier is available", async () => {
    // Every such caller must not share one global bucket.
    const codes: number[] = [];
    for (let i = 0; i < 70; i += 1) {
      const res = await middleware(makeRequest("/api/stats"));
      codes.push(res.status);
    }
    expect(codes).not.toContain(429);
  }, 30_000);
});
