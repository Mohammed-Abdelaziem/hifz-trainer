import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
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

const AUTH_ROUTES = ["/login", "/signup"];
const AUTH_ACTION_ROUTES = ["/login", "/"];
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

const API_WRITE_LIMIT = 30;
const API_READ_LIMIT = 60;
const API_EXPENSIVE_LIMIT = 10;
const API_WINDOW_MS = 60_000;

const EXPENSIVE_API_ROUTES = ["/api/tajweed", "/api/sync"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Auth rate limiting
  const isAuthPage = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isAuthAction =
    method === "POST" &&
    AUTH_ACTION_ROUTES.some((r) => pathname === r);

  if (isAuthPage || isAuthAction) {
    const key = `auth:${ip}`;
    const allowed = checkRateLimit(key, RATE_LIMIT, WINDOW_MS);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // API rate limiting
  if (pathname.startsWith("/api/")) {
    const isExpensive = EXPENSIVE_API_ROUTES.some((r) => pathname.startsWith(r));
    const isWrite = method === "POST" || method === "PUT" || method === "DELETE";

    if (isExpensive) {
      const key = `api-expensive:${ip}`;
      if (!checkRateLimit(key, API_EXPENSIVE_LIMIT, API_WINDOW_MS)) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
    } else if (isWrite) {
      const key = `api-write:${ip}`;
      if (!checkRateLimit(key, API_WRITE_LIMIT, API_WINDOW_MS)) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
    } else {
      const key = `api-read:${ip}`;
      if (!checkRateLimit(key, API_READ_LIMIT, API_WINDOW_MS)) {
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
