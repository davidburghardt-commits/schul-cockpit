import { remainingMinutes, isOverdue } from '../models/task.js';
import { workdaysBetween } from './workdays.js';

// The per-day quota a task "wants" today: remaining work divided evenly
// across remaining workdays, so work starts early instead of being crammed
// before the deadline. Overdue tasks are willing to claim a whole day.
export function idealDailyMinutes(task, todayISO, settings) {
  const remaining = remainingMinutes(task);
  if (remaining <= 0 || !task.dueDate) return 0;
  if (isOverdue(task, todayISO)) {
    return Math.min(remaining, settings.dailyCapacityMinutes);
  }
  const workdaysLeft = Math.max(1, workdaysBetween(todayISO, task.dueDate, settings));
  return Math.ceil(remaining / workdaysLeft);
}

export function roundToStep(value, step = 5) {
  return Math.round(value / step) * step;
}
