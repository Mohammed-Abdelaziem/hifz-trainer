import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicDigits(n: number): string {
  return String(n)
    .split("")
    .map((d) => ARABIC_DIGITS[Number(d)] ?? d)
    .join("");
}

export function formatMs(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatDueIn(iso: string, now = new Date()): string {
  const diffMs = new Date(iso).getTime() - now.getTime();
  const absMin = Math.abs(diffMs) / 60_000;
  let label: string;
  if (absMin < 1) label = "now";
  else if (absMin < 60) label = `${Math.round(absMin)}m`;
  else if (absMin < 1440) label = `${Math.round(absMin / 60)}h`;
  else label = `${Math.round(absMin / 1440)}d`;
  if (label === "now") return diffMs >= 0 ? "due now" : "due now";
  return diffMs >= 0 ? `in ${label}` : `overdue ${label}`;
}
