import type { NextConfig } from "next";

// NOTE: unsafe-inline and unsafe-eval are required by Next.js SSR/hydration.
// Consider migrating to nonce-based CSP if custom server rendering is added.
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
      "script-src 'self' 'unsafe-inline'",
      "script-src-attr 'none'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https://verses.quran.com https://api.quran.com data:",
      // everyayah.com is the apex host the app actually loads audio from
      // (lib/quran/timings.ts RECITER_BASE), not audio.everyayah.com.
      "media-src 'self' https://verses.quran.com https://everyayah.com https://server8.mp3quran.net https://server13.mp3quran.net https://server7.mp3quran.net https://server11.mp3quran.net https://server10.mp3quran.net",
      // OAuth hosts are contacted server-side only, so the browser does not
      // need reach to them.
      "connect-src 'self' https://api.quran.com https://verses.quran.com https://everyayah.com https://mp3quran.net https://server8.mp3quran.net https://server13.mp3quran.net https://server7.mp3quran.net https://server11.mp3quran.net https://server10.mp3quran.net",
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
