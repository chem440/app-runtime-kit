/**
 * Return the start of the calendar week (Sunday at midnight) in the given timezone.
 *
 * @param date - The reference date (defaults to now).
 * @param tz - IANA timezone string (defaults to `'America/Los_Angeles'`).
 */
export declare function getWeekStartInZone(date?: Date, tz?: string): Date;
/**
 * Return the ISO week key (e.g. `'2026-W15'`) for the calendar week containing `date`,
 * anchored to the given timezone.
 *
 * @param date - The reference date (defaults to now).
 * @param tz - IANA timezone string (defaults to `'America/Los_Angeles'`).
 */
export declare function getWeekKey(date?: Date, tz?: string): string;
/**
 * @deprecated Use `getWeekStartInZone` instead.
 * Kept for backwards compatibility — defaults to Pacific Time.
 */
export declare function getWeekStartPT(date?: Date): Date;
