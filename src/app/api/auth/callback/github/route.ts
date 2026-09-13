import { handleOAuthCallback } from "@/lib/server/oauth-callback";
import { exchangeGitHubCode } from "@/lib/server/oauth";

export async function GET(request: Request) {
  return handleOAuthCallback(request, "github", exchangeGitHubCode);
}
