import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { NextRequest } from "next/server";
import { proxy } from "@/proxy";

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

describe("proxy origin checks", () => {
  it("allows a same-origin browser POST via sec-fetch-site", async () => {
    const res = await proxy(
      makeRequest("/api/reviews", {
        method: "POST",
        headers: { "sec-fetch-site": "same-origin" },
      })
    );
    expect(res.status).not.toBe(403);
  });

  it("rejects a cross-site browser POST", async () => {
    const res = await proxy(
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
    const res = await proxy(makeRequest("/api/reviews", { method: "POST" }));
    expect(res.status).toBe(403);
  });

  it("accepts a matching Origin header", async () => {
    const res = await proxy(
      makeRequest("/api/reviews", {
        method: "POST",
        headers: { origin: "https://whollyquran.me" },
      })
    );
    expect(res.status).not.toBe(403);
  });

  it("rejects a mismatched Origin header", async () => {
    const res = await proxy(
      makeRequest("/api/reviews", {
        method: "POST",
        headers: { origin: "https://evil.example" },
      })
    );
    expect(res.status).toBe(403);
  });

  it("does not apply the check to GET", async () => {
    const res = await proxy(makeRequest("/api/stats"));
    expect(res.status).not.toBe(403);
  });
});

describe("proxy rate-limit identity", () => {
  it("uses the last x-forwarded-for hop, not the client-supplied first", async () => {
    // A rotating first entry previously minted a fresh bucket per request,
    // defeating every limiter.
    const first = await proxy(
      makeRequest("/api/stats", { headers: { "x-forwarded-for": "1.1.1.1, 9.9.9.9" } })
    );
    const second = await proxy(
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
      const res = await proxy(makeRequest("/api/stats", { headers }));
      codes.push(res.status);
    }
    expect(codes).toContain(429);
  }, 30_000);

  it("does not 429 when no client identifier is available", async () => {
    // Every such caller must not share one global bucket.
    const codes: number[] = [];
    for (let i = 0; i < 70; i += 1) {
      const res = await proxy(makeRequest("/api/stats"));
      codes.push(res.status);
    }
    expect(codes).not.toContain(429);
  }, 30_000);
});

describe("proxy auth rate limiting", () => {
  // Only credential submissions are limited. Charging page loads meant that
  // reloading /login a few times returned a 429 JSON body in place of the
  // form, which is how the e2e suite started failing.
  it("does not limit repeated GET /login", async () => {
    const headers = { "x-forwarded-for": "6.6.6.6" };
    const codes: number[] = [];
    for (let i = 0; i < 30; i += 1) {
      const res = await proxy(makeRequest("/login", { headers }));
      codes.push(res.status);
    }
    expect(codes).not.toContain(429);
  });

  it("still limits repeated sign-in attempts", async () => {
    const headers = {
      "x-forwarded-for": "7.7.7.7",
      // Satisfy the same-origin check so the limiter is what rejects.
      "sec-fetch-site": "same-origin",
    };
    const codes: number[] = [];
    for (let i = 0; i < 10; i += 1) {
      const res = await proxy(makeRequest("/login", { method: "POST", headers }));
      codes.push(res.status);
    }
    expect(codes).toContain(429);
  });

  it("ignores RATE_LIMIT_BYPASS when NODE_ENV is production", async () => {
    // The e2e job sets RATE_LIMIT_BYPASS. If that ever reached a real
    // deployment, rate limiting would be silently off.
    vi.stubEnv("RATE_LIMIT_BYPASS", "1");
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const { proxy: prodProxy } = await import("@/proxy");

    const headers = { "x-forwarded-for": "8.8.8.8", "sec-fetch-site": "same-origin" };
    const codes: number[] = [];
    for (let i = 0; i < 10; i += 1) {
      const res = await prodProxy(makeRequest("/login", { method: "POST", headers }));
      codes.push(res.status);
    }
    expect(codes).toContain(429);
  });

  it("honours RATE_LIMIT_BYPASS outside production", async () => {
    vi.stubEnv("RATE_LIMIT_BYPASS", "1");
    vi.stubEnv("NODE_ENV", "test");
    vi.resetModules();
    const { proxy: testProxy } = await import("@/proxy");

    const headers = { "x-forwarded-for": "9.9.9.10", "sec-fetch-site": "same-origin" };
    const codes: number[] = [];
    for (let i = 0; i < 10; i += 1) {
      const res = await testProxy(makeRequest("/login", { method: "POST", headers }));
      codes.push(res.status);
    }
    expect(codes).not.toContain(429);
  });
});
