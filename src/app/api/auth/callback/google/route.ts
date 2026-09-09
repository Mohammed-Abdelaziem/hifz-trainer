import { NextResponse } from "next/server";
import {
  validateOAuthState,
  exchangeGoogleCode,
  findOrCreateOAuthUser,
  getBaseUrl,
} from "@/lib/server/oauth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  const baseUrl = getBaseUrl();

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error || "Missing code")}`, baseUrl)
    );
  }

  const validState = await validateOAuthState(state);
  if (!validState) {
    return NextResponse.redirect(
      new URL("/login?error=Invalid+or+expired+session", baseUrl)
    );
  }

  try {
    const profile = await exchangeGoogleCode(code);
    await findOrCreateOAuthUser("google", profile);
    return NextResponse.redirect(new URL("/", baseUrl));
  } catch (err) {
    console.error("[OAuth google] callback error:", err);
    return NextResponse.redirect(
      new URL("/login?error=Authentication+failed", baseUrl)
    );
  }
}
