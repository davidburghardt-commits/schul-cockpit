export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function roundToNearest(value, step) {
  return Math.round(value / step) * step;
}

export function formatMinutes(totalMinutes) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (minutes === 0) return '0 Min.';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} Min.`;
  if (rest === 0) return `${hours} Std.`;
  return `${hours} Std. ${rest} Min.`;
}

export function formatPercent(value) {
  return `${Math.round(clamp(value, 0, 100))}%`;
}

const PRIORITY_LABELS = {
  niedrig: 'Niedrig',
  normal: 'Normal',
  hoch: 'Hoch',
  sehr_hoch: 'Sehr hoch',
};

export function formatPriority(priority) {
  return PRIORITY_LABELS[priority] || priority;
}

const STATUS_LABELS = {
  nicht_begonnen: 'Nicht begonnen',
  in_bearbeitung: 'In Bearbeitung',
  pausiert: 'Pausiert',
  erledigt: 'Erledigt',
};

export function formatStatus(status) {
  return STATUS_LABELS[status] || status;
}

export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
