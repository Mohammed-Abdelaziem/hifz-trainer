export function JsonLd() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Wholly Quran — Hifz Trainer",
    url: "https://whollyquran.me",
    description:
      "Free Quran memorization platform with spaced-repetition scheduling, interactive word-by-word reader, tajweed checker, and progress tracking.",
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
      "Tajweed checker with AI transcription",
      "Interactive memory heatmap analytics",
      "Daily review scheduling (Sabaq, Sabqi, Manzil)",
    ],
    screenshot: "https://whollyquran.me/og-image.png",
    inLanguage: ["en", "ar"],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Wholly Quran",
    url: "https://whollyquran.me",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://whollyquran.me/quran?surah={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
