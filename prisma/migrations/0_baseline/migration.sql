-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dailyTargetCount" INTEGER NOT NULL DEFAULT 10,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "scheduler" TEXT NOT NULL DEFAULT 'sm2',
    "requestRetention" DOUBLE PRECISION NOT NULL DEFAULT 0.9,
    "lastPasswordChangedAt" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "role" TEXT NOT NULL DEFAULT 'user',
    "lastReadDate" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastRefreshAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Surah" (
    "id" INTEGER NOT NULL,
    "nameArabic" TEXT NOT NULL,
    "nameSimple" TEXT NOT NULL,
    "englishName" TEXT NOT NULL,
    "revelationPlace" TEXT NOT NULL,
    "ayahCount" INTEGER NOT NULL,

    CONSTRAINT "Surah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verse" (
    "verseKey" TEXT NOT NULL,
    "surahId" INTEGER NOT NULL,
    "ayahNumber" INTEGER NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "uthmaniText" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "timestampsJson" TEXT NOT NULL,
    "wordsJson" TEXT,
    "wordsSource" TEXT NOT NULL DEFAULT 'synthetic',
    "recitationUrl" TEXT,
    "tafsir" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Verse_pkey" PRIMARY KEY ("verseKey")
);

-- CreateTable
CREATE TABLE "UserMemoryState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verseKey" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "intervalDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "repetitionCount" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION,
    "stability" DOUBLE PRECISION,
    "dueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewedAt" TIMESTAMP(3),
    "lastReadAt" TIMESTAMP(3),
    "readCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserMemoryState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecitationAudio" (
    "id" TEXT NOT NULL,
    "verseKey" TEXT NOT NULL,
    "reciterId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "RecitationAudio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verseKey" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "quality" INTEGER NOT NULL,
    "intervalDays" DOUBLE PRECISION NOT NULL,
    "easeFactorAfter" DOUBLE PRECISION NOT NULL,
    "difficultyAfter" DOUBLE PRECISION,
    "stabilityAfter" DOUBLE PRECISION,
    "scheduler" TEXT NOT NULL,
    "reviewDurationMs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verseKey" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Verse_surahId_ayahNumber_idx" ON "Verse"("surahId", "ayahNumber");

-- CreateIndex
CREATE INDEX "UserMemoryState_userId_dueDate_idx" ON "UserMemoryState"("userId", "dueDate");

-- CreateIndex
CREATE INDEX "UserMemoryState_userId_state_idx" ON "UserMemoryState"("userId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "UserMemoryState_userId_verseKey_key" ON "UserMemoryState"("userId", "verseKey");

-- CreateIndex
CREATE UNIQUE INDEX "RecitationAudio_verseKey_reciterId_key" ON "RecitationAudio"("verseKey", "reciterId");

-- CreateIndex
CREATE INDEX "ReviewLog_userId_createdAt_idx" ON "ReviewLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ReadingLog_userId_createdAt_idx" ON "ReadingLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMemoryState" ADD CONSTRAINT "UserMemoryState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMemoryState" ADD CONSTRAINT "UserMemoryState_verseKey_fkey" FOREIGN KEY ("verseKey") REFERENCES "Verse"("verseKey") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecitationAudio" ADD CONSTRAINT "RecitationAudio_verseKey_fkey" FOREIGN KEY ("verseKey") REFERENCES "Verse"("verseKey") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_verseKey_fkey" FOREIGN KEY ("verseKey") REFERENCES "Verse"("verseKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingLog" ADD CONSTRAINT "ReadingLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingLog" ADD CONSTRAINT "ReadingLog_verseKey_fkey" FOREIGN KEY ("verseKey") REFERENCES "Verse"("verseKey") ON DELETE CASCADE ON UPDATE CASCADE;
