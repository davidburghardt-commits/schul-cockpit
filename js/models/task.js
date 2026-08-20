import { createId } from '../utils/id.js';
import { TASK_STATUS, TASK_PRIORITY } from '../utils/constants.js';
import { todayISO } from '../utils/dateUtils.js';
import { clamp } from '../utils/format.js';

export function createTask({
  subjectId,
  title,
  description = '',
  status = TASK_STATUS.NICHT_BEGONNEN,
  priority = TASK_PRIORITY.NORMAL,
  startDate = null,
  dueDate,
  estimatedMinutes = 60,
  progress = 0,
  subtasks = [],
  notes = '',
  attachments = [],
} = {}) {
  const now = new Date().toISOString();
  return {
    id: createId('task'),
    subjectId: subjectId || null,
    title: (title || '').trim() || 'Neue Aufgabe',
    description: description || '',
    status,
    priority,
    startDate: startDate || null,
    dueDate: dueDate || null,
    estimatedMinutes: Number(estimatedMinutes) || 0,
    progress: clamp(Number(progress) || 0, 0, 100),
    subtasks: subtasks || [],
    notes: notes || '',
    attachments: attachments || [],
    createdAt: now,
    updatedAt: now,
    completedAt: status === TASK_STATUS.ERLEDIGT ? now : null,
  };
}

// If a task has subtasks, progress is always derived from them so it can never
// disagree with the checklist. Tasks without subtasks keep a manually set value.
export function taskProgress(task) {
  if (!task) return 0;
  if (task.status === TASK_STATUS.ERLEDIGT) return 100;
  if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
    const done = task.subtasks.filter((s) => s.done).length;
    return Math.round((100 * done) / task.subtasks.length);
  }
  return clamp(Number(task.progress) || 0, 0, 100);
}

export function hasDerivedProgress(task) {
  return Array.isArray(task.subtasks) && task.subtasks.length > 0;
}

export function remainingMinutes(task) {
  if (!task) return 0;
  const total = Number(task.estimatedMinutes) || 0;
  const progress = taskProgress(task);
  return Math.max(0, Math.round(total * (1 - progress / 100)));
}

export function isOverdue(task, todayIso = todayISO()) {
  if (!task || !task.dueDate) return false;
  if (task.status === TASK_STATUS.ERLEDIGT) return false;
  return task.dueDate < todayIso;
}

export function isOpenTask(task) {
  return task.status !== TASK_STATUS.ERLEDIGT && task.status !== TASK_STATUS.PAUSIERT;
}

export function isDone(task) {
  return task.status === TASK_STATUS.ERLEDIGT;
}
