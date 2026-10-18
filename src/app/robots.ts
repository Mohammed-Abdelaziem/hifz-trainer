import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/server/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /dashboard/ used to be listed but no such route exists — the
        // dashboard lives at "/". /analytics and /settings are per-user pages
        // with nothing for a crawler to see.
        disallow: ["/api/", "/settings", "/analytics"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
