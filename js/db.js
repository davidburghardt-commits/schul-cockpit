// Persistence layer. Everything else in the app talks to the store, and the
// store talks to this module — swapping localStorage for IndexedDB or a
// server later only means rewriting load()/save() here.
import { STORAGE_KEY } from './utils/constants.js';
import { defaultSettings } from './models/settings.js';

export function getInitialState() {
  return {
    subjects: [],
    tasks: [],
    exams: [],
    workSessions: [],
    settings: defaultSettings(),
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Defensive normalization: never let a corrupted/partial localStorage blob
// crash the app. Missing arrays/fields fall back to safe defaults.
function normalize(raw) {
  const base = getInitialState();
  if (!isPlainObject(raw)) return base;
  return {
    subjects: Array.isArray(raw.subjects) ? raw.subjects : base.subjects,
    tasks: Array.isArray(raw.tasks) ? raw.tasks : base.tasks,
    exams: Array.isArray(raw.exams) ? raw.exams : base.exams,
    workSessions: Array.isArray(raw.workSessions) ? raw.workSessions : base.workSessions,
    settings: isPlainObject(raw.settings) ? { ...base.settings, ...raw.settings } : base.settings,
  };
}

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalize(parsed);
  } catch (err) {
    console.error('Schul-Cockpit: gespeicherte Daten konnten nicht gelesen werden, starte mit leerem Zustand.', err);
    return null;
  }
}

export function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error('Schul-Cockpit: Speichern fehlgeschlagen (Speicher voll?).', err);
    return false;
  }
}

export function exportJSON(state) {
  return JSON.stringify(state, null, 2);
}

export function importJSON(jsonString) {
  const parsed = JSON.parse(jsonString);
  return normalize(parsed);
}
