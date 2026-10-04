-- Recompute "VerseSearch"."textNormalized" so it covers translation and
-- transliteration text as well as the Arabic.
--
-- Why a second migration rather than an edit: 20260930000000_verse_search is
-- already recorded on production, so its checksum is fixed.
--
-- Two defects are corrected here:
--
-- 1. The fast path only searched uthmaniText. A query like "mercy" matched the
--    fallback (which scans wordsJson) but never the indexed column, so English
--    search silently returned nothing whenever pg_trgm and the table were both
--    present.
--
-- 2. The original diacritics class was [U+0610-U+064B, U+065A-U+0670,
--    U+06D6-U+06ED], which skipped U+064C-U+0659 - that range contains shadda
--    (U+0651) and sukun (U+0652), the most frequent marks in the Quran.
--    src/lib/quran/arabic.ts strips them from the query, so a user typing
--    "الله" produced "الله" while the indexed text still carried the shadda,
--    and the ILIKE never matched. The class below is a superset that mirrors
--    the application's DIACRITICS + ANNOTATION + COMBINING union.
--
-- Cost note: this column and its trigram index grow substantially, since each
-- verse now carries three renderings instead of one. Sync time and index size
-- both increase.
--
-- Safe to re-run: the INSERT ... ON CONFLICT makes the backfill idempotent.

-- Folds a string the same way src/lib/quran/arabic.ts's normalizeArabic does.
CREATE OR REPLACE FUNCTION pg_temp.fold_search_text(t text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(
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
                        regexp_replace(t, '[ؐ-ٰۖ-ۭ࣭-ࣲࣿ]', '', 'g'),
                        'ـ', '', 'g'
                      ),
                      '[آأإٱٲٳٵ]', 'ا', 'g'
                    ),
                    '[ؤٷۈۉۍۇۆۋ]', 'و', 'g'
                  ),
                  '[يىےۓېئ]', 'ي', 'g'
                ),
                '[کﮎﮏ]', 'ك', 'g'
              ),
              '[ةۃ]', 'ه', 'g'
            ),
            'ء', '', 'g'
          ),
          '[‌‍]', '', 'g'
        ),
        '[[:space:]]+', ' ', 'g'
      )
    )
  );
$$;

-- Flattens wordsJson into one searchable string. Tolerates NULL, empty and
-- malformed values so a single bad row cannot abort the whole backfill.
CREATE OR REPLACE FUNCTION pg_temp.words_search_text(j text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  arr jsonb;
  flat text;
BEGIN
  IF j IS NULL OR j = '' THEN
    RETURN '';
  END IF;

  BEGIN
    arr := j::jsonb;
  EXCEPTION WHEN others THEN
    RETURN '';
  END;

  IF jsonb_typeof(arr) <> 'array' THEN
    RETURN '';
  END IF;

  SELECT string_agg(
           coalesce(w ->> 'text_uthmani', '') || ' ' ||
           coalesce(w ->> 'translation', '') || ' ' ||
           coalesce(w ->> 'transliteration', ''),
           ' '
         )
    INTO flat
    FROM jsonb_array_elements(arr) AS w;

  RETURN coalesce(flat, '');
END;
$$;

-- Upsert rather than UPDATE: this also picks up verses that had no
-- uthmaniText but do have wordsJson, which the original backfill skipped.
INSERT INTO "VerseSearch" ("verseKey", "textNormalized")
SELECT
  v."verseKey",
  pg_temp.fold_search_text(v."uthmaniText" || ' ' || pg_temp.words_search_text(v."wordsJson"))
FROM "Verse" v
WHERE coalesce(v."uthmaniText", '') <> ''
   OR coalesce(v."wordsJson", '') <> ''
ON CONFLICT ("verseKey") DO UPDATE
  SET "textNormalized" = EXCLUDED."textNormalized";