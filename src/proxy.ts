import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// The e2e job runs an ephemeral server with no Upstash configured, so every
// spec shares one client IP and the in-memory fallback counts the whole suite
// as a single client, 429ing it partway through. Opt in explicitly from the
// workflow rather than keying off CI, which would also disable the limiter
// during the unit tests that cover it.
//
// The NODE_ENV guard is the important half: this variable must never be
// honoured on a real deployment, or rate limiting is silently off in
// production. Vercel sets NODE_ENV=production for us.
const RATE_LIMIT_BYPASS =
  process.env.RATE_LIMIT_BYPASS === "1" && process.env.NODE_ENV !== "production";

if (process.env.RATE_LIMIT_BYPASS === "1" && process.env.NODE_ENV === "production") {
  console.warn(
    "[proxy] RATE_LIMIT_BYPASS is set but ignored: rate limiting stays enabled in production."
  );
}

function checkInMemoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  if (RATE_LIMIT_BYPASS) return true;
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

async function checkUpstashRateLimit(
  ratelimit: { limit: (identifier: string) => Promise<{ success: boolean }> },
  key: string
): Promise<boolean> {
  const { success } = await ratelimit.limit(key);
  return success;
}

function isSameOrigin(request: NextRequest): boolean {
  const method = request.method;
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(method)) return true;

  // Browsers always send Sec-Fetch-Site on cross-origin requests, and it
  // cannot be forged by page script. Prefer it.
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite) {
    return secFetchSite === "same-origin" || secFetchSite === "none";
  }

  // Fail closed when Origin is absent. Treating a missing Origin as trusted
  // made this check a no-op for any client that simply omits the header.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function clientIp(request: NextRequest): string | null {
  // Prefer the platform-set header, then the LAST X-Forwarded-For entry.
  // The first entry is client-supplied whenever the edge appends rather than
  // overwrites, which would let an attacker mint a fresh rate-limit bucket
  // per request by sending a random X-Forwarded-For.
  const candidates = [
    request.headers.get("x-vercel-forwarded-for"),
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-real-ip"),
  ];
  for (const header of candidates) {
    const value = header?.split(",").pop()?.trim();
    if (value) return value;
  }
  const xff = request.headers.get("x-forwarded-for")?.split(",").pop()?.trim();
  return xff || null;
}

const AUTH_ROUTES = ["/login", "/signup"];
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

const API_WRITE_LIMIT = 30;
const API_READ_LIMIT = 60;
const API_EXPENSIVE_LIMIT = 10;
const API_WINDOW_MS = 60_000;

const EXPENSIVE_API_ROUTES = ["/api/sync"];

let upstashAvailable = false;
let authRatelimit: { limit: (identifier: string) => Promise<{ success: boolean }> } | null = null;
let apiWriteRatelimit: { limit: (identifier: string) => Promise<{ success: boolean }> } | null = null;
let apiReadRatelimit: { limit: (identifier: string) => Promise<{ success: boolean }> } | null = null;
let apiExpensiveRatelimit: { limit: (identifier: string) => Promise<{ success: boolean }> } | null = null;

let upstashInitialized = false;
let upstashInitializing: Promise<void> | null = null;

async function initUpstash() {
  if (upstashInitialized) return;
  // Without this guard the two dynamic imports re-executed on every request
  // when Upstash was unconfigured.
  upstashInitializing ??= (async () => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      upstashAvailable = false;
      upstashInitialized = true;
      return;
    }
    try {
      const { Ratelimit } = await import("@upstash/ratelimit");
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({ url, token });
      authRatelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(RATE_LIMIT, "60 s"), analytics: false });
      apiWriteRatelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(API_WRITE_LIMIT, "60 s"), analytics: false });
      apiReadRatelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(API_READ_LIMIT, "60 s"), analytics: false });
      apiExpensiveRatelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(API_EXPENSIVE_LIMIT, "60 s"), analytics: false });
      upstashAvailable = true;
    } catch {
      upstashAvailable = false;
    }
    upstashInitialized = true;
  })();
  await upstashInitializing;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (method === "POST" || method === "PUT" || method === "DELETE") {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
    }
  }

  const ip = clientIp(request);

  await initUpstash();

  // Count credential submissions only. Charging GET /login and GET /signup
  // against the same 5-per-minute bucket meant that reloading the page a few
  // times replaced the form with a 429 JSON body, and any visitor behind one
  // shared address locked everyone else out.
  const isAuthSubmit =
    method === "POST" && AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  // Without a client identifier there is nothing to key a bucket on. Failing
  // closed would let anyone lock out every user behind a header-stripping
  // proxy, so skip limiting for this request instead of sharing one bucket.
  const limitable = ip !== null;

  if (limitable && isAuthSubmit) {
    let allowed = true;
    if (upstashAvailable && authRatelimit) {
      allowed = await checkUpstashRateLimit(authRatelimit, `auth:${ip}`);
    } else {
      allowed = checkInMemoryRateLimit(`auth:${ip}`, RATE_LIMIT, WINDOW_MS);
    }
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  if (pathname.startsWith("/api/") && limitable) {
    const isExpensive = EXPENSIVE_API_ROUTES.some((r) => pathname.startsWith(r));
    const isWrite = method === "POST" || method === "PUT" || method === "DELETE";

    if (isExpensive) {
      let allowed = true;
      if (upstashAvailable && apiExpensiveRatelimit) {
        allowed = await checkUpstashRateLimit(apiExpensiveRatelimit, `api-expensive:${ip}`);
      } else {
        allowed = checkInMemoryRateLimit(`api-expensive:${ip}`, API_EXPENSIVE_LIMIT, API_WINDOW_MS);
      }
      if (!allowed) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
    } else if (isWrite) {
      let allowed = true;
      if (upstashAvailable && apiWriteRatelimit) {
        allowed = await checkUpstashRateLimit(apiWriteRatelimit, `api-write:${ip}`);
      } else {
        allowed = checkInMemoryRateLimit(`api-write:${ip}`, API_WRITE_LIMIT, API_WINDOW_MS);
      }
      if (!allowed) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
    } else {
      let allowed = true;
      if (upstashAvailable && apiReadRatelimit) {
        allowed = await checkUpstashRateLimit(apiReadRatelimit, `api-read:${ip}`);
      } else {
        allowed = checkInMemoryRateLimit(`api-read:${ip}`, API_READ_LIMIT, API_WINDOW_MS);
      }
      if (!allowed) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup", "/api/:path*"],
};
