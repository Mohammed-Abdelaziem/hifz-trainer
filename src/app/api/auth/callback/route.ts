import { NextResponse } from "next/server";
import {
  exchangeGoogleCode,
  exchangeGitHubCode,
  findOrCreateOAuthUser,
} from "@/lib/server/oauth";

function getBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  return "http://localhost:3000";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const provider = searchParams.get("provider");

  if (error || !code || !provider) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error || "Missing code")}`, getBaseUrl())
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
        new URL("/login?error=Unknown+provider", getBaseUrl())
      );
    }

    await findOrCreateOAuthUser(provider, profile);
    return NextResponse.redirect(new URL("/", getBaseUrl()));
  } catch (err) {
    console.error(`[OAuth ${provider}] callback error:`, err);
    return NextResponse.redirect(
      new URL("/login?error=Authentication+failed", getBaseUrl())
    );
  }
}
