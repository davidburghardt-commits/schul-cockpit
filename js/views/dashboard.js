import { h, clearNode } from '../utils/dom.js';
import { getState } from '../store.js';
import { icon } from '../utils/icons.js';
import { formatLongDate, todayISO, diffDays } from '../utils/dateUtils.js';
import { statCard } from '../components/statCard.js';
import { deadlineList } from '../components/deadlineList.js';
import { emptyState } from '../components/emptyState.js';
import { openTaskEditor } from '../components/taskEditor.js';
import { isOpenTask, isDone, taskProgress } from '../models/task.js';
import { TASK_PRIORITY } from '../utils/constants.js';
import { rerenderCurrent } from '../router.js';
import { explainToday, computeWarnings } from '../planner/planner.js';
import { warningBanners } from '../components/warningBanner.js';
import { findSubject, subjectColorVar } from '../utils/subjectHelpers.js';
import { formatMinutes } from '../utils/format.js';

function addTaskButton(label = '+ Aufgabe hinzufügen') {
  return h('button.btn.btn-primary', { onclick: () => openTaskEditor({ onSaved: rerenderCurrent }) }, [
    h('span', { html: icon('plus', 16) }),
    label,
  ]);
}

export function renderDashboard(container) {
  const state = getState();
  const { tasks, subjects, exams, settings, workSessions } = state;
  clearNode(container);

  const today = todayISO();

  if (!tasks.length) {
    const page = h('div.page', {}, [
      h('div.page-header', {}, [
        h('div.page-header-text', {}, [h('h1', {}, 'Dashboard'), h('p', {}, formatLongDate(today))]),
      ]),
      h('div.card', {}, [
        emptyState({
          icon: 'checkSquare',
          title: 'Noch keine Aufgaben',
          message: 'Füge deine erste Aufgabe hinzu, um deinen persönlichen Schulplan zu erstellen.',
          ctaLabel: '+ Erste Aufgabe hinzufügen',
          onCta: () => openTaskEditor({ onSaved: rerenderCurrent }),
        }),
      ]),
    ]);
    container.appendChild(page);
    return;
  }

  const openTasks = tasks.filter(isOpenTask);
  const doneTasks = tasks.filter(isDone);
  const highPriority = openTasks.filter((t) => t.priority === TASK_PRIORITY.HOCH || t.priority === TASK_PRIORITY.SEHR_HOCH);
  const soonDue = openTasks.filter((t) => t.dueDate && diffDays(today, t.dueDate) <= 7);
  const avgProgress = openTasks.length
    ? Math.round(openTasks.reduce((sum, t) => sum + taskProgress(t), 0) / openTasks.length)
    : 0;

  const plan = explainToday(today, { tasks, exams, settings });
  const warnings = computeWarnings(today, { tasks, settings, workSessions });

  const recommendationRows = plan.items.length
    ? plan.items.map((item) => {
        const subject = findSubject(subjects, item.subjectId);
        return h('div.hero-recommendation-row', {}, [
          h('span.subject-dot', { style: `background:${subjectColorVar(subject)}` }),
          h('span', {}, `${subject ? subject.name : 'Ohne Fach'} — ${formatMinutes(item.minutes)}`),
        ]);
      })
    : [h('span.text-sm', {}, 'Für heute ist nichts Dringendes eingeplant — genieß deine Stunde.')];

  const hero = h('div.hero-card', {}, [
    h('span.hero-eyebrow', {}, 'Deine Arbeitsstunde'),
    h('span.hero-date', {}, formatLongDate(today)),
    h('span.hero-slot', {}, `${settings.workBlockStart} – ${settings.workBlockEnd} Uhr`),
    h('div.hero-recommendation', {}, recommendationRows),
    plan.totalMinutes > 0 ? h('span.hero-goal', {}, `Tagesziel: ${formatMinutes(plan.totalMinutes)}`) : null,
    h('a.btn.hero-cta', { href: '#/heute' }, ['Zur Heute-Seite', h('span', { html: icon('arrowRight', 15) })]),
  ]);

  const stats = h('div.stat-grid', {}, [
    statCard(tasks.length, 'Aufgaben insgesamt'),
    statCard(openTasks.length, 'Offen'),
    statCard(doneTasks.length, 'Erledigt'),
    statCard(avgProgress + '%', 'Ø Fortschritt'),
  ]);

  const columns = h('div.dashboard-columns', {}, [
    h('div.card', {}, [
      h('div.card-header', {}, [
        h('div', {}, [h('h3.card-title', {}, 'Nächste Abgaben'), h('p.card-subtitle', {}, `${soonDue.length} bald fällig · ${highPriority.length} hohe Priorität`)]),
        h('a.btn.btn-ghost.btn-sm', { href: '#/aufgaben' }, 'Alle ansehen'),
      ]),
      deadlineList(openTasks, subjects, { limit: 6 }),
    ]),
    h('div.card', {}, [
      h('div.card-header', {}, [h('h3.card-title', {}, 'Fächer')]),
      h(
        'div.vstack',
        {},
        subjects.slice(0, 6).map((s) => {
          const subjectTasks = openTasks.filter((t) => t.subjectId === s.id);
          return h('div.hstack', { style: 'justify-content:space-between' }, [
            h('span.subject-chip', {}, [h('span.subject-dot', { style: `background:var(--subject-${s.color})` }), s.name]),
            h('span.text-xs.text-secondary', {}, `${subjectTasks.length} offen`),
          ]);
        })
      ),
    ]),
  ]);

  const page = h('div.page', {}, [
    h('div.page-header', {}, [
      h('div.page-header-text', {}, [h('h1', {}, 'Dashboard'), h('p', {}, formatLongDate(today))]),
      h('div.page-actions', {}, [addTaskButton()]),
    ]),
    warnings.length ? warningBanners(warnings) : null,
    h('div.dashboard-hero', {}, [hero, h('div.card', {}, [h('h3.card-title', {}, 'Überblick'), h('p.card-subtitle', {}, 'Ein ruhiger Blick auf deinen Stand.'), stats])]),
    columns,
  ]);

  container.appendChild(page);
}
