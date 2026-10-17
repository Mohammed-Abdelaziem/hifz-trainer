-- VerseSearch self-maintenance via trigger.
--
-- The one-time backfill migrations populate "VerseSearch"."textNormalized"
-- only at deploy time; every verse written afterwards (initial sync loop,
-- word enrichment during /api/ayah-data) left the indexed text stale or
-- missing, so fresh deployments returned 0 hits for Arabic and English
-- searches. This migration installs the fold helpers persistently (the
-- earlier migrations could only use pg_temp functions) and an AFTER trigger
-- that upserts the index row on every verse write.
--
-- Safe to re-run: functions are CREATE OR REPLACE and the cleanup/backfill
-- statements are idempotent.
CREATE OR REPLACE FUNCTION public.verse_fold_text(t text)
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
CREATE OR REPLACE FUNCTION public.verse_words_search_text(j text)
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
-- Keeps "VerseSearch"."textNormalized" in step with "Verse" so that fresh
-- deployments and future sync/enrichment writes stay searchable. Before a new
-- migration the table was only filled by the one-time backfills, so every row
-- written afterwards (first sync on a fresh DB, word enrichment) silently
-- stayed out of the indexed column and Arabic/English search returned nothing.
--
-- AFTER, not BEFORE: inserting into "VerseSearch" inside a BEFORE trigger
-- would see no parent "Verse" row yet and blow up its FK check.
-- Exceptions are swallowed so one malformed row cannot abort the verse write.
CREATE OR REPLACE FUNCTION public.verse_search_upkeep() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."uthmaniText" IS NULL AND (NEW."wordsJson" IS NULL OR NEW."wordsJson" = '') THEN
    RETURN NEW;
  END IF;
  BEGIN
    INSERT INTO "VerseSearch" ("verseKey", "textNormalized")
    VALUES (
      NEW."verseKey",
      public.verse_fold_text(coalesce(NEW."uthmaniText", '') || ' ' || public.verse_words_search_text(NEW."wordsJson"))
    )
    ON CONFLICT ("verseKey") DO UPDATE
      SET "textNormalized" = EXCLUDED."textNormalized";
  EXCEPTION WHEN others THEN
    -- Leave this verse unindexed rather than failing the verse write.
    NULL;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS verse_search_upkeep ON "Verse";
CREATE TRIGGER verse_search_upkeep
AFTER INSERT OR UPDATE OF "uthmaniText", "wordsJson", "wordsSource"
ON "Verse"
FOR EACH ROW
EXECUTE FUNCTION public.verse_search_upkeep();

-- One-time catch-up for rows written after the earlier backfills replay, and
-- for chars the older fold missed (shadda/sukun et al re-fixed by the newer
-- classes). Idempotent: INSERT ... ON CONFLICT.
INSERT INTO "VerseSearch" ("verseKey", "textNormalized")
SELECT
  v."verseKey",
  public.verse_fold_text(coalesce(v."uthmaniText", '') || ' ' || public.verse_words_search_text(v."wordsJson"))
FROM "Verse" v
WHERE coalesce(v."uthmaniText", '') <> ''
   OR coalesce(v."wordsJson", '') <> ''
ON CONFLICT ("verseKey") DO UPDATE
  SET "textNormalized" = EXCLUDED."textNormalized";