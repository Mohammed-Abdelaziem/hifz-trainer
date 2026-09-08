import { getDbWithTest } from "@/lib/db";
import { createSession } from "./auth";

function getBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  return "http://localhost:3000";
}

// ── Google OAuth ──────────────────────────────────────────────

export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: `${getBaseUrl()}/api/auth/callback/google`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(code: string): Promise<{
  email: string;
  name: string;
  picture?: string;
}> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: `${getBaseUrl()}/api/auth/callback/google`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) throw new Error("Failed to exchange Google code");
  const { access_token } = await tokenRes.json();

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userRes.ok) throw new Error("Failed to fetch Google user info");
  const profile = await userRes.json();

  return {
    email: profile.email.toLowerCase(),
    name: profile.name,
    picture: profile.picture,
  };
}

// ── GitHub OAuth ──────────────────────────────────────────────

export function getGitHubAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID ?? "",
    redirect_uri: `${getBaseUrl()}/api/auth/callback/github`,
    scope: "read:user user:email",
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function exchangeGitHubCode(code: string): Promise<{
  email: string;
  name: string;
  picture?: string;
}> {
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID ?? "",
      client_secret: process.env.GITHUB_CLIENT_SECRET ?? "",
      code,
      redirect_uri: `${getBaseUrl()}/api/auth/callback/github`,
    }),
  });

  if (!tokenRes.ok) throw new Error("Failed to exchange GitHub code");
  const { access_token } = await tokenRes.json();

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
  const primaryEmail = emails.find((e: { primary: boolean; verified: boolean }) => e.primary && e.verified)?.email;

  if (!primaryEmail) throw new Error("No verified email found on GitHub");

  return {
    email: primaryEmail.toLowerCase(),
    name: profile.name || profile.login,
    picture: profile.avatar_url,
  };
}

// ── Shared: find or create user + create session ──────────────

export async function findOrCreateOAuthUser(
  provider: string,
  profile: { email: string; name: string; picture?: string }
): Promise<string> {
  const db = await getDbWithTest();

  // Find existing user by email
  let user = await db.user.findUnique({ where: { email: profile.email } });

  if (user) {
    // User exists — create session
    const token = await createSession(user.id, true);
    return token;
  }

  // Create new user (no password for OAuth users)
  user = await db.user.create({
    data: {
      email: profile.email,
      // No passwordHash — OAuth users authenticate via provider
    },
  });

  const token = await createSession(user.id, true);
  return token;
}
