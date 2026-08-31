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
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const isAuthPage = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isAuthAction =
    method === "POST" &&
    (pathname === "/" || pathname.startsWith("/"));

  if (!isAuthPage && !isAuthAction) {
    return NextResponse.next();
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = `auth:${ip}`;
  const allowed = checkRateLimit(key, RATE_LIMIT, WINDOW_MS);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": "60" },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup", "/"],
};
