import { h, clearNode } from '../utils/dom.js';
import { getState } from '../store.js';
import { icon } from '../utils/icons.js';
import { emptyState } from '../components/emptyState.js';
import { openSubjectEditor } from '../components/subjectEditor.js';
import { progressBar } from '../components/progressBar.js';
import { isOpenTask, isDone, taskProgress } from '../models/task.js';
import { navigate, rerenderCurrent } from '../router.js';

export function renderFaecher(container) {
  const state = getState();
  const { subjects, tasks } = state;
  clearNode(container);

  const header = h('div.page-header', {}, [
    h('div.page-header-text', {}, [h('h1', {}, 'Fächer'), h('p', {}, `${subjects.length} Fächer`)]),
    h('div.page-actions', {}, [
      h('button.btn.btn-primary', { onclick: () => openSubjectEditor({ onSaved: rerenderCurrent }) }, [
        h('span', { html: icon('plus', 16) }),
        '+ Fach hinzufügen',
      ]),
    ]),
  ]);

  if (!subjects.length) {
    container.appendChild(
      h('div.page', {}, [
        header,
        h('div.card', {}, [
          emptyState({
            icon: 'book',
            title: 'Noch keine Fächer',
            message: 'Lege dein erstes Fach an, um Aufgaben zuordnen zu können.',
            ctaLabel: '+ Erstes Fach hinzufügen',
            onCta: () => openSubjectEditor({ onSaved: rerenderCurrent }),
          }),
        ]),
      ])
    );
    return;
  }

  const grid = h(
    'div.subject-grid',
    {},
    subjects.map((subject) => {
      const subjectTasks = tasks.filter((t) => t.subjectId === subject.id);
      const open = subjectTasks.filter(isOpenTask);
      const done = subjectTasks.filter(isDone);
      const avgProgress = subjectTasks.length
        ? Math.round(subjectTasks.reduce((sum, t) => sum + taskProgress(t), 0) / subjectTasks.length)
        : 0;

      const goToDetail = () => navigate(`/faecher/${subject.id}`);
      return h('div.card.subject-card', {
        role: 'button',
        tabindex: '0',
        onclick: goToDetail,
        onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToDetail(); } },
      }, [
        h('div.subject-card-header', {}, [
          h('div.subject-icon', { style: `background:var(--subject-${subject.color})` }, subject.name.slice(0, 1).toUpperCase()),
          h('div', {}, [
            h('h3', {}, subject.name),
            subject.teacher ? h('p.card-subtitle', {}, subject.teacher) : null,
          ]),
        ]),
        progressBar(avgProgress),
        h('div.hstack', { style: 'justify-content:space-between' }, [
          h('span.text-xs.text-secondary', {}, `${open.length} offen · ${done.length} erledigt`),
          h('span.text-xs.text-secondary', {}, `${avgProgress}%`),
        ]),
      ]);
    })
  );

  container.appendChild(h('div.page', {}, [header, grid]));
}
