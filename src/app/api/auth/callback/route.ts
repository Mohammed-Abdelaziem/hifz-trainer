import { NextResponse } from "next/server";
import {
  validateOAuthState,
  exchangeGoogleCode,
  exchangeGitHubCode,
  findOrCreateOAuthUser,
  getBaseUrl,
} from "@/lib/server/oauth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");
  const provider = searchParams.get("provider");

  const baseUrl = getBaseUrl();

  if (error || !code || !provider) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error || "Missing code")}`, baseUrl)
    );
  }

  // Validate state parameter (CSRF protection)
  const validState = await validateOAuthState(state);
  if (!validState) {
    return NextResponse.redirect(
      new URL("/login?error=Invalid+or+expired+session", baseUrl)
    );
  }

  try {
    let profile: { email: string; name: string; picture?: string };

    if (provider === "google") {
      profile = await exchangeGoogleCode(code);
    } else if (provider === "github") {
      profile = await exchangeGitHubCode(code);
    } else {
      return NextResponse.redirect(
        new URL("/login?error=Unknown+provider", baseUrl)
      );
    }

    await findOrCreateOAuthUser(provider, profile);
    return NextResponse.redirect(new URL("/", baseUrl));
  } catch (err) {
    console.error(`[OAuth ${provider}] callback error:`, err);
    return NextResponse.redirect(
      new URL("/login?error=Authentication+failed", baseUrl)
    );
  }
}
