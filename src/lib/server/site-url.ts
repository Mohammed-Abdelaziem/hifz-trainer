/**
 * The single source for every absolute URL the app emits. The OAuth redirect
 * derivation must stay runtime-aware (Vercel preview URLs), while marketing
 * and SEO URLs are hard deployment constants.
 */

/** Runtime base URL for server-side redirects (OAuth callbacks). */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/** Canonical production origin used across SEO metadata and sitemap links. */
export const SITE_URL = "https://whollyquran.me";
