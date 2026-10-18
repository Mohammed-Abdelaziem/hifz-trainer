-- Drop Verse.timestampsJson: a dead column. Word-level timings never materialized
-- into it (rows are written with the literal "[]") — the live word data is
-- wordsJson, fed from the enrichment pipeline.
ALTER TABLE "Verse" DROP COLUMN IF EXISTS "timestampsJson";

-- Enforce what the data already respects: every verse belongs to one of the 114
-- catalog rows. DELETE is RESTRICT, matching ReviewLog.verse — the catalog and
-- its verses are content imported by the sync job and must not silently cascade.
ALTER TABLE "Verse"
  ADD CONSTRAINT "Verse_surahId_fkey"
  FOREIGN KEY ("surahId") REFERENCES "Surah"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
