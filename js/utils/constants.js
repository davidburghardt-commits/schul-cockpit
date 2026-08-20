export const TASK_STATUS = {
  NICHT_BEGONNEN: 'nicht_begonnen',
  IN_BEARBEITUNG: 'in_bearbeitung',
  PAUSIERT: 'pausiert',
  ERLEDIGT: 'erledigt',
};

export const TASK_STATUS_ORDER = [
  TASK_STATUS.NICHT_BEGONNEN,
  TASK_STATUS.IN_BEARBEITUNG,
  TASK_STATUS.PAUSIERT,
  TASK_STATUS.ERLEDIGT,
];

export const TASK_PRIORITY = {
  NIEDRIG: 'niedrig',
  NORMAL: 'normal',
  HOCH: 'hoch',
  SEHR_HOCH: 'sehr_hoch',
};

export const TASK_PRIORITY_ORDER = [
  TASK_PRIORITY.NIEDRIG,
  TASK_PRIORITY.NORMAL,
  TASK_PRIORITY.HOCH,
  TASK_PRIORITY.SEHR_HOCH,
];

export const TASK_PRIORITY_WEIGHT = {
  [TASK_PRIORITY.NIEDRIG]: 0.7,
  [TASK_PRIORITY.NORMAL]: 1.0,
  [TASK_PRIORITY.HOCH]: 1.4,
  [TASK_PRIORITY.SEHR_HOCH]: 1.9,
};

export const EXAM_TYPE = {
  KLAUSUR: 'klausur',
  TEST: 'test',
  PRAESENTATION: 'praesentation',
  REFERAT: 'referat',
  ABGABE: 'abgabe',
};

export const EXAM_TYPE_LABELS = {
  [EXAM_TYPE.KLAUSUR]: 'Klausur',
  [EXAM_TYPE.TEST]: 'Test',
  [EXAM_TYPE.PRAESENTATION]: 'Präsentation',
  [EXAM_TYPE.REFERAT]: 'Referat',
  [EXAM_TYPE.ABGABE]: 'Abgabe',
};

export const SUBJECT_COLORS = [
  'blue', 'purple', 'green', 'orange', 'red', 'teal', 'pink', 'amber', 'indigo', 'slate',
];

export const WORK_SESSION_OUTCOME = {
  ERLEDIGT: 'erledigt',
  TEILWEISE: 'teilweise',
  NICHT_GESCHAFFT: 'nicht_geschafft',
};

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'home' },
  { path: '/heute', label: 'Heute', icon: 'sun' },
  { path: '/aufgaben', label: 'Aufgaben', icon: 'check' },
  { path: '/kalender', label: 'Kalender', icon: 'calendar' },
  { path: '/klausuren', label: 'Klausuren', icon: 'edit' },
  { path: '/faecher', label: 'Fächer', icon: 'book' },
  { path: '/statistiken', label: 'Statistiken', icon: 'chart' },
  { path: '/einstellungen', label: 'Einstellungen', icon: 'settings' },
];

export const STORAGE_KEY = 'schulcockpit:v1';
