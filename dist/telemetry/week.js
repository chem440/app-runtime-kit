const DEFAULT_TZ = 'America/Los_Angeles';
function getZoneOffsetMs(date, tz) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: 'numeric',
        hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(date);
    const zoneHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const utcHour = date.getUTCHours();
    let offsetHours = zoneHour - utcHour;
    if (offsetHours > 12)
        offsetHours -= 24;
    if (offsetHours < -12)
        offsetHours += 24;
    return offsetHours * 60 * 60 * 1000;
}
/**
 * Return the start of the calendar week (Sunday at midnight) in the given timezone.
 *
 * @param date - The reference date (defaults to now).
 * @param tz - IANA timezone string (defaults to `'America/Los_Angeles'`).
 */
export function getWeekStartInZone(date = new Date(), tz = DEFAULT_TZ) {
    const offsetMs = getZoneOffsetMs(date, tz);
    const zoneTime = date.getTime() + offsetMs;
    const zoneDate = new Date(zoneTime);
    const dayOfWeek = zoneDate.getUTCDay();
    const sundayZone = new Date(zoneDate);
    sundayZone.setUTCDate(sundayZone.getUTCDate() - dayOfWeek);
    sundayZone.setUTCHours(0, 0, 0, 0);
    const sundayOffsetMs = getZoneOffsetMs(sundayZone, tz);
    return new Date(sundayZone.getTime() - sundayOffsetMs);
}
/**
 * Return the ISO week key (e.g. `'2026-W15'`) for the calendar week containing `date`,
 * anchored to the given timezone.
 *
 * @param date - The reference date (defaults to now).
 * @param tz - IANA timezone string (defaults to `'America/Los_Angeles'`).
 */
export function getWeekKey(date = new Date(), tz = DEFAULT_TZ) {
    const weekStart = getWeekStartInZone(date, tz);
    const year = weekStart.getUTCFullYear();
    const startOfYear = new Date(Date.UTC(year, 0, 1));
    const days = Math.floor((weekStart.getTime() - startOfYear.getTime()) / 86400000);
    const weekNum = Math.ceil((days + startOfYear.getUTCDay() + 1) / 7);
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
}
/**
 * @deprecated Use `getWeekStartInZone` instead.
 * Kept for backwards compatibility — defaults to Pacific Time.
 */
export function getWeekStartPT(date = new Date()) {
    return getWeekStartInZone(date, DEFAULT_TZ);
}
