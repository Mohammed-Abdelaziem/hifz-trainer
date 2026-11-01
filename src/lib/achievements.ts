/**
 * Achievement badges for the memorization journey. Pure and fully derived:
 * every input (review counts, known verses/surahs, streaks) comes from
 * durable ledger/state queries, so a badge list needs no persistence of its
 * own and can never go stale relative to the data it describes.
 */

export interface AchievementSnapshot {
  totalReviews: number;
  versesKnown: number;
  surahsKnown: number;
  streakCurrent: number;
  streakLongest: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  /** Category key used to group badges and show "next up" per family. */
  family: "streak" | "reviews" | "verses" | "surahs";
  target: number;
  metric: keyof AchievementSnapshot;
  earned: boolean;
  /** Only on unearned badges: how far along this tier the user is. */
  progress?: { current: number; target: number };
}

interface BadgeDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  family: Achievement["family"];
  metric: keyof AchievementSnapshot;
  target: number;
}

const DEFINITIONS: BadgeDef[] = [
  { id: "streak-3", title: "Kindled", description: "3-day streak", emoji: "🔥", family: "streak", metric: "streakCurrent", target: 3 },
  { id: "streak-7", title: "A Week of Light", description: "7-day streak", emoji: "🕯️", family: "streak", metric: "streakCurrent", target: 7 },
  { id: "streak-14", title: "Two Steady Weeks", description: "14-day streak", emoji: "🌻", family: "streak", metric: "streakCurrent", target: 14 },
  { id: "streak-30", title: "A Month of Hifz", description: "30-day streak", emoji: "🏆", family: "streak", metric: "streakCurrent", target: 30 },
  { id: "longest-100", title: "Century Run", description: "100-day streak (longest ever)", emoji: "💎", family: "streak", metric: "streakLongest", target: 100 },
  { id: "reviews-50", title: "First Steps", description: "50 verse reviews", emoji: "📖", family: "reviews", metric: "totalReviews", target: 50 },
  { id: "reviews-500", title: "Committed", description: "500 verse reviews", emoji: "📗", family: "reviews", metric: "totalReviews", target: 500 },
  { id: "reviews-2000", title: "Scholar of the Book", description: "2,000 verse reviews", emoji: "📘", family: "reviews", metric: "totalReviews", target: 2000 },
  { id: "verses-10", title: "Ten Verses", description: "10 verses marked known", emoji: "✅", family: "verses", metric: "versesKnown", target: 10 },
  { id: "verses-100", title: "A Hundred Verses", description: "100 verses marked known", emoji: "🌟", family: "verses", metric: "versesKnown", target: 100 },
  { id: "verses-500", title: "Half a Hizb Horizon", description: "500 verses marked known", emoji: "🕌", family: "verses", metric: "versesKnown", target: 500 },
  { id: "surah-1", title: "First Surah", description: "one complete surah", emoji: "🥇", family: "surahs", metric: "surahsKnown", target: 1 },
  { id: "surah-5", title: "Five Surahs", description: "5 complete surahs", emoji: "🎖️", family: "surahs", metric: "surahsKnown", target: 5 },
  { id: "surah-25", title: "A Quarter of the Quran", description: "25 complete surahs", emoji: "🏅", family: "surahs", metric: "surahsKnown", target: 25 },
];

/**
 * Evaluates the badge list against a snapshot. Earned badges carry no
 * progress; each unearned badge shows progress toward its next level so the
 * card doubles as a to-do list.
 */
export function evaluateAchievements(snapshot: AchievementSnapshot): Achievement[] {
  return DEFINITIONS.map((def) => {
    const value = Math.max(0, Math.floor(snapshot[def.metric] ?? 0));
    const earned = value >= def.target;
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      emoji: def.emoji,
      family: def.family,
      target: def.target,
      metric: def.metric,
      earned,
      progress: earned ? undefined : { current: value, target: def.target },
    };
  });
}

/** Count of earned badges — handy for the card header. */
export function countEarned(achievements: Achievement[]): number {
  return achievements.reduce((n, a) => n + (a.earned ? 1 : 0), 0);
}
