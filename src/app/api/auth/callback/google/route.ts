import { handleOAuthCallback } from "@/lib/server/oauth-callback";
import { exchangeGoogleCode } from "@/lib/server/oauth";

export async function GET(request: Request) {
  return handleOAuthCallback(request, "google", exchangeGoogleCode);
}
