import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkInMemoryRateLimit(key: string, limit: number, windowMs: number): boolean {
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
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true;
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

const AUTH_ROUTES = ["/login", "/signup"];
const AUTH_ACTION_ROUTES = ["/login", "/"];
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

async function initUpstash() {
  if (upstashAvailable) return;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    upstashAvailable = false;
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
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (method === "POST" || method === "PUT" || method === "DELETE") {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
    }
  }

  await initUpstash();

  const isAuthPage = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isAuthAction = method === "POST" && AUTH_ACTION_ROUTES.some((r) => pathname === r);

  if (isAuthPage || isAuthAction) {
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

  if (pathname.startsWith("/api/")) {
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
