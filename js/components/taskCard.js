import { h } from '../utils/dom.js';
import { taskProgress, remainingMinutes, isOverdue } from '../models/task.js';
import { findSubject, subjectColorVar, urgencyTone } from '../utils/subjectHelpers.js';
import { formatMinutes, formatPriority } from '../utils/format.js';
import { formatRelativeDays, todayISO, diffDays } from '../utils/dateUtils.js';
import { progressBar } from './progressBar.js';
import { TASK_PRIORITY, TASK_STATUS } from '../utils/constants.js';
import { openTaskEditor } from './taskEditor.js';

export function taskRow(task, subjects, { onChanged } = {}) {
  const subject = findSubject(subjects, task.subjectId);
  const progress = taskProgress(task);
  const today = todayISO();
  const overdue = isOverdue(task, today);
  const dueDays = task.dueDate ? diffDays(today, task.dueDate) : null;
  const tone = task.status === TASK_STATUS.ERLEDIGT ? 'success' : dueDays != null ? urgencyTone(dueDays) : 'neutral';

  const metaParts = [
    h('span.subject-chip', {}, [
      h('span.subject-dot', { style: `background:${subjectColorVar(subject)}` }),
      subject ? subject.name : 'Ohne Fach',
    ]),
  ];

  if (task.dueDate) {
    metaParts.push(h('span', {}, task.status === TASK_STATUS.ERLEDIGT ? 'Erledigt' : formatRelativeDays(today, task.dueDate)));
  }
  if (task.status !== TASK_STATUS.ERLEDIGT && remainingMinutes(task) > 0) {
    metaParts.push(h('span', {}, `${formatMinutes(remainingMinutes(task))} übrig`));
  }
  if (task.priority === TASK_PRIORITY.HOCH || task.priority === TASK_PRIORITY.SEHR_HOCH) {
    metaParts.push(h(`span.badge.badge-${task.priority === TASK_PRIORITY.SEHR_HOCH ? 'danger' : 'warning'}`, {}, formatPriority(task.priority)));
  }
  if (overdue) {
    metaParts.push(h('span.badge.badge-danger', {}, 'Überfällig'));
  }

  const open = () => openTaskEditor({ taskId: task.id, onSaved: onChanged });

  return h('div.task-row', {
    role: 'button',
    tabindex: '0',
    onclick: open,
    onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } },
  }, [
    h('div.task-row-main', {}, [
      h('div.task-row-title', {}, task.title),
      h('div.task-row-meta', {}, metaParts),
    ]),
    h('div.task-row-progress', {}, [progressBar(progress, { tone: tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : progress >= 100 ? 'success' : '' })]),
    h('div.task-row-side', {}, [h('span.text-xs.text-secondary', {}, `${progress}%`)]),
  ]);
}
