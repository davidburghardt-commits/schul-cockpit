import { parseISODate, addDays, isInRange } from '../utils/dateUtils.js';

const MAX_LOOKAHEAD_DAYS = 730; // safety bound against runaway loops on bad data

export function isHoliday(iso, holidays = []) {
  return holidays.some((h) => h.start && h.end && isInRange(iso, h.start, h.end));
}

export function isWorkday(iso, settings) {
  const date = parseISODate(iso);
  if (!date) return false;
  if (!settings.workdays.includes(date.getDay())) return false;
  if (isHoliday(iso, settings.holidays)) return false;
  return true;
}

// Count of workdays from `fromISO` through `toISO` inclusive (today counts as
// available). Returns 0 if the range is invalid/inverted.
export function workdaysBetween(fromISO, toISO, settings) {
  if (!fromISO || !toISO || toISO < fromISO) return 0;
  let count = 0;
  let cursor = fromISO;
  let guard = 0;
  while (cursor <= toISO && guard < MAX_LOOKAHEAD_DAYS) {
    if (isWorkday(cursor, settings)) count += 1;
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return count;
}

export function nextWorkday(iso, settings) {
  let cursor = addDays(iso, 1);
  let guard = 0;
  while (guard < MAX_LOOKAHEAD_DAYS) {
    if (isWorkday(cursor, settings)) return cursor;
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return cursor;
}
