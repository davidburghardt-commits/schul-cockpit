import { isOpenTask, remainingMinutes, isOverdue } from '../models/task.js';
import { diffDays, isSameWeek } from '../utils/dateUtils.js';
import { formatMinutes } from '../utils/format.js';
import { urgencyScore, requiredDailyMinutes } from './urgency.js';
import { idealDailyMinutes, roundToStep } from './distribute.js';

function isSchedulable(task, dateISO) {
  if (!isOpenTask(task)) return false;
  if (!task.dueDate) return false;
  if (remainingMinutes(task) <= 0) return false;
  if (task.startDate && task.startDate > dateISO) return false;
  return true;
}

// Mild capacity discount for tasks whose subject differs from an exam in the
// next 2 days — frees a little room for the entry that IS in the exam's
// subject (which will usually already rank higher anyway). Deliberately
// simple; a full exam study-plan generator is out of scope for v1.
function examLoadFactor(task, exams, dateISO) {
  const hasNearbyOtherExam = exams.some((exam) => {
    if (!exam.date || exam.subjectId === task.subjectId) return false;
    const days = diffDays(dateISO, exam.date);
    return days >= 0 && days <= 2;
  });
  return hasNearbyOtherExam ? 0.85 : 1;
}

function topUpLeftover(entries, leftover, remainingByTaskId) {
  let left = leftover;
  for (const entry of entries) {
    if (left <= 0) break;
    const headroom = remainingByTaskId.get(entry.taskId) - entry.minutes;
    if (headroom <= 0) continue;
    const add = Math.min(headroom, left);
    entry.minutes += add;
    left -= add;
  }
  return left;
}

// Pure function of (date, current data) — no persisted schedule anywhere.
// Called fresh on every render, so any task/exam/settings change immediately
// changes tomorrow's (and today's) recommendation.
export function computeSchedule(dateISO, { tasks, exams = [], settings }) {
  const candidates = tasks
    .filter((t) => isSchedulable(t, dateISO))
    .map((task) => ({
      task,
      urgency: urgencyScore(task, dateISO, settings),
      ideal: idealDailyMinutes(task, dateISO, settings),
      overdue: isOverdue(task, dateISO),
    }))
    .sort((a, b) => b.urgency - a.urgency);

  const remainingByTaskId = new Map(candidates.map((c) => [c.task.id, remainingMinutes(c.task)]));
  let capacity = settings.dailyCapacityMinutes;
  const entries = [];

  for (const c of candidates) {
    if (capacity <= 0 || entries.length >= settings.maxTasksPerDay) break;
    const factor = examLoadFactor(c.task, exams, dateISO);
    const raw = Math.min(capacity, c.ideal, remainingByTaskId.get(c.task.id)) * factor;
    let minutes = roundToStep(raw, 5);
    if (minutes <= 0) {
      if (raw > 0) minutes = Math.min(5, capacity, remainingByTaskId.get(c.task.id));
      else continue;
    }
    entries.push({
      taskId: c.task.id,
      subjectId: c.task.subjectId,
      minutes,
      overdue: c.overdue,
      urgency: c.urgency,
    });
    capacity -= minutes;
  }

  if (capacity > 0 && entries.length) {
    capacity = topUpLeftover(entries, capacity, remainingByTaskId);
  }

  return {
    date: dateISO,
    entries,
    totalMinutes: settings.dailyCapacityMinutes - capacity,
    capacityMinutes: settings.dailyCapacityMinutes,
  };
}

function dueLabel(days) {
  if (days < 0) return `ist seit ${Math.abs(days)} Tag(en) überfällig`;
  if (days === 0) return 'ist heute fällig';
  if (days === 1) return 'ist morgen fällig';
  return `ist in ${days} Tagen fällig`;
}

function buildReason(task, minutes, dateISO) {
  const days = diffDays(dateISO, task.dueDate);
  const remaining = remainingMinutes(task);
  return `„${task.title}“ ${dueLabel(days)}, noch ca. ${formatMinutes(remaining)} Arbeit übrig → ${formatMinutes(minutes)} heute.`;
}

// Same schedule, enriched with the task object and a human-readable reason —
// backs the dashboard widget, the Heute mini-schedule and the
// "Was soll ich heute machen?" explanation, so they can never disagree.
export function explainToday(dateISO, ctx) {
  const schedule = computeSchedule(dateISO, ctx);
  const taskById = new Map(ctx.tasks.map((t) => [t.id, t]));
  const items = schedule.entries.map((entry) => {
    const task = taskById.get(entry.taskId);
    return { ...entry, task, reason: task ? buildReason(task, entry.minutes, dateISO) : '' };
  });
  return { ...schedule, items };
}

function minutesToLabel(totalMinutes) {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Turns sequential entry minutes into HH:MM ranges starting at the daily
// work block's start time — used by the Heute page's mini-timeline.
export function toTimeBlocks(entries, startTime) {
  const [h, m] = (startTime || '11:00').split(':').map(Number);
  let cursor = h * 60 + m;
  return entries.map((entry) => {
    const start = cursor;
    cursor += entry.minutes;
    return { ...entry, startLabel: minutesToLabel(start), endLabel: minutesToLabel(cursor) };
  });
}

const CRITICAL_DAYS_THRESHOLD = 5;
const CRITICAL_PACE_RATIO = 0.8;
const BEHIND_SCHEDULE_RATIO = 0.7;

// Gentle, explainable plan-vs-actual warnings. Inline-banner only, never a
// popup, and never more than a small handful at once.
export function computeWarnings(dateISO, ctx) {
  const { tasks, settings, workSessions = [] } = ctx;
  const warnings = [];
  const openTasks = tasks.filter((t) => isOpenTask(t) && t.dueDate);

  for (const task of openTasks) {
    if (isOverdue(task, dateISO)) {
      warnings.push({ tone: 'danger', text: `🔴 „${task.title}“ ist überfällig.` });
      continue;
    }
    const days = diffDays(dateISO, task.dueDate);
    const pace = requiredDailyMinutes(task, dateISO, settings);
    if (pace >= settings.dailyCapacityMinutes * CRITICAL_PACE_RATIO && days <= CRITICAL_DAYS_THRESHOLD) {
      warnings.push({
        tone: 'warning',
        text: `⚠️ „${task.title}“ könnte knapp werden – noch ${formatMinutes(remainingMinutes(task))} in ${days} Tag(en).`,
      });
    }
  }

  const weekSessions = workSessions.filter((ws) => ws.date && isSameWeek(ws.date, dateISO));
  if (weekSessions.length) {
    const planned = weekSessions.reduce((sum, ws) => sum + (ws.plannedMinutes || 0), 0);
    const actual = weekSessions.reduce((sum, ws) => sum + (ws.actualMinutes || 0), 0);
    if (planned > 0 && actual < planned * BEHIND_SCHEDULE_RATIO) {
      warnings.push({
        tone: 'warning',
        text: `⚠️ Du hast diese Woche weniger gearbeitet als geplant (${formatMinutes(actual)} von ${formatMinutes(planned)}).`,
      });
    } else if (planned > 0 && actual > planned) {
      warnings.push({ tone: 'success', text: `🟢 Du bist deinem Wochenziel ${formatMinutes(actual - planned)} voraus.` });
    }
  }

  if (!warnings.length) {
    warnings.push({ tone: 'success', text: '🟢 Du bist bei allen Aufgaben gut im Zeitplan.' });
  }

  return warnings.slice(0, 3);
}
