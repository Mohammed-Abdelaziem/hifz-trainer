"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/server/auth";
import { ensureDemoUser, getOrCreateUser } from "@/lib/server/hifz-service";
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
  if (!EMAIL_RE.test(email) || email.length > 254 || password.length < 8 || password.length > 128) {
    return null;
  }
  return { email, password };
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const creds = parseCredentials(formData);
  if (!creds) return { error: "Enter a valid email and a password (min 8 chars)." };

  const db = await getDbWithTest();
  const user = await db.user.findUnique({ where: { email: creds.email } });
  if (!user?.passwordHash || !(await verifyPassword(creds.password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const creds = parseCredentials(formData);
  if (!creds) return { error: "Enter a valid email and a password (min 8 chars)." };

  const db = await getDbWithTest();
  const existing = await db.user.findUnique({ where: { email: creds.email } });
  if (existing?.passwordHash) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(creds.password);
  const user = existing
    ? await db.user.update({ where: { id: existing.id }, data: { passwordHash } })
    : await db.user.create({ data: { email: creds.email, passwordHash } });

  await createSession(user.id);
  redirect("/");
}

export async function demoSignInAction(): Promise<void> {
  await ensureDemoUser(await hashPassword("demo1234"));
  const user = await getOrCreateUser();
  await createSession(user.id);
  redirect("/");
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
