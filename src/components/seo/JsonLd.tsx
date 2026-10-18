import { SITE_URL } from "@/lib/server/site-url";

function safeStringify(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

export function JsonLd() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Wholly Quran — Hifz Trainer",
    url: SITE_URL,
    description:
      "Free Quran memorization platform with spaced-repetition scheduling, interactive word-by-word reader, and progress tracking.",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Spaced-repetition Quran memorization (SM2 & FSRS)",
      "Word-by-word Arabic Quran reader",
      "10 reciters including Mishary Alafasy",
      "Interactive memory heatmap analytics",
      "Daily review scheduling (Sabaq, Sabqi, Manzil)",
    ],
    screenshot: `${SITE_URL}/og-image.png`,
    inLanguage: ["en", "ar"],
  };

  // No SearchAction: the previous potentialAction pointed at
  // /quran?surah={search_term_string}, but that param takes a surah NUMBER,
  // so the template produced URLs a crawler (or a person) could never
  // interpret, and no human-readable search-results page exists to target.
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Wholly Quran",
    url: SITE_URL,
  };

  const schemas = [webAppSchema, websiteSchema];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeStringify(schemas) }}
    />
  );
}
