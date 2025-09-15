// weeks.ts
// (keep your existing visibleWeeks; add the helpers below)

export function toTZ(date: Date, tz?: string): Date {
  // Convert a Date into the same wall-clock time in the given time zone
  // without needing any extra libs.
  return tz ? new Date(new Date(date).toLocaleString("en-US", { timeZone: tz })) : new Date(date);
}

/** ISO week number (1–52/53). Uses the given date's wall-clock time. */
export function isoWeek(date: Date): number {
  // Work in UTC to avoid DST jumps while computing ISO week.
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Thursday of the current week determines the ISO year
  const day = d.getUTCDay() || 7;         // Sun=0 -> 7
  d.setUTCDate(d.getUTCDate() + 4 - day); // move to Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const diffDays = Math.floor((d.getTime() - yearStart.getTime()) / 86400000) + 1;
  return Math.ceil(diffDays / 7);
}

/** Weeks in the ISO year of the given date (52 or 53). */
export function weeksInISOYearFor(date: Date): number {
  // Dec 28 is always in the last ISO week of its year; check its week number.
  const dec28 = new Date(Date.UTC(date.getFullYear(), 11, 28));
  // If Dec 28th's ISO week is 53, this year has 53 weeks.
  return isoWeek(dec28) === 53 ? 53 : 52;
}

/** Current ISO week & its year in a given time zone (defaults to browser TZ). */
export function currentISOWeek(tz?: string): { week: number; year: number; date: Date } {
  const now = toTZ(new Date(), tz);
  return { week: isoWeek(now), year: now.getFullYear(), date: now };
}

/** Your existing function (unchanged) */
export function visibleWeeks(
  weekStart: number,
  window: number,
  min = 1,
  max = 52,
  wrap = true
): number[] {
  const span = max - min + 1
  const arr: number[] = []
  for (let i = 0; i < window; i++) {
    const raw = weekStart + i
    if (!wrap) arr.push(Math.max(min, Math.min(max, raw)))
    else arr.push(((raw - min) % span + span) % span + min)
  }
  return arr
}
