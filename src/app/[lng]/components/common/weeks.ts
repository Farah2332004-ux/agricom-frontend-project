// Weeks & ISO-week helpers with timezone support (no external libs)

/** Convert a Date into the same wall-clock time in the given time zone. */
export function toTZ(date: Date, tz?: string): Date {
  return tz ? new Date(new Date(date).toLocaleString("en-US", { timeZone: tz })) : new Date(date);
}

/** ISO week number (1–52/53) for the provided local date. */
export function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;          // Sun=0 -> 7
  d.setUTCDate(d.getUTCDate() + 4 - day);  // move to Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const diffDays = Math.floor((d.getTime() - yearStart.getTime()) / 86400000) + 1;
  return Math.ceil(diffDays / 7);
}

/** Number of ISO weeks in the ISO year of the given date (52 or 53). */
export function weeksInISOYearFor(date: Date): number {
  // Dec 28 is always in the last ISO week of its ISO year
  const dec28 = new Date(Date.UTC(date.getFullYear(), 11, 28));
  return isoWeek(dec28) === 53 ? 53 : 52;
}

/** Current ISO week + year for a specific timezone (defaults to browser tz). */
export function currentISOWeek(tz?: string): { week: number; year: number; date: Date } {
  const now = toTZ(new Date(), tz);
  return { week: isoWeek(now), year: now.getFullYear(), date: now };
}

/** Visible weeks helper (wraps across 1..max if wrap=true). */
export function visibleWeeks(
  weekStart: number,
  window: number,
  min = 1,
  max = 53,   // allow 53 by default
  wrap = true
): number[] {
  const span = max - min + 1;
  const arr: number[] = [];
  for (let i = 0; i < window; i++) {
    const raw = weekStart + i;
    if (!wrap) arr.push(Math.max(min, Math.min(max, raw)));
    else arr.push(((raw - min) % span + span) % span + min);
  }
  return arr;
}
