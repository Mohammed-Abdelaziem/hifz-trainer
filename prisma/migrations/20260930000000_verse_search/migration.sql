-- Searchable copy of the Quran, plus the trigram index that makes it usable.
--
-- Safe to run against production: creates one table and three indexes, and
-- backfills a derived column. No existing table is altered and no user data is
-- touched. The backfill is idempotent, so re-running is harmless.
--
-- Recorded as already-applied afterwards so Prisma's history matches reality:
--   npx prisma migrate resolve --applied 20260930000000_verse_search

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS "VerseSearch" (
  "verseKey"       TEXT NOT NULL,
  "textNormalized" TEXT NOT NULL,
  CONSTRAINT "VerseSearch_pkey" PRIMARY KEY ("verseKey"),
  CONSTRAINT "VerseSearch_verseKey_fkey" FOREIGN KEY ("verseKey")
    REFERENCES "Verse"("verseKey") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Trigram index. A leading-wildcard ILIKE ('%term%') cannot use a btree, so
-- without this every search sequentially scans the whole corpus and detoasts
-- the multi-KB wordsJson column.
CREATE INDEX IF NOT EXISTS "VerseSearch_textNormalized_trgm_idx"
  ON "VerseSearch" USING gin ("textNormalized" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "VerseSearch_textNormalized_idx"
  ON "VerseSearch" ("textNormalized");

-- Backfill. Folds harakat, tatweel, and the alef/ya/ta-marbuta/hamza variants
-- so a user typing plain Arabic matches the vocalized uthmani text.
--
-- The SQL mirrors src/lib/quran/arabic.ts. Keep the two in step: diacritics
-- U+064B–U+0652, U+0670 and U+06D6–U+06ED, tatweel U+0640, and the alef/ya/
-- ta-marbuta folds below. PostgreSQL has no NFKC, so a few presentation
-- forms are not folded here; the application normalizer handles those and
-- both sides are folded before comparison.
--
-- Implemented entirely with regexp_replace rather than nested translate():
-- Postgres cannot resolve the type of translate's second and third arguments
-- when they are literals inside a nested call, and fails with
-- "function translate(text, unknown, unknown, unknown) does not exist".
INSERT INTO "VerseSearch" ("verseKey", "textNormalized")
SELECT
  "verseKey",
  lower(
    btrim(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(
                      regexp_replace(
                        regexp_replace("uthmaniText", '[ؐ-ًؚ-ٰٟۖ-ۭ]', '', 'g'),
                        'ـ', '', 'g'
                      ),
                      '[آأإٱٲٳٵ]', 'ا', 'g'
                    ),
                    '[ؤٷۈۉۍۇۆۋ]', 'و', 'g'
                  ),
                  '[يىےۓېئ]', 'ي', 'g'
                ),
                '[ةۃ]', 'ه', 'g'
              ),
              'ء', '', 'g'
            ),
            '[‌‍]', '', 'g'
          ),
          '[[:space:]]+', ' ', 'g'
        ),
        ' {2,}', ' ', 'g'
      )
    )
  )
FROM "Verse"
WHERE "uthmaniText" IS NOT NULL AND "uthmaniText" <> ''
ON CONFLICT ("verseKey") DO UPDATE SET "textNormalized" = EXCLUDED."textNormalized";
