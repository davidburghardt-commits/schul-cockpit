import { remainingMinutes, isOverdue } from '../models/task.js';
import { TASK_PRIORITY_WEIGHT } from '../utils/constants.js';
import { workdaysBetween } from './workdays.js';

// The daily pace (minutes/day) required to finish exactly on time, spreading
// the remaining work evenly across the remaining workdays. Recomputed fresh
// from current progress every call, so falling behind raises it automatically.
export function requiredDailyMinutes(task, todayISO, settings) {
  const remaining = remainingMinutes(task);
  if (remaining <= 0 || !task.dueDate) return 0;
  const workdaysLeft = Math.max(1, workdaysBetween(todayISO, task.dueDate, settings));
  return remaining / workdaysLeft;
}

// Simple, explainable urgency score: how hard today needs to work on this
// task relative to daily capacity, weighted by priority. Overdue tasks always
// win regardless of priority.
export function urgencyScore(task, todayISO, settings) {
  if (isOverdue(task, todayISO)) return Infinity;
  const remaining = remainingMinutes(task);
  if (remaining <= 0 || !task.dueDate) return 0;
  const pace = requiredDailyMinutes(task, todayISO, settings);
  const weight = TASK_PRIORITY_WEIGHT[task.priority] || 1;
  return (pace / settings.dailyCapacityMinutes) * weight;
}
