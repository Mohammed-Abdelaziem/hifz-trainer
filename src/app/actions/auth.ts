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
  DECOY_PASSWORD_HASH,
  purgeExpiredSessions,
} from "@/lib/server/auth";
import { getGoogleAuthUrl, getGitHubAuthUrl, createOAuthState } from "@/lib/server/oauth";
import { isStrongPassword, PASSWORD_RULES_MESSAGE } from "@/lib/server/password";
import { getDbWithTest } from "@/lib/db";
import { Prisma } from "../../../generated/prisma";

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

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const creds = parseCredentials(formData);
  if (!creds) return { error: "Enter a valid email and a password (min 12 chars)." };

  const db = await getDbWithTest();
  const user = await db.user.findUnique({ where: { email: creds.email } });

  if (!user?.passwordHash) {
    // Still run a verification against a decoy so an unknown address costs the
    // same ~150ms of scrypt as a known one; otherwise response latency
    // enumerates registered emails.
    await verifyPassword(creds.password, DECOY_PASSWORD_HASH);
    await recordFailedLogin(creds.email);
    return { error: "Incorrect email or password." };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    // Deliberately identical to a wrong-password failure: a distinct "locked"
    // response would confirm the account exists to anyone willing to spam it.
    return { error: "Incorrect email or password." };
  }

  if (!(await verifyPassword(creds.password, user.passwordHash))) {
    const { locked } = await recordFailedLogin(creds.email);
    if (locked) {
      return { error: "Incorrect email or password." };
    }
    return { error: "Incorrect email or password." };
  }

  await resetFailedLogins(user.id);
  await revokeAllSessions(user.id);
  await createSession(user.id);
  // Opportunistic sweep: sessions are otherwise only ever removed when their
  // own token is presented or the user signs out again.
  void purgeExpiredSessions();
  redirect("/");
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const creds = parseCredentials(formData);
  if (!creds) return { error: "Enter a valid email and a password (min 12 chars)." };

  const db = await getDbWithTest();

  if (!isStrongPassword(creds.password)) {
    return { error: PASSWORD_RULES_MESSAGE };
  }

  const registerOrAcceptExisting = async (): Promise<AuthState | null> => {
    const existing = await db.user.findUnique({ where: { email: creds.email } });
    if (existing?.passwordHash) {
      // Pretend success so the response can't be used to enumerate which
      // addresses hold password accounts; burn the same scrypt cost a real
      // signup would so latency doesn't leak either.
      await verifyPassword(creds.password, DECOY_PASSWORD_HASH);
      return { success: true };
    }
    // An account created through OAuth has no passwordHash. Attaching one here
    // would let anyone who knows the address take the account over, so require
    // the user to sign in with their provider first and set a password from
    // /settings, where the session is already verified.
    if (existing) {
      return {
        success: false,
        error: "This email uses a social login. Sign in with that provider to continue.",
      };
    }
    return null;
  };

  const preExisting = await registerOrAcceptExisting();
  if (preExisting) return preExisting;

  try {
    const passwordHash = await hashPassword(creds.password);
    const user = await db.user.create({
      data: { email: creds.email, passwordHash, lastPasswordChangedAt: new Date() },
    });

    await createSession(user.id, true);
    redirect("/");
  } catch (err) {
    // Lost a create race: by now a row with this address exists, so apply the
    // exact same policy as a pre-existing account (P2002 is a unique violation,
    // anything else is a real failure).
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const raced = await registerOrAcceptExisting();
      if (raced) return raced;
    }
    throw err;
  }
}

export async function signOutAction(): Promise<void> {
  const user = await (await import("@/lib/server/auth")).getSessionUser();
  if (user) {
    await revokeAllSessions(user.id);
  }
  await destroySession();
  redirect("/login");
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
