import { randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getDbWithTest } from "@/lib/db";
import { createSession } from "./auth";

const OAUTH_STATE_COOKIE = "hifz_oauth_state";
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

// ── State parameter (CSRF protection) ────────────────────────

export async function createOAuthState(): Promise<string> {
  const state = randomBytes(32).toString("hex");
  const jar = await cookies();
  jar.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
    path: "/",
    maxAge: OAUTH_STATE_TTL_MS / 1000,
  });
  return state;
}

export async function validateOAuthState(state: string | null): Promise<boolean> {
  if (!state) return false;
  const jar = await cookies();
  const stored = jar.get(OAUTH_STATE_COOKIE)?.value;
  jar.delete(OAUTH_STATE_COOKIE);
  if (!stored || stored.length !== state.length) return false;
  return timingSafeEqual(Buffer.from(stored), Buffer.from(state));
}

// ── Google OAuth ──────────────────────────────────────────────

export function getGoogleAuthUrl(state: string): string {
  if (!process.env.GOOGLE_CLIENT_ID) throw new Error("GOOGLE_CLIENT_ID not set");
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${getBaseUrl()}/api/auth/callback/google`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(code: string): Promise<{
  email: string;
  name: string;
  picture?: string;
}> {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials not configured");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: `${getBaseUrl()}/api/auth/callback/google`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) throw new Error("Failed to exchange Google code");
  const { access_token } = await tokenRes.json();
  if (!access_token) throw new Error("No access_token from Google");

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userRes.ok) throw new Error("Failed to fetch Google user info");
  const profile = await userRes.json();

  if (profile.verified_email === false) {
    throw new Error("Google email is not verified");
  }

  return {
    email: profile.email.toLowerCase(),
    name: profile.name || "",
    picture: profile.picture,
  };
}

// ── GitHub OAuth ──────────────────────────────────────────────

export function getGitHubAuthUrl(state: string): string {
  if (!process.env.GITHUB_CLIENT_ID) throw new Error("GITHUB_CLIENT_ID not set");
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: `${getBaseUrl()}/api/auth/callback/github`,
    scope: "read:user user:email",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function exchangeGitHubCode(code: string): Promise<{
  email: string;
  name: string;
  picture?: string;
}> {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    throw new Error("GitHub OAuth credentials not configured");
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${getBaseUrl()}/api/auth/callback/github`,
    }),
  });

  if (!tokenRes.ok) throw new Error("Failed to exchange GitHub code");
  const { access_token } = await tokenRes.json();
  if (!access_token) throw new Error("No access_token from GitHub");

  const [userRes, emailsRes] = await Promise.all([
    fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    }),
    fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${access_token}` },
    }),
  ]);

  if (!userRes.ok) throw new Error("Failed to fetch GitHub user info");
  const profile = await userRes.json();

  const emails = await emailsRes.json();
  const primaryEmail = emails.find(
    (e: { primary: boolean; verified: boolean }) => e.primary && e.verified
  )?.email;

  if (!primaryEmail) throw new Error("No verified email found on GitHub");

  return {
    email: primaryEmail.toLowerCase(),
    name: profile.name || profile.login || "",
    picture: profile.avatar_url,
  };
}

// ── Shared: find or create user + create session ──────────────

export async function findOrCreateOAuthUser(
  provider: string,
  profile: { email: string; name: string; picture?: string }
): Promise<void> {
  const db = await getDbWithTest();

  // Find existing user by email
  let user = await db.user.findUnique({ where: { email: profile.email } });

  if (user) {
    // User exists — create session
    await createSession(user.id, true);
    return;
  }

  // Create new user (no password for OAuth users)
  user = await db.user.create({
    data: {
      email: profile.email,
      // No passwordHash — OAuth users authenticate via provider
    },
  });

  await createSession(user.id, true);
}
