import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=self, geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'unsafe-inline' is required by the App Router's own bootstrap scripts.
      // script-src-attr is separate and blocks inline event handlers
      // (onerror=, onclick=), which is the common shape of an XSS payload.
      //
      // static.cloudflareinsights.com is Cloudflare Browser Insights, which
      // the zone injects automatically. If you would rather not allow a
      // third-party script host, delete this host from both directives below
      // and turn Browser Insights off in the Cloudflare dashboard instead.
      "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
      "script-src-attr 'none'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https://verses.quran.com https://api.quran.com data:",
      // Audio is served from four different mp3quran hosts plus the everyayah
      // CDN, and mp3quran.net 301-redirects to www.mp3quran.net — CSP
      // re-checks the redirect target, so the apex alone is not enough.
      // Wildcards cover every current and future host in the family.
      // `data:` covers decoded Web Audio buffers.
      "media-src 'self' https://verses.quran.com https://everyayah.com https://*.everyayah.com https://mp3quran.net https://*.mp3quran.net data:",
      // OAuth hosts are contacted server-side only, so the browser does not
      // need reach to them.
      "connect-src 'self' https://api.quran.com https://verses.quran.com https://everyayah.com https://*.everyayah.com https://mp3quran.net https://*.mp3quran.net https://cloudflareinsights.com",
      "font-src 'self' https://fonts.gstatic.com",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
    ].join("; "),
  },
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-better-sqlite3",
    "better-sqlite3",
  ],
};

export default nextConfig;
