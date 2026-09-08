export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  updatedAt?: string;
  keywords: string[];
  readingTime: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-memorize-quran-fast",
    title: "How to Memorize the Quran Fast: A Complete Guide",
    description:
      "Learn proven techniques to memorize the Quran efficiently using spaced repetition, daily schedules, and the 3-tier review system (Sabaq, Sabqi, Manzil).",
    publishedAt: "2026-09-08",
    keywords: [
      "how to memorize quran fast",
      "quran memorization techniques",
      "hifz tips",
      "spaced repetition quran",
      "quran memory",
    ],
    readingTime: "8 min",
    content: `
## Why Memorize the Quran?

The Quran is the word of Allah, and memorizing it is one of the most noble pursuits a Muslim can undertake. The Prophet Muhammad (peace be upon him) said: *"The best of you are those who learn the Quran and teach it."* (Bukhari)

But many people struggle with consistency, forgetting what they've memorized, or not knowing the right method. This guide will show you a proven, science-backed approach.

## The 3-Tier Review System

The most effective memorization system uses three levels of review:

### 1. Sabaq (New Lesson)
This is your daily new memorization. Start with just **5 ayahs per day** — quality over quantity. After memorizing, listen to a reciter (like Mishary Alafasy) at least 3 times while following along.

### 2. Sabqi (Recent Review)
Review what you memorized in the **last 7 days**. This is the most critical phase — if you skip it, you'll forget. Recite each day's portion once without looking.

### 3. Manzil (Long-Term Review)
Rotate through the **entire Quran** on a weekly cycle. This prevents long-term forgetting. Divide the Quran into 7 parts (one per day) and read each part daily.

## The Power of Spaced Repetition

Spaced repetition is a learning technique where you review material at increasing intervals. Instead of reviewing every day, you review:
- Day 1, Day 2, Day 4, Day 7, Day 15, Day 30...

This exploits the **spacing effect** — your brain retains information better when reviews are spaced out. Apps like Wholly Quran automate this scheduling for you.

## Daily Schedule Example

| Time | Activity |
|------|----------|
| After Fajr | Sabaq — memorize 5 new ayahs (15-20 min) |
| After Dhuhr | Sabqi — review last 7 days (10 min) |
| After Asr | Manzil — read one Juz (20 min) |
| After Maghrib | Listen to yesterday's portion (5 min) |

## Common Mistakes to Avoid

1. **Memorizing too much at once** — 5 ayahs daily beats 1 page that you forget
2. **Skipping Sabqi review** — this is where forgetting happens
3. **Not listening to recitation** — audio reinforces memory
4. **Perfectionism** — it's okay to stumble; consistency matters more

## How Technology Helps

Modern tools like Wholly Quran use **SM-2 and FSRS algorithms** (the same ones used in Anki) to schedule your reviews automatically. The app tracks:
- Which ayahs you're strongest/weakest on
- When you need to review each ayah
- Your overall memorization heatmap across all 114 surahs

## Getting Started Today

1. Start with Surah Al-Mulk (short, powerful, easy to memorize)
2. Set a daily target of 5 ayahs
3. Use a spaced-repetition tool to track your reviews
4. Be consistent — even 15 minutes daily adds up to the entire Quran in 5-7 years

May Allah make it easy for you to memorize His book. Start today, and don't look back.
    `.trim(),
  },
  {
    slug: "tajweed-rules-beginners-guide",
    title: "Tajweed Rules for Beginners: Read the Quran Beautifully",
    description:
      "A simple, beginner-friendly guide to tajweed rules. Learn the essential pronunciation rules, makharij (letter origins), and common mistakes to avoid when reading the Quran.",
    publishedAt: "2026-09-08",
    keywords: [
      "tajweed rules for beginners",
      "how to read quran with tajweed",
      "quran pronunciation",
      "makharij letters",
      "tajweed basics",
    ],
    readingTime: "6 min",
    content: `
## What is Tajweed?

Tajweed means "to make better" or "to improve." In the context of the Quran, it refers to the set of rules governing how to pronounce each letter correctly, with its proper characteristics, at the right time.

Reading the Quran with tajweed is not just about sounding beautiful — it's about preserving the meaning. A slight mispronunciation can change the meaning of an ayah entirely.

## The Essentials Every Beginner Should Know

### 1. Makharij (Points of Articulation)

Each Arabic letter originates from a specific point in the mouth or throat. The main groups are:

- **Throat letters** (al-halq): ء، ه، ع، ح، غ، خ — six letters from three throat sections
- **Tongue letters** (al-lisan): the rest — from the tip, middle, or back of the tongue
- **Lip letters** (al-shafatan): ب، و، م — produced with the lips

### 2. Sifat (Characteristics of Letters)

Each letter has attributes that affect how it's pronounced:

- **Hams (whispered)** vs **Jahr (voiced)**: ت vs د
- **Shiddah (strong)** vs **Rakhawah (soft)**: ب vs و
- **Istifal (flat tongue)** vs **Istela (elevated tongue)**: س vs ص

### 3. The 5 Essential Rules

Every beginner should master these first:

**Rule 1: Noon Sakin and Tanween**
- Izhar (clear): when followed by ء ه ع ح غ خ ف ق — pronounce clearly through the throat
- Idghaam (merging): when followed by ل ر م و ي ن — merge with nasalization
- Iqlab (conversion): when followed by ب — convert to م sound
- Ghunnah (nasalization): when followed by ن or م — hold nasal sound for 2 counts

**Rule 2: Meem Sakin**
- Similar rules to noon sakin but with different letters
- Izhar: followed by any letter except م and ب — pronounce clearly
- Iqlab: followed by ب — convert to م sound
- Idghaam: followed by م — merge

**Rule 3: Madd (Elongation)**
- Natural madd (2 counts): hamza or jarr comes after
- Connected madd (4-5 counts): followed by silence
- Permitted madd (2-4 counts): flexible duration

**Rule 4: Qalqalah (Echoing)**
- When stopping on ب، ج، د، ط، ظ with sukun — produce a slight bounce
- Example: the last letter in أَحَد (د), يَجْمَع (ج)

**Rule 5: Lam and Ra rules**
- Heavy (tafkheem) vs light (tarqeeq) depending on surrounding vowels

## How to Practice

1. **Listen first** — play a recitation by a qualified reciter and follow along
2. **Record yourself** — compare your pronunciation with the reciter
3. **Focus on one rule at a time** — don't try to learn everything at once
4. **Use the Tajweed Checker** — apps like Wholly Quran can analyze your recitation and identify mistakes

## Recommended Learning Path

1. Week 1-2: Master makharij (letter origins)
2. Week 3-4: Learn noon sakin rules
3. Week 5-6: Practice madd rules
4. Week 7-8: Work on qalqalah and remaining rules
5. Ongoing: Read with a teacher for corrections

## The Beautiful Reward

The Prophet (peace be upon him) said: *"The one who is proficient with the Quran will be with the noble, righteous scribes (angels), and the one who recites it and finds it difficult, stumbling through it, will have a double reward."* (Bukhari)

Whether you're a beginner or have been reading for years, every effort to improve your tajweed is rewarded by Allah. Start with the basics, be patient with yourself, and trust the process.
    `.trim(),
  },
  {
    slug: "best-quran-memorization-apps-2026",
    title: "Best Quran Memorization Apps in 2026: Complete Comparison",
    description:
      "Compare the top Quran memorization apps in 2026. We review features, scheduling algorithms, reciters, and pricing to help you choose the best hifz app.",
    publishedAt: "2026-09-08",
    keywords: [
      "best quran memorization app",
      "quran hifz app 2026",
      "top quran apps",
      "spaced repetition quran app",
      "free quran app",
    ],
    readingTime: "7 min",
    content: `
## Why Use a Quran Memorization App?

The traditional method of memorizing the Quran with a teacher is irreplaceable. But for supplementary review and tracking progress, a good app can make a huge difference. The best apps combine:

- **Spaced repetition scheduling** — so you review at the optimal time
- **Progress tracking** — so you know exactly where you stand
- **Multiple reciters** — so you can listen and reinforce
- **Tajweed support** — so you learn proper pronunciation

## Top Quran Memorization Apps in 2026

### 1. Wholly Quran (whollyquran.me)

**Best for:** Serious hifz students who want science-backed scheduling

**Key Features:**
- Dual scheduling algorithms: SM-2 (proven) and FSRS (state-of-the-art)
- 3-tier review system: Sabaq, Sabqi, Manzil
- Interactive word-by-word Quran reader
- 10 reciters including Mishary Alafasy and Abdul Basit
- AI-powered tajweed checker
- Memory heatmap showing strength across all 114 surahs
- Fully free and open-source

**Pricing:** 100% free

### 2. Quran.com

**Best for:** Reading and listening (not memorization tracking)

**Key Features:**
- Clean interface with multiple translations
- 20+ reciters
- Word-by-word translation
- Tafsir integration

**Limitation:** No memorization scheduling or progress tracking

### 3. Tarteel AI

**Best for:** AI-powered recitation correction

**Key Features:**
- Real-time voice recognition
- Automatic tajweed error detection
- Beautiful UI with reflections

**Limitation:** Subscription-based, no spaced repetition

### 4. Memorize Quran (memorize.quran.com)

**Best for:** Simple memorization tracking

**Key Features:**
- Basic review scheduling
- Juz-by-Juz tracking
- Audio playback

**Limitation:** Basic UI, no advanced scheduling algorithms

## How to Choose

| Feature | Wholly Quran | Quran.com | Tarteel AI |
|---------|-------------|-----------|------------|
| Spaced Repetition | ✅ SM-2 + FSRS | ❌ | ❌ |
| Tajweed Checker | ✅ AI | ❌ | ✅ Voice |
| Reciters | 10 | 20+ | 5 |
| Word-by-Word | ✅ | ✅ | ❌ |
| Heatmap | ✅ | ❌ | ❌ |
| Price | Free | Free | $9.99/mo |

## The Bottom Line

For **serious memorization**, you need spaced repetition. Quran.com is excellent for reading, Tarteel AI is great for pronunciation, but **Wholly Quran** is the only free app that combines memorization scheduling, progress tracking, and tajweed analysis in one place.

Start your hifz journey at whollyquran.me — it's completely free.
    `.trim(),
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
