// All dates in the app are plain "YYYY-MM-DD" ISO strings, always parsed/formatted
// as LOCAL calendar dates (never UTC) to avoid off-by-one errors around midnight/DST.

export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function isValidISODate(iso) {
  return parseISODate(iso) !== null;
}

export function todayISO() {
  return toISODate(new Date());
}

export function addDays(iso, days) {
  const date = parseISODate(iso);
  if (!date) return iso;
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function diffDays(fromISO, toISO) {
  const a = parseISODate(fromISO);
  const b = parseISODate(toISO);
  if (!a || !b) return 0;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}

export function isWeekend(iso) {
  const date = parseISODate(iso);
  if (!date) return false;
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isBefore(aISO, bISO) {
  return aISO < bISO;
}

export function isAfter(aISO, bISO) {
  return aISO > bISO;
}

export function clampISO(iso, minISO, maxISO) {
  if (minISO && iso < minISO) return minISO;
  if (maxISO && iso > maxISO) return maxISO;
  return iso;
}

export function isInRange(iso, startISO, endISO) {
  return iso >= startISO && iso <= endISO;
}

const WEEKDAYS_SHORT_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const WEEKDAYS_LONG_DE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS_LONG_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

export function formatWeekdayLong(iso) {
  const date = parseISODate(iso);
  if (!date) return '';
  return WEEKDAYS_LONG_DE[date.getDay()];
}

export function formatWeekdayShort(iso) {
  const date = parseISODate(iso);
  if (!date) return '';
  return WEEKDAYS_SHORT_DE[date.getDay()];
}

export function formatLongDate(iso) {
  const date = parseISODate(iso);
  if (!date) return '–';
  return `${WEEKDAYS_LONG_DE[date.getDay()]}, ${date.getDate()}. ${MONTHS_LONG_DE[date.getMonth()]}`;
}

export function formatShortDate(iso) {
  const date = parseISODate(iso);
  if (!date) return '–';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}.${m}.${date.getFullYear()}`;
}

export function formatCompactDate(iso) {
  const date = parseISODate(iso);
  if (!date) return '–';
  return `${date.getDate()}. ${MONTHS_LONG_DE[date.getMonth()].slice(0, 3)}`;
}

// Human "in 3 Tagen" / "heute" / "überfällig seit 2 Tagen" style relative label.
export function formatRelativeDays(fromISO, toISO) {
  const diff = diffDays(fromISO, toISO);
  if (diff === 0) return 'heute';
  if (diff === 1) return 'morgen';
  if (diff === -1) return 'gestern';
  if (diff > 1) return `in ${diff} Tagen`;
  return `überfällig seit ${Math.abs(diff)} Tagen`;
}

export function monthLabel(year, month) {
  return `${MONTHS_LONG_DE[month]} ${year}`;
}

export { MONTHS_LONG_DE, WEEKDAYS_LONG_DE, WEEKDAYS_SHORT_DE };
