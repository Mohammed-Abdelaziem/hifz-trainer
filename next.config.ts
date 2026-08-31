import type { NextConfig } from "next";

// NOTE: unsafe-inline and unsafe-eval are required by Next.js SSR/hydration.
// Consider migrating to nonce-based CSP if custom server rendering is added.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https://verses.quran.com https://api.quran.com data:",
      "media-src 'self' https://verses.quran.com https://everyayah.com https://*.everyayah.com",
      "connect-src 'self' https://api.quran.com https://verses.quran.com https://everyayah.com https://*.everyayah.com",
      "font-src 'self' https://fonts.gstatic.com",
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
