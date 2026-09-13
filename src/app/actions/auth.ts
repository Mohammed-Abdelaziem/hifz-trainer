"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
  recordFailedLogin,
  resetFailedLogins,
  revokeAllSessions,
} from "@/lib/server/auth";
import { getGoogleAuthUrl, getGitHubAuthUrl, createOAuthState } from "@/lib/server/oauth";
import { getDbWithTest } from "@/lib/db";

export interface AuthState {
  error?: string;
  success?: boolean;
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

function isStrongPassword(pw: string): boolean {
  if (pw.length < 12 || pw.length > 128) return false;
  let categories = 0;
  if (/[A-Z]/.test(pw)) categories++;
  if (/[a-z]/.test(pw)) categories++;
  if (/[0-9]/.test(pw)) categories++;
  if (/[^A-Za-z0-9]/.test(pw)) categories++;
  return categories >= 3;
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const creds = parseCredentials(formData);
  if (!creds) return { error: "Enter a valid email and a password (min 12 chars)." };

  const db = await getDbWithTest();
  const user = await db.user.findUnique({ where: { email: creds.email } });

  if (!user?.passwordHash) {
    await recordFailedLogin(creds.email);
    return { error: "Incorrect email or password." };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { error: "Account is temporarily locked. Please try again later." };
  }

  if (!(await verifyPassword(creds.password, user.passwordHash))) {
    const { locked } = await recordFailedLogin(creds.email);
    if (locked) {
      return { error: "Account is temporarily locked. Please try again later." };
    }
    return { error: "Incorrect email or password." };
  }

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
    return { success: true, error: undefined };
  }

  const passwordHash = await hashPassword(creds.password);
  const user = existing
    ? await db.user.update({ where: { id: existing.id }, data: { passwordHash, lastPasswordChangedAt: new Date() } })
    : await db.user.create({ data: { email: creds.email, passwordHash, lastPasswordChangedAt: new Date() } });

  await createSession(user.id, true);
  redirect("/");
}

export async function guestSignInAction(): Promise<void> {
  redirect("/");
}

export async function signOutAction(): Promise<void> {
  const user = await (await import("@/lib/server/auth")).getSessionUser();
  if (user) {
    await revokeAllSessions(user.id);
  }
  await destroySession();
  redirect("/login");
}

export interface PasswordChangeState {
  error?: string;
  success?: boolean;
}

export async function changePasswordAction(
  _prev: PasswordChangeState,
  formData: FormData
): Promise<PasswordChangeState> {
  const oldPassword = formData.get("oldPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof oldPassword !== "string" || typeof newPassword !== "string" || typeof confirmPassword !== "string") {
    return { error: "All fields are required." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  if (!isStrongPassword(newPassword)) {
    return { error: "Password must be 12+ characters with at least 3 of: uppercase, lowercase, digit, symbol." };
  }

  const { getSessionUser } = await import("@/lib/server/auth");
  const user = await getSessionUser();
  if (!user) return { error: "You must be signed in." };

  const db = await getDbWithTest();
  const fullUser = await db.user.findUnique({ where: { id: user.id } });
  if (!fullUser?.passwordHash) return { error: "No password set for this account." };

  if (!(await verifyPassword(oldPassword, fullUser.passwordHash))) {
    return { error: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(newPassword);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash, lastPasswordChangedAt: new Date() },
  });
  await revokeAllSessions(user.id);
  await createSession(user.id);

  return { success: true };
}

export async function googleSignInAction(): Promise<void> {
  const state = await createOAuthState();
  const url = getGoogleAuthUrl(state);
  redirect(url);
}

export async function githubSignInAction(): Promise<void> {
  const state = await createOAuthState();
  const url = getGitHubAuthUrl(state);
  redirect(url);
}
