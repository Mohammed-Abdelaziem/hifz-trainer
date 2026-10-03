-- Brings an existing database in line with prisma/schema.prisma.
--
-- Every statement is idempotent. This matters because 0_baseline was generated
-- from the post-change schema and therefore already creates these indexes and
-- foreign keys, so on a freshly migrated database this file is a no-op. Against
-- a database created earlier by `prisma db push` or by hand, it applies the
-- missing pieces. Production has had at least one version of this run by hand,
-- so re-running must also be safe.
--
-- Safe against production: creates indexes and foreign keys, drops nothing but
-- indexes and a foreign key, rewrites no column and no rows.
--
-- Recorded as already-applied afterwards so Prisma's history matches reality:
--   npx prisma migrate resolve --applied 20260929000000_align_indexes_and_fks

-- 1. Sessions are looked up by expiry, but nothing swept them and expiresAt
--    was unindexed, so any cleanup would have been a full scan.
CREATE INDEX IF NOT EXISTS "Session_expiresAt_idx" ON "Session"("expiresAt");

-- 2. Serves the ORDER BY surahId, ayahNumber in getSurahBundle and the pending
--    word-enrichment scan, replacing the less specific surahId index.
CREATE INDEX IF NOT EXISTS "Verse_surahId_ayahNumber_idx" ON "Verse"("surahId", "ayahNumber");

-- 3. Nothing filters on these columns, and the log tables are append-only, so
--    they were pure write amplification. Dropping an index never touches rows.
DROP INDEX IF EXISTS "ReadingLog_verseKey_idx";
DROP INDEX IF EXISTS "ReviewLog_verseKey_idx";
DROP INDEX IF EXISTS "RecitationAudio_reciterId_idx";
DROP INDEX IF EXISTS "Surah_nameSimple_idx";
DROP INDEX IF EXISTS "Verse_pageNumber_idx";
DROP INDEX IF EXISTS "Verse_surahId_idx";

-- 4. ReviewLog referenced Verse with ON DELETE CASCADE, so a verse re-import
--    would have silently deleted users' review history. It is an append-only
--    analytics ledger and must block a bad delete instead.
--
--    Postgres has no `ADD CONSTRAINT IF NOT EXISTS`, so the existence check is
--    done in a DO block. Recreated unconditionally after the drop so the delete
--    rule is corrected even when the constraint already existed as CASCADE.
ALTER TABLE "ReviewLog" DROP CONSTRAINT IF EXISTS "ReviewLog_verseKey_fkey";
ALTER TABLE "ReviewLog"
  ADD CONSTRAINT "ReviewLog_verseKey_fkey"
  FOREIGN KEY ("verseKey") REFERENCES "Verse"("verseKey")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5. RecitationAudio.verseKey and ReadingLog.verseKey were unconstrained, so
--    rows for verses that do not exist could be written and never cleaned up.
--    Verified zero orphans before adding.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'RecitationAudio_verseKey_fkey'
  ) THEN
    ALTER TABLE "RecitationAudio"
      ADD CONSTRAINT "RecitationAudio_verseKey_fkey"
      FOREIGN KEY ("verseKey") REFERENCES "Verse"("verseKey")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ReadingLog_verseKey_fkey'
  ) THEN
    ALTER TABLE "ReadingLog"
      ADD CONSTRAINT "ReadingLog_verseKey_fkey"
      FOREIGN KEY ("verseKey") REFERENCES "Verse"("verseKey")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;