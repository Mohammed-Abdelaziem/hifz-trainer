import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import type { User } from "../../../generated/prisma";
import { getDbWithTest } from "@/lib/db";

const scryptAsync = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

export const SESSION_COOKIE = "hifz_session";
const SESSION_TTL_DAYS = 30;
const KEY_LEN = 64;
// maxmem must be stated explicitly: OpenSSL's 32MB default is below what
// N=65536,r=8 requires (128*N*r = 64MB), so scrypt throws
// "memory limit exceeded" in any process with the default limit.
const SCRYPT_OPTIONS = { N: 65536, r: 8, p: 1, maxmem: 128 * 1024 * 1024 } as const;

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const SLIDING_REFRESH_INTERVAL_MS = 60 * 60 * 1000; // refresh cookie every 1 hour

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, KEY_LEN, SCRYPT_OPTIONS);
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = await scryptAsync(password, salt, KEY_LEN, SCRYPT_OPTIONS);
  const expected = Buffer.from(hash, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

/**
 * Sessions are stored hashed so a database dump yields no replayable cookies.
 * SHA-256 (not scrypt) is correct here: the token is 256 bits of CSPRNG
 * output, so there is nothing to brute-force and lookups must stay indexed.
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Compared against a real hash for unknown addresses so the scrypt cost is
// paid either way; otherwise response latency reveals which emails exist.
const DECOY_HASH =
  "00000000000000000000000000000000:" +
  "0000000000000000000000000000000000000000000000000000000000000000" +
  "0000000000000000000000000000000000000000000000000000000000000000" +
  "00000000000000000000000000000000";

/**
 * Valid-shaped hash of a value nobody can supply, used to equalise the cost of
 * a sign-in attempt against an unregistered address.
 */
export const DECOY_PASSWORD_HASH = DECOY_HASH;

/** Removes sessions whose expiry has passed. Call opportunistically. */
export async function purgeExpiredSessions(): Promise<void> {
  const db = await getDbWithTest();
  await db.session
    .deleteMany({ where: { expiresAt: { lt: new Date() } } })
    .catch(() => {});
}

function expiryDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + SESSION_TTL_DAYS);
  return d;
}

export async function createSession(userId: string, rotate = false): Promise<string> {
  const db = await getDbWithTest();

  if (rotate) {
    const jar = await cookies();
    const oldToken = jar.get(SESSION_COOKIE)?.value;
    if (oldToken) {
      await db.session.deleteMany({ where: { token: hashToken(oldToken) } }).catch(() => {});
    }
  }

  const token = randomBytes(32).toString("hex");
  await db.session.create({
    data: { token: hashToken(token), userId, expiresAt: expiryDate() },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
    path: "/",
    expires: expiryDate(),
  });
  return token;
}

export async function getSessionUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = await getDbWithTest();
  const session = await db.session.findUnique({
    where: { token: hashToken(token) },
    include: { user: true },
  });
  if (!session) return null;

  // Check session expiry
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  // Reject sessions created before last password change
  if (session.user.lastPasswordChangedAt && session.createdAt < session.user.lastPasswordChangedAt) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  // Sliding expiration: refresh cookie if enough time has passed since last refresh
  const timeSinceRefresh = Date.now() - session.lastRefreshAt.getTime();
  if (timeSinceRefresh > SLIDING_REFRESH_INTERVAL_MS) {
    const newExpiry = expiryDate();
    await db.session.update({
      where: { id: session.id },
      data: { expiresAt: newExpiry, lastRefreshAt: new Date() },
    });
    jar.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV !== "development",
      path: "/",
      expires: newExpiry,
    });
  }

  return session.user;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDbWithTest();
    await db.session.deleteMany({ where: { token: hashToken(token) } }).catch(() => {});
  }
  jar.delete(SESSION_COOKIE);
}

export async function revokeAllSessions(userId: string): Promise<void> {
  const db = await getDbWithTest();
  await db.session.deleteMany({ where: { userId } });
}

export async function recordFailedLogin(email: string): Promise<{ locked: boolean; remainingAttempts: number }> {
  const db = await getDbWithTest();
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { locked: false, remainingAttempts: MAX_FAILED_ATTEMPTS };

  // Check if currently locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { locked: true, remainingAttempts: 0 };
  }

  // The counter is only ever cleared on a successful login, so once it hit
  // the threshold every later failure re-locked the account forever. A lapsed
  // lockout means the window has passed, so start a fresh one.
  const lockoutLapsed = user.lockedUntil !== null && user.lockedUntil <= new Date();
  const priorAttempts = lockoutLapsed ? 0 : user.failedLoginAttempts;
  const newAttempts = priorAttempts + 1;
  if (newAttempts >= MAX_FAILED_ATTEMPTS) {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
    await db.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: newAttempts, lockedUntil: lockUntil },
    });
    return { locked: true, remainingAttempts: 0 };
  }

  await db.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: newAttempts },
  });
  return { locked: false, remainingAttempts: MAX_FAILED_ATTEMPTS - newAttempts };
}

export async function resetFailedLogins(userId: string): Promise<void> {
  const db = await getDbWithTest();
  await db.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
}


