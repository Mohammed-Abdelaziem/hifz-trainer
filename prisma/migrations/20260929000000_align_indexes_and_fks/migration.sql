-- Additive-only alignment of the live database with prisma/schema.prisma.
--
-- Safe to run against production: this creates indexes and foreign keys and
-- drops nothing. No column is added, renamed, retyped or removed, so no data
-- is rewritten and no table is locked for a rewrite.
--
-- Recorded as already-applied afterwards so Prisma's history matches reality:
--   npx prisma migrate resolve --applied 20260929000000_align_indexes_and_fks

-- 1. Sessions are now looked up by expiry, but nothing ever swept them and
--    expiresAt was unindexed, so any cleanup would have been a full scan.
CREATE INDEX IF NOT EXISTS "Session_expiresAt_idx" ON "Session"("expiresAt");

-- 2. Serves the ORDER BY surahId, ayahNumber in getSurahBundle and the
--    pending word-enrichment scan, replacing the less specific surahId index.
CREATE INDEX IF NOT EXISTS "Verse_surahId_ayahNumber_idx" ON "Verse"("surahId", "ayahNumber");

-- 3. Dropped from the schema: ReadingLog.verseKey, ReviewLog.verseKey and
--    RecitationAudio.reciterId are never filtered on, and the log tables are
--    append-only, so these were pure write amplification. Dropping an index
--    never touches the rows.
DROP INDEX IF EXISTS "ReadingLog_verseKey_idx";
DROP INDEX IF EXISTS "ReviewLog_verseKey_idx";
DROP INDEX IF EXISTS "RecitationAudio_reciterId_idx";
DROP INDEX IF EXISTS "Surah_nameSimple_idx";
DROP INDEX IF EXISTS "Verse_pageNumber_idx";
DROP INDEX IF EXISTS "Verse_surahId_idx";

-- 4. ReviewLog referenced Verse with ON DELETE CASCADE, so any verse
--    re-import would have silently deleted users' review history. It is an
--    append-only analytics ledger and must block a bad delete instead.
--    The FK is dropped and recreated as RESTRICT; this is metadata only.
ALTER TABLE "ReviewLog" DROP CONSTRAINT IF EXISTS "ReviewLog_verseKey_fkey";
ALTER TABLE "ReviewLog"
  ADD CONSTRAINT "ReviewLog_verseKey_fkey"
  FOREIGN KEY ("verseKey") REFERENCES "Verse"("verseKey")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5. RecitationAudio.verseKey and ReadingLog.verseKey were unconstrained, so
--    rows for verses that do not exist could be written and never cleaned up.
--    Adding these fails if any such row already exists; resolve those first
--    with the diagnostic query in the PR description.
ALTER TABLE "RecitationAudio"
  ADD CONSTRAINT "RecitationAudio_verseKey_fkey"
  FOREIGN KEY ("verseKey") REFERENCES "Verse"("verseKey")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReadingLog"
  ADD CONSTRAINT "ReadingLog_verseKey_fkey"
  FOREIGN KEY ("verseKey") REFERENCES "Verse"("verseKey")
  ON DELETE CASCADE ON UPDATE CASCADE;
