import * as db from './db.js';
import { buildSeedData } from './seed/seedData.js';

let state = initState();
const listeners = new Set();

function initState() {
  const loaded = db.load();
  if (loaded) return loaded;

  // First-ever launch: start with realistic seed data instead of a blank app.
  const fresh = db.getInitialState();
  const { subjects, tasks, exams } = buildSeedData();
  fresh.subjects = subjects;
  fresh.tasks = tasks;
  fresh.exams = exams;
  fresh.settings.seedDataLoaded = true;
  db.save(fresh);
  return fresh;
}

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify(action) {
  for (const fn of listeners) fn(state, action);
}

export function dispatch(action) {
  const next = reducer(state, action);
  state = next;
  db.save(state);
  notify(action);
  return state;
}

function upsert(list, item) {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [...list, item];
  const copy = list.slice();
  copy[idx] = item;
  return copy;
}

function remove(list, id) {
  return list.filter((x) => x.id !== id);
}

function reducer(current, action) {
  switch (action.type) {
    case 'subject/add':
      return { ...current, subjects: [...current.subjects, action.payload] };
    case 'subject/update':
      return { ...current, subjects: upsert(current.subjects, action.payload) };
    case 'subject/delete': {
      const id = action.payload;
      return {
        ...current,
        subjects: remove(current.subjects, id),
        tasks: current.tasks.filter((t) => t.subjectId !== id),
        exams: current.exams.filter((e) => e.subjectId !== id),
      };
    }

    case 'task/add':
      return { ...current, tasks: [...current.tasks, action.payload] };
    case 'task/update':
      return { ...current, tasks: upsert(current.tasks, action.payload) };
    case 'task/delete': {
      const id = action.payload;
      return {
        ...current,
        tasks: remove(current.tasks, id),
        workSessions: current.workSessions.filter((w) => w.taskId !== id),
      };
    }
    case 'task/clearAll':
      return { ...current, tasks: [], workSessions: [] };

    case 'exam/add':
      return { ...current, exams: [...current.exams, action.payload] };
    case 'exam/update':
      return { ...current, exams: upsert(current.exams, action.payload) };
    case 'exam/delete':
      return { ...current, exams: remove(current.exams, action.payload) };
    case 'exam/clearAll':
      return { ...current, exams: [] };

    case 'workSession/add':
      return { ...current, workSessions: [...current.workSessions, action.payload] };

    case 'settings/update':
      return { ...current, settings: { ...current.settings, ...action.payload } };

    case 'data/replace':
      return action.payload;

    case 'data/reseed': {
      const fresh = db.getInitialState();
      const { subjects, tasks, exams } = buildSeedData();
      fresh.subjects = subjects;
      fresh.tasks = tasks;
      fresh.exams = exams;
      fresh.settings = { ...current.settings, seedDataLoaded: true };
      return fresh;
    }

    case 'data/clear': {
      const empty = db.getInitialState();
      empty.settings = { ...current.settings, seedDataLoaded: false };
      return empty;
    }

    default:
      console.warn('Unbekannte Aktion:', action.type);
      return current;
  }
}
