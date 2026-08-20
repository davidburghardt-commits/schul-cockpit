import { h, clearNode } from '../utils/dom.js';
import { getState } from '../store.js';
import { icon } from '../utils/icons.js';
import { taskRow } from '../components/taskCard.js';
import { emptyState } from '../components/emptyState.js';
import { openSubjectEditor } from '../components/subjectEditor.js';
import { openTaskEditor } from '../components/taskEditor.js';
import { progressBarRow } from '../components/progressBar.js';
import { isOpenTask, isDone, taskProgress } from '../models/task.js';
import { navigate, rerenderCurrent } from '../router.js';

export function renderFachDetail(container, params) {
  const state = getState();
  const subject = state.subjects.find((s) => s.id === params.id);
  clearNode(container);

  if (!subject) {
    container.appendChild(
      h('div.page', {}, [
        h('div.card', {}, [
          emptyState({
            icon: 'book',
            title: 'Fach nicht gefunden',
            message: 'Dieses Fach existiert nicht mehr.',
            ctaLabel: 'Zurück zu Fächern',
            onCta: () => navigate('/faecher'),
          }),
        ]),
      ])
    );
    return;
  }

  const subjectTasks = state.tasks.filter((t) => t.subjectId === subject.id);
  const open = subjectTasks.filter(isOpenTask);
  const done = subjectTasks.filter(isDone);
  const avgProgress = subjectTasks.length
    ? Math.round(subjectTasks.reduce((sum, t) => sum + taskProgress(t), 0) / subjectTasks.length)
    : 0;
  const upcomingExams = state.exams.filter((e) => e.subjectId === subject.id);

  const page = h('div.page', {}, [
    h('div.page-header', {}, [
      h('div.page-header-text', {}, [
        h('div.hstack', {}, [
          h('span.subject-icon', { style: `background:var(--subject-${subject.color}); width:32px; height:32px; font-size:14px;` }, subject.name.slice(0, 1).toUpperCase()),
          h('h1', {}, subject.name),
        ]),
        subject.teacher ? h('p', {}, subject.teacher) : null,
      ]),
      h('div.page-actions', {}, [
        h('button.btn.btn-secondary', { onclick: () => openSubjectEditor({ subjectId: subject.id, onSaved: rerenderCurrent }) }, 'Bearbeiten'),
        h('button.btn.btn-primary', { onclick: () => openTaskEditor({ subjectId: subject.id, onSaved: rerenderCurrent }) }, [
          h('span', { html: icon('plus', 16) }),
          '+ Aufgabe',
        ]),
      ]),
    ]),

    h('div.card', {}, [
      h('h3.card-title', {}, 'Fortschritt'),
      h('div', { style: 'margin-top:10px' }, [progressBarRow(avgProgress)]),
      h('p.text-xs.text-secondary', { style: 'margin-top:6px' }, `${open.length} offen · ${done.length} erledigt${upcomingExams.length ? ` · ${upcomingExams.length} Termin(e)` : ''}`),
    ]),

    subject.notes ? h('div.card', {}, [h('h3.card-title', {}, 'Notizen'), h('p.text-sm', { style: 'margin-top:8px; white-space:pre-wrap' }, subject.notes)]) : null,

    h('div.card', {}, [
      h('h3.card-title', {}, 'Offene Aufgaben'),
      h('div', { style: 'margin-top:12px' }, [
        open.length
          ? h('div.task-list', {}, open.map((t) => taskRow(t, state.subjects, { onChanged: rerenderCurrent })))
          : h('p.text-secondary.text-sm', {}, 'Keine offenen Aufgaben in diesem Fach.'),
      ]),
    ]),

    done.length
      ? h('div.card', {}, [
          h('h3.card-title', {}, 'Erledigte Aufgaben'),
          h('div', { style: 'margin-top:12px' }, [h('div.task-list', {}, done.map((t) => taskRow(t, state.subjects, { onChanged: rerenderCurrent })))]),
        ])
      : null,
  ]);

  container.appendChild(page);
}
