# Hifz Trainer — Quran Memorization Platform

[![CI](https://github.com/Mohammed-Abdelaziem/hifz-trainer/actions/workflows/ci.yml/badge.svg)](https://github.com/Mohammed-Abdelaziem/hifz-trainer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Spaced-repetition driven Quran memorization implementing the traditional Hifz workflow:
**Sabaq** (new intake) · **Sabqi** (recent review, 7–14 days) · **Manzil** (long-term rotation),
automated with **SM-2** or **FSRS** scheduling and active-recall tooling.

## Features

- **Daily task dashboard** — Sabaq/Sabqi/Manzil queue, streak tracking, daily goal ring,
  estimated session time, and an **Add to Sabaq** control for putting new verses into your plan
- **Interactive reader (RTL)** — masking modes (full / blurred / first-letter prompts /
  tap-to-reveal), word-by-word translations + transliteration + roots, tafsir drawer,
  adjustable font
- **Audio engine** — continuous recitation with A→B looping and 0.5–1.5× speed, plus a
  **word-by-word drill mode** that plays each word's own clip in sequence (perfectly synced)
- **10 reciters** (quran.com CDN), lazily cached per verse per reciter
- **SRS engines** — SM-2 or FSRS (via official `ts-fsrs`), selectable per user, with desired
  retention control (70–98%) for FSRS; weak verses auto-route back into Sabqi
- **Analytics** — 604-page / 114-surah mushaf heatmap with decay indicators, 30-day review
  activity chart, interval-distribution comparison between schedulers
- **Search** — Arabic-aware: diacritics, tatweel and hamza/alef variants are folded, so
  typing `الله` matches the vocalized `اللَّهِ`. Trigram-indexed.
- **Accounts** — email/password auth (scrypt, hashed session tokens) plus Google and GitHub
- **PWA** — installable app shell with raster icons, an iOS home-screen icon, and a service
  worker that caches static assets and `/api/ayah-data` responses

## Tech stack

Next.js 16 (App Router, RSC, Turbopack) · TypeScript · Tailwind CSS v4 · Prisma 7 (driver
adapters: SQLite locally, PostgreSQL/Supabase in production) · ts-fsrs · Howler.js ·
Zustand · TanStack Query · Radix primitives · Framer Motion

## Local development

```bash
npm install                 # runs prisma generate via postinstall
cp .env.example .env        # defaults to file:./dev.db
npm run db:migrate          # apply migrations (creates the schema)
npm run dev                 # http://localhost:3000
```

> Use `npm run db:migrate`, **not** `prisma db push`. The repo ships a real
> migration history, and `db push` ignores it — a database built that way is
> missing the `Session(expiresAt)` and `Verse(surahId, ayahNumber)` indexes and
> still carries `ON DELETE CASCADE` on `ReviewLog.verseKey`, which lets a verse
> re-import delete review history.

### Tests & checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint
npm test            # vitest suite
npm run e2e         # Playwright (builds and starts the app first)
npm run build       # production build incl. route types
```

Then:

1. Create an account (Google, GitHub, or email + a 12-character password).
2. **Become an admin** — the corpus sync is admin-gated, and no signup path grants
   the role. Run `node scripts/set-admin.mjs grant you@example.com` (or the
   equivalent `UPDATE "User" SET role = 'admin' WHERE email = '...';`).
3. On the dashboard press **Sync full Quran** once (~13s) to pull all 6,236 verses.
   Word-level enrichment + audio URLs are then fetched lazily per ayah you study
   (`POST /api/sync?scope=words&limit=500` pre-warms in bulk).
4. Use **Add to Sabaq** to put new verses into your plan, then open a surah, mask
   words, drill with WbW mode, and rate recall with `1–4`.

`node scripts/set-admin.mjs list` shows current admins; `revoke` removes the role.

### Offline / install

The app registers a service worker on load. Static assets are cache-first, and
`/api/ayah-data` responses are cached as you study so previously opened verses keep
working without connectivity. Navigations to public pages fall back to an `/offline`
page. Install via your browser's "Install app" prompt.

Audio is **not** cached: it streams cross-origin from `verses.quran.com` and
`everyayah.com`, and the service worker only intercepts same-origin requests, so
offline playback of previously-opened verses does not work.

## Deploying (Vercel + Supabase)

1. Create a Supabase project; copy the **connection pooler** URI
   (Port `6543`, transaction mode) into `DATABASE_URL`.
2. `prisma/schema.prisma` already declares the `postgresql` provider, and the
   runtime adapter in `src/lib/db.ts` picks Postgres whenever `DATABASE_URL`
   starts with `postgres`. Nothing to switch.
3. Apply the migrations:
   ```bash
   DATABASE_URL="<pooler url>" npx prisma migrate deploy
   ```
   For a database that was previously built with `prisma db push` or by hand, the
   first two migrations are already-applied history — mark them rather than
   replaying them:
   ```bash
   npx prisma migrate resolve --applied 0_baseline 20260929000000_align_indexes_and_fks
   ```
4. Push the repo to GitHub and import it in Vercel. Set `DATABASE_URL`
   (Production + Preview). Build command and `postinstall` work out of the box.
5. Promote yourself to admin — see the local setup steps above.

Notes:
- The SQLite file is ignored on Vercel serverless filesystems — always use Postgres there.
- `POST /api/sync` is admin-gated and declares `maxDuration = 300`. On a plan that
  caps function duration below 300s, a full corpus sync will not complete.
- Regenerate the PWA icons after changing the artwork: `node scripts/generate-icons.mjs`.

## Project structure (key paths)

```
src/
├── app/                    # routes: /, /reader/[surahId], /analytics, /login, /api/*
├── components/
│   ├── reader/             # ReaderWorkspace, VerseCanvas, AudioControlBar, ...
│   ├── dashboard/          # queue tabs, goal ring, streak card, sabaq intake, sync button
│   ├── analytics/          # mushaf heatmap, activity + scheduler charts
│   └── ui/                 # shadcn-style primitives
├── lib/
│   ├── srs/                # sm2.ts, fsrs.ts, routing.ts, stability.ts
│   ├── server/             # hifz-service, quran-sync, ayah-data, auth
│   └── quran/              # api registry, fixtures, timings, reciters, arabic normalizer
├── stores/reader-store.ts  # zustand + persist (skipHydration)
└── types/                  # quran.ts, srs.ts
```

## Maintenance scripts

| Script | Purpose |
| --- | --- |
| `node scripts/set-admin.mjs grant <email>` | Grant the admin role (also `revoke`, `list`) |
| `node scripts/generate-icons.mjs` | Regenerate the PWA raster icons from `public/icon.svg`-style geometry |
| `node scripts/auth-e2e.mjs` | Seed/clean the e2e auth fixture |
