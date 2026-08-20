import { h, clearNode } from '../utils/dom.js';
import { getState } from '../store.js';
import { statCard } from '../components/statCard.js';
import { emptyState } from '../components/emptyState.js';
import { isDone, taskProgress, isOpenTask } from '../models/task.js';
import { findSubject } from '../utils/subjectHelpers.js';
import { formatMinutes, formatPercent } from '../utils/format.js';
import { todayISO, isSameWeek, parseISODate } from '../utils/dateUtils.js';

function isSameMonth(iso, refIso) {
  const a = parseISODate(iso);
  const b = parseISODate(refIso);
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function renderStatistiken(container) {
  const state = getState();
  const { tasks, subjects, workSessions } = state;
  clearNode(container);
  const today = todayISO();

  const header = h('div.page-header', {}, [h('div.page-header-text', {}, [h('h1', {}, 'Statistiken'), h('p', {}, 'Ein ruhiger Rückblick auf deine Arbeit.')])]);

  if (!workSessions.length && !tasks.length) {
    container.appendChild(h('div.page', {}, [header, h('div.card', {}, [
      emptyState({ icon: 'chart', title: 'Noch keine Daten', message: 'Sobald du Aufgaben bearbeitest, siehst du hier deine Statistiken.' }),
    ])]));
    return;
  }

  const weekSessions = workSessions.filter((ws) => ws.date && isSameWeek(ws.date, today));
  const monthSessions = workSessions.filter((ws) => ws.date && isSameMonth(ws.date, today));
  const weekMinutes = weekSessions.reduce((s, ws) => s + (ws.actualMinutes || 0), 0);
  const monthMinutes = monthSessions.reduce((s, ws) => s + (ws.actualMinutes || 0), 0);

  const doneTasks = tasks.filter(isDone);
  const openTasks = tasks.filter(isOpenTask);
  const avgProgress = openTasks.length ? Math.round(openTasks.reduce((s, t) => s + taskProgress(t), 0) / openTasks.length) : 0;

  const withDueAndCompleted = doneTasks.filter((t) => t.dueDate && t.completedAt);
  const onTime = withDueAndCompleted.filter((t) => t.completedAt.slice(0, 10) <= t.dueDate).length;
  const punctuality = withDueAndCompleted.length ? Math.round((100 * onTime) / withDueAndCompleted.length) : null;

  const bySubject = new Map();
  for (const ws of workSessions) {
    const task = tasks.find((t) => t.id === ws.taskId);
    if (!task) continue;
    const key = task.subjectId || 'none';
    bySubject.set(key, (bySubject.get(key) || 0) + (ws.actualMinutes || 0));
  }
  const subjectRows = [...bySubject.entries()].sort((a, b) => b[1] - a[1]);
  const maxSubjectMinutes = subjectRows.length ? subjectRows[0][1] : 0;

  const page = h('div.page', {}, [
    header,
    h('div.stat-grid', {}, [
      statCard(formatMinutes(weekMinutes), 'Arbeitszeit diese Woche'),
      statCard(formatMinutes(monthMinutes), 'Arbeitszeit diesen Monat'),
      statCard(doneTasks.length, 'Aufgaben erledigt'),
      statCard(avgProgress + '%', 'Ø Fortschritt (offen)'),
    ]),

    h('div.card', {}, [
      h('h3.card-title', {}, 'Pünktlichkeit'),
      punctuality == null
        ? h('p.text-secondary.text-sm', { style: 'margin-top:8px' }, 'Noch keine abgeschlossenen Aufgaben mit Abgabedatum.')
        : h('div', { style: 'margin-top:10px' }, [
            h('div.bar-row', {}, [
              h('span.bar-label', {}, 'Pünktlich erledigt'),
              h('div.bar-track', {}, [h('div.bar-fill', { style: `width:${punctuality}%` })]),
              h('span.bar-value', {}, formatPercent(punctuality)),
            ]),
            h('p.text-xs.text-secondary', { style: 'margin-top:6px' }, `${onTime} von ${withDueAndCompleted.length} Aufgaben pünktlich abgegeben.`),
          ]),
    ]),

    h('div.card', {}, [
      h('h3.card-title', {}, 'Zeit pro Fach'),
      subjectRows.length
        ? h('div.vstack', { style: 'margin-top:10px' }, subjectRows.map(([subjectId, minutes]) => {
            const subject = findSubject(subjects, subjectId);
            const pct = maxSubjectMinutes ? Math.round((100 * minutes) / maxSubjectMinutes) : 0;
            return h('div.bar-row', {}, [
              h('span.bar-label', {}, subject ? subject.name : 'Ohne Fach'),
              h('div.bar-track', {}, [h('div.bar-fill', { style: `width:${pct}%` })]),
              h('span.bar-value', {}, formatMinutes(minutes)),
            ]);
          }))
        : h('p.text-secondary.text-sm', { style: 'margin-top:8px' }, 'Noch keine protokollierten Arbeitsblöcke. Nutze den Fokusmodus auf der Heute-Seite.'),
    ]),
  ]);

  container.appendChild(page);
}
