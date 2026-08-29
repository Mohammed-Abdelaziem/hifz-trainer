import type { MemoryState } from "@/types/quran";

const DAY_MS = 86_400_000;

export function stabilityScore(
  state: MemoryState | null,
  intervalDays: number,
  dueDate: Date | null,
  now = new Date()
): number | null {
  if (state === null) return null;
  if (intervalDays <= 0) return 4;

  const base = Math.min(100, Math.round(Math.log2(1 + intervalDays) * 18));

  if (dueDate) {
    const overdueDays = (now.getTime() - dueDate.getTime()) / DAY_MS;
    if (overdueDays > 0) {
      return Math.max(2, Math.round(base * Math.max(0.25, 1 - overdueDays / 21)));
    }
  }
  return base;
}

export const STABILITY_COLORS: { min: number; color: string; label: string }[] = [
  { min: 80, color: "#047857", label: "Firm (Manzil-ready)" },
  { min: 60, color: "#16a34a", label: "Strong" },
  { min: 40, color: "#f59e0b", label: "Consolidating" },
  { min: 20, color: "#f97316", label: "Fresh" },
  { min: 0.01, color: "#ef4444", label: "Weak" },
];

export function stabilityColor(score: number | null): string {
  if (score === null || score === 0) return "#e7e5e4";
  for (const tier of STABILITY_COLORS) {
    if (score >= tier.min) return tier.color;
  }
  return "#e7e5e4";
}
