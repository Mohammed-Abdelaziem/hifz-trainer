import { DAY_MS } from "@/lib/constants";

/**
 * UTC midnight (00:00:00.000Z) for the given instant.
 * All server-side daily boundaries (streaks, queues, analytics) use UTC so
 * results are independent of the host's local timezone.
 */
export function utcStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * End of the UTC day (23:59:59.999Z) for the given instant.
 */
export function utcEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

/**
 * ISO calendar day key ("YYYY-MM-DD") in UTC.
 */
export function utcDayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/**
 * UTC midnight `daysAgo` days before `now` (0 = today's UTC midnight).
 */
export function utcDaysAgo(daysAgo: number, now: Date = new Date()): Date {
  const d = utcStartOfDay(now);
  d.setTime(d.getTime() - daysAgo * DAY_MS);
  return d;
}
