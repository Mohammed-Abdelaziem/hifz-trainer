import { NextResponse } from "next/server";
import { getBaseUrl } from "./site-url";
import {
  validateOAuthState,
  findOrCreateOAuthUser,
  OAuthAccountConflictError,
} from "./oauth";

type ExchangeFn = (code: string) => Promise<{ email: string; name: string; picture?: string }>;

export async function handleOAuthCallback(
  request: Request,
  provider: string,
  exchangeCode: ExchangeFn,
): Promise<NextResponse> {
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
    const profile = await exchangeCode(code);
    await findOrCreateOAuthUser(provider, profile);
    return NextResponse.redirect(new URL("/", baseUrl));
  } catch (err) {
    console.error(`[OAuth ${provider}] callback error:`, err);
    const message =
      err instanceof OAuthAccountConflictError
        ? "An+existing+account+already+uses+this+email.+Sign+in+with+the+password+login+instead."
        : "Authentication+failed";
    return NextResponse.redirect(new URL(`/login?error=${message}`, baseUrl));
  }
}
