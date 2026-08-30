# Hifz Trainer — Quran Memorization Platform

[![CI](https://github.com/Mohammed-Abdelaziem/hifz-trainer/actions/workflows/ci.yml/badge.svg)](https://github.com/Mohammed-Abdelaziem/hifz-trainer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Spaced-repetition driven Quran memorization implementing the traditional Hifz workflow:
**Sabaq** (new intake) · **Sabqi** (recent review, 7–14 days) · **Manzil** (long-term rotation),
automated with **SM-2** or **FSRS** scheduling and active-recall tooling.

## Features

- **Daily task dashboard** — Sabaq/Sabqi/Manzil queue, streak tracking, daily goal ring,
  estimated session time
- **Interactive reader (RTL)** — masking modes (full / blurred / first-letter prompts /
  tap-to-reveal), word-by-word translations + transliteration + roots, tafsir drawer,
  Mushaf page view, adjustable font
- **Audio engine** — continuous recitation with A→B looping and 0.5–1.5× speed, plus a
  **word-by-word drill mode** that plays each word's own clip in sequence (perfectly synced)
- **10 reciters** (quran.com CDN), lazily cached per verse per reciter
- **SRS engines** — SM-2 or FSRS (via official `ts-fsrs`), selectable per user, with desired
  retention control (70–98%) for FSRS; weak verses auto-route back into Sabqi
- **Analytics** — 604-page / 114-surah mushaf heatmap with decay indicators, 30-day review
  activity chart, interval-distribution comparison between schedulers
- **Accounts** — email/password auth (scrypt + DB sessions) with a shared demo account
- **PWA** — installable app shell; service worker caches static assets, visited ayah audio
  and word-data responses so recently studied verses work offline

## Tech stack

Next.js 16 (App Router, RSC, Turbopack) · TypeScript · Tailwind CSS v4 · Prisma 7 (driver
adapters: SQLite locally, PostgreSQL/Supabase in production) · ts-fsrs · Howler.js ·
Zustand · TanStack Query · Radix primitives · Framer Motion

## Local development

```bash
npm install                 # runs prisma generate via postinstall
cp .env.example .env        # defaults to file:./dev.db
npm run db:push             # create schema
npm run dev                 # http://localhost:3000
```

### Tests & checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint
npm test            # vitest suite (SRS math, routing, masking UI, queue tabs)
npm run build       # production build incl. route types
```

Then:

1. Sign in via the demo account button (`demo@hifz.local`) or create an account.
2. On the dashboard press **Sync full Quran** once (~13s) to pull all 6,236 verses.
   Word-level enrichment + audio URLs are then fetched lazily per ayah you study
   (`POST /api/sync?scope=words&limit=500` pre-warms in bulk).
3. Open a surah, mask words, drill with WbW mode, rate recall with `1–4`.

### Offline / install

The app registers a service worker on load. Static assets are cache-first; visited ayah
audio (`verses.quran.com`, `everyayah.com`) and `/api/ayah-data` responses are cached as
you study, so previously opened verses keep working without connectivity. Navigations fall
back to an `/offline` page. Install via your browser's "Install app" prompt.

## Deploying (Vercel + Supabase)

1. Create a Supabase project; copy the **connection pooler** URI
   (Port `6543`, transaction mode) into `DATABASE_URL`.
2. Switch `prisma/schema.prisma` datasource provider from `"sqlite"` to `"postgresql"`
   (one line). The runtime adapter in `src/lib/db.ts` already picks Postgres whenever
   `DATABASE_URL` starts with `postgres`.
3. Run `npx prisma db push` against the Supabase URL once to create tables.
4. Push the repo to GitHub and import it in Vercel. Set env var `DATABASE_URL`
   (Production + Preview). Build command and `postinstall` work out of the box.

Notes:
- The SQLite file is ignored on Vercel serverless filesystems — always use Postgres there.
- `scripts/reset-demo.mjs` wipes demo-account progress while keeping the synced corpus.

## Project structure (key paths)

```
src/
├── app/                    # routes: /, /reader/[surahId], /analytics, /login, /api/*
├── components/
│   ├── reader/             # ReaderWorkspace, VerseCanvas, AudioControlBar, ...
│   ├── dashboard/          # queue tabs, goal ring, streak card, sync button
│   ├── analytics/          # mushaf heatmap, activity + scheduler charts
│   └── ui/                 # shadcn-style primitives
├── lib/
│   ├── srs/                # sm2.ts, fsrs.ts, routing.ts, stability.ts
│   ├── server/             # hifz-service, quran-sync, ayah-data, auth
│   └── quran/              # api registry, fixtures, timings, reciters
├── stores/reader-store.ts  # zustand + persist (skipHydration)
└── types/                  # quran.ts, srs.ts
```
