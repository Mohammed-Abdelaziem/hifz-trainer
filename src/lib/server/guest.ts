import { cookies } from "next/headers";

export const GUEST_COOKIE = "hifz_guest";

export async function setGuestCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(GUEST_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function isGuestSession(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(GUEST_COOKIE)?.value === "1";
}

export async function clearGuestCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(GUEST_COOKIE);
}
