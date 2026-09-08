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
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https://verses.quran.com https://api.quran.com data: https://*.googleusercontent.com https://avatars.githubusercontent.com",
      "media-src 'self' https://verses.quran.com https://audio.everyayah.com https://server8.mp3quran.net https://server13.mp3quran.net https://server7.mp3quran.net https://server11.mp3quran.net https://server10.mp3quran.net",
      "connect-src 'self' https://api.quran.com https://verses.quran.com https://audio.everyayah.com https://mp3quran.net https://server8.mp3quran.net https://server13.mp3quran.net https://server7.mp3quran.net https://server11.mp3quran.net https://server10.mp3quran.net https://accounts.google.com https://oauth2.googleapis.com https://github.com https://api.github.com https://githubusercontent.com",
      "font-src 'self' https://fonts.gstatic.com",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "upgrade-insecure-requests",
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
