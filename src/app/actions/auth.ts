"use server";

import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
  recordFailedLogin,
  resetFailedLogins,
  revokeAllSessions,
} from "@/lib/server/auth";
import { ensureDemoUser, getOrCreateUser } from "@/lib/server/hifz-service";
import { getGoogleAuthUrl, getGitHubAuthUrl } from "@/lib/server/oauth";
import { getDbWithTest } from "@/lib/db";

export interface AuthState {
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function parseCredentials(formData: FormData): { email: string; password: string } | null {
  const rawEmail = formData.get("email");
  const password = formData.get("password");
  if (typeof rawEmail !== "string" || typeof password !== "string") return null;
  const email = rawEmail.toLowerCase().trim();
  if (!EMAIL_RE.test(email) || email.length > 254 || password.length < 12 || password.length > 128) {
    return null;
  }
  return { email, password };
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const creds = parseCredentials(formData);
  if (!creds) return { error: "Enter a valid email and a password (min 12 chars)." };

  const db = await getDbWithTest();
  const user = await db.user.findUnique({ where: { email: creds.email } });

  if (!user?.passwordHash) {
    // Record failed attempt even if user doesn't exist (constant-time)
    await recordFailedLogin(creds.email);
    return { error: "Incorrect email or password." };
  }

  // Check account lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
    return { error: `Account locked. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.` };
  }

  if (!(await verifyPassword(creds.password, user.passwordHash))) {
    const { locked, remainingAttempts } = await recordFailedLogin(creds.email);
    if (locked) {
      return { error: "Too many failed attempts. Account locked for 15 minutes." };
    }
    return { error: `Incorrect email or password. ${remainingAttempts} attempt${remainingAttempts !== 1 ? "s" : ""} remaining.` };
  }

  // Successful login — reset failed attempts and revoke old sessions
  await resetFailedLogins(user.id);
  await revokeAllSessions(user.id);
  await createSession(user.id);
  redirect("/");
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const creds = parseCredentials(formData);
  if (!creds) return { error: "Enter a valid email and a password (min 12 chars)." };

  const db = await getDbWithTest();
  const existing = await db.user.findUnique({ where: { email: creds.email } });
  if (existing?.passwordHash) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(creds.password);
  const user = existing
    ? await db.user.update({ where: { id: existing.id }, data: { passwordHash, lastPasswordChangedAt: new Date() } })
    : await db.user.create({ data: { email: creds.email, passwordHash, lastPasswordChangedAt: new Date() } });

  await createSession(user.id, true);
  redirect("/");
}

export async function demoSignInAction(): Promise<void> {
  const demoEmail = `demo-${randomBytes(8).toString("hex")}@hifz.local`;
  const demoPassword = randomBytes(16).toString("hex");
  await ensureDemoUser(demoEmail, await hashPassword(demoPassword));
  const user = await getOrCreateUser(demoEmail);
  await createSession(user.id, true);
  redirect("/");
}

export async function guestSignInAction(): Promise<void> {
  // Guest mode is now client-side only — just redirect to home
  redirect("/");
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function googleSignInAction(): Promise<void> {
  const url = getGoogleAuthUrl();
  redirect(url);
}

export async function githubSignInAction(): Promise<void> {
  const url = getGitHubAuthUrl();
  redirect(url);
}
