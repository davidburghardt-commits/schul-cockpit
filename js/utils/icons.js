// Minimal hand-drawn line-icon set (no external icon font/library dependency).
const WRAP = (inner, size = 18) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

const PATHS = {
  home: '<polyline points="3 10 12 3 21 10"/><path d="M5 9v11h14V9"/>',
  sun: '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.2" y1="4.2" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.8" y2="19.8"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.2" y1="19.8" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.8" y2="4.2"/>',
  check: '<polyline points="4 12 9 17 20 6"/>',
  checkSquare: '<rect x="4" y="4" width="16" height="16" rx="3"/><polyline points="8 12.5 11 15.5 16 9"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
  edit: '<path d="M4 20l0.9-4L15 5.9l3.1 3.1L8 19.1 4 20z"/>',
  book: '<rect x="4" y="4" width="16" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/>',
  chart: '<rect x="4" y="12" width="3.4" height="8" rx="0.8"/><rect x="10.3" y="7" width="3.4" height="13" rx="0.8"/><rect x="16.6" y="3" width="3.4" height="17" rx="0.8"/>',
  settings: '<circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="8" stroke-dasharray="1.6 3.4"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  search: '<circle cx="10" cy="10" r="6.2"/><line x1="20" y1="20" x2="14.6" y2="14.6"/>',
  x: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/>',
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
  chevronRight: '<polyline points="9 18 15 12 9 6"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>',
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/>',
  play: '<polygon points="6 4 20 12 6 20"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  square: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><polyline points="8 12 11 15 16 9"/>',
  alertTriangle: '<path d="M12 3.5l9.5 16.5h-19z"/><line x1="12" y1="9.5" x2="12" y2="14"/><circle cx="12" cy="16.7" r="0.15" fill="currentColor" stroke="currentColor" stroke-width="1.6"/>',
  moon: '<path d="M20 14.3A8.4 8.4 0 1 1 9.7 4a7 7 0 0 0 10.3 10.3z"/>',
  monitor: '<rect x="3" y="4" width="18" height="12.5" rx="2"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="12" y1="16.5" x2="12" y2="20"/>',
  arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  download: '<path d="M12 3v12"/><polyline points="7 10 12 15 17 10"/><line x1="5" y1="21" x2="19" y2="21"/>',
  upload: '<path d="M12 21V9"/><polyline points="7 14 12 9 17 14"/><line x1="5" y1="3" x2="19" y2="3"/>',
  layers: '<polygon points="12 3 21 8 12 13 3 8"/><polyline points="3 15 12 20 21 15"/><polyline points="3 11.5 12 16.5 21 11.5"/>',
};

export function icon(name, size = 18) {
  return WRAP(PATHS[name] || PATHS.checkCircle, size);
}
