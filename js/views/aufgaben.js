import { h, clearNode } from '../utils/dom.js';
import { getState } from '../store.js';
import { icon } from '../utils/icons.js';
import { taskRow } from '../components/taskCard.js';
import { buildFilterBar } from '../components/filterBar.js';
import { emptyState } from '../components/emptyState.js';
import { openTaskEditor } from '../components/taskEditor.js';
import { taskProgress, remainingMinutes } from '../models/task.js';
import { TASK_PRIORITY_ORDER } from '../utils/constants.js';
import { rerenderCurrent, navigate } from '../router.js';

let filters = { text: '', subjectId: '', status: '', priority: '', sort: 'dueDate' };
let openedFromParam = null;

function matches(task, subjects) {
  if (filters.subjectId && task.subjectId !== filters.subjectId) return false;
  if (filters.status && task.status !== filters.status) return false;
  if (filters.priority && task.priority !== filters.priority) return false;
  if (filters.text) {
    const q = filters.text.toLowerCase();
    const subject = subjects.find((s) => s.id === task.subjectId);
    const haystack = `${task.title} ${task.description || ''} ${subject ? subject.name : ''}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

function sortTasks(tasks) {
  const sorted = tasks.slice();
  switch (filters.sort) {
    case 'priority':
      return sorted.sort((a, b) => TASK_PRIORITY_ORDER.indexOf(b.priority) - TASK_PRIORITY_ORDER.indexOf(a.priority));
    case 'effort':
      return sorted.sort((a, b) => remainingMinutes(b) - remainingMinutes(a));
    case 'progress':
      return sorted.sort((a, b) => taskProgress(b) - taskProgress(a));
    case 'created':
      return sorted.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    case 'dueDate':
    default:
      return sorted.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0;
      });
  }
}

export function renderAufgaben(container, params = {}) {
  const state = getState();
  const { tasks, subjects } = state;
  clearNode(container);

  if (!subjects.length && !tasks.length) {
    container.appendChild(
      h('div.page', {}, [
        h('div.page-header', {}, [h('div.page-header-text', {}, [h('h1', {}, 'Aufgaben')])]),
        h('div.card', {}, [
          emptyState({
            icon: 'book',
            title: 'Noch keine Fächer',
            message: 'Lege zuerst deine Fächer an, dann kannst du Aufgaben hinzufügen.',
            ctaLabel: 'Zu den Fächern',
            onCta: () => navigate('/faecher'),
          }),
        ]),
      ])
    );
    return;
  }

  const filtered = sortTasks(tasks.filter((t) => matches(t, subjects)));

  const page = h('div.page', {}, [
    h('div.page-header', {}, [
      h('div.page-header-text', {}, [h('h1', {}, 'Aufgaben'), h('p', {}, `${tasks.length} Aufgaben insgesamt`)]),
      h('div.page-actions', {}, [
        h('button.btn.btn-primary', { onclick: () => openTaskEditor({ onSaved: rerenderCurrent }) }, [
          h('span', { html: icon('plus', 16) }),
          '+ Aufgabe hinzufügen',
        ]),
      ]),
    ]),
    h('div.card', {}, [
      buildFilterBar(subjects, filters, (next) => {
        filters = next;
        rerenderCurrent();
      }),
    ]),
    filtered.length
      ? h(
          'div.task-list',
          {},
          filtered.map((t) => taskRow(t, subjects, { onChanged: rerenderCurrent }))
        )
      : h('div.card', {}, [
          emptyState({
            icon: 'search',
            title: 'Keine Aufgaben gefunden',
            message: 'Passe die Filter an oder füge eine neue Aufgabe hinzu.',
          }),
        ]),
  ]);

  container.appendChild(page);

  if (params.id && params.id !== openedFromParam) {
    openedFromParam = params.id;
    openTaskEditor({ taskId: params.id, onSaved: () => navigate('/aufgaben') });
  }
  if (!params.id) {
    openedFromParam = null;
  }
}
