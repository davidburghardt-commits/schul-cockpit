import { h } from '../utils/dom.js';
import { navigate } from '../router.js';
import { findSubject, subjectColorVar, urgencyTone } from '../utils/subjectHelpers.js';
import { formatRelativeDays, todayISO, diffDays } from '../utils/dateUtils.js';

export function deadlineList(tasks, subjects, { limit = 6, emptyText = 'Keine anstehenden Abgaben.' } = {}) {
  const today = todayISO();
  const items = tasks
    .filter((t) => t.dueDate)
    .slice()
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0))
    .slice(0, limit);

  if (!items.length) {
    return h('p.text-secondary.text-sm', {}, emptyText);
  }

  return h(
    'div.deadline-list',
    {},
    items.map((task) => {
      const subject = findSubject(subjects, task.subjectId);
      const days = diffDays(today, task.dueDate);
      const tone = urgencyTone(days);
      const open = () => navigate(`/aufgaben/${task.id}`);
      return h('div.deadline-item', {
        role: 'button',
        tabindex: '0',
        onclick: open,
        onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } },
      }, [
        h('span.subject-dot', { style: `background:${subjectColorVar(subject)}` }),
        h('span.deadline-title', {}, task.title),
        h(`span.badge.badge-${tone}`, {}, formatRelativeDays(today, task.dueDate)),
      ]);
    })
  );
}
