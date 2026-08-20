import { h, clearNode } from '../utils/dom.js';
import { getState } from '../store.js';
import { icon } from '../utils/icons.js';
import { emptyState } from '../components/emptyState.js';
import { openExamEditor } from '../components/examEditor.js';
import { progressBarRow } from '../components/progressBar.js';
import { findSubject, subjectColorVar, urgencyTone } from '../utils/subjectHelpers.js';
import { formatRelativeDays, todayISO, diffDays } from '../utils/dateUtils.js';
import { EXAM_TYPE_LABELS } from '../utils/constants.js';
import { rerenderCurrent, navigate } from '../router.js';

let openedFromParam = null;

export function renderKlausuren(container, params = {}) {
  const state = getState();
  const { exams, subjects } = state;
  clearNode(container);
  const today = todayISO();

  const header = h('div.page-header', {}, [
    h('div.page-header-text', {}, [h('h1', {}, 'Klausuren & Termine'), h('p', {}, `${exams.length} Termine`)]),
    h('div.page-actions', {}, [
      h('button.btn.btn-primary', { onclick: () => openExamEditor({ onSaved: rerenderCurrent }) }, [h('span', { html: icon('plus', 16) }), '+ Termin hinzufügen']),
    ]),
  ]);

  if (!exams.length) {
    container.appendChild(h('div.page', {}, [header, h('div.card', {}, [
      emptyState({
        icon: 'edit',
        title: 'Noch keine Klausuren oder Termine',
        message: 'Trage Klausuren, Tests, Referate oder Abgabetermine ein, um sie im Blick zu behalten.',
        ctaLabel: '+ Ersten Termin hinzufügen',
        onCta: () => openExamEditor({ onSaved: rerenderCurrent }),
      }),
    ])]));
    return;
  }

  const sorted = exams.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const list = h('div.task-list', {}, sorted.map((exam) => {
    const subject = findSubject(subjects, exam.subjectId);
    const days = exam.date ? diffDays(today, exam.date) : null;
    const tone = days != null ? urgencyTone(days) : 'neutral';
    return h('div.task-row', {
      role: 'button', tabindex: '0',
      onclick: () => openExamEditor({ examId: exam.id, onSaved: rerenderCurrent }),
      onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') openExamEditor({ examId: exam.id, onSaved: rerenderCurrent }); },
    }, [
      h('div.task-row-main', {}, [
        h('div.task-row-title', {}, exam.title),
        h('div.task-row-meta', {}, [
          h('span.subject-chip', {}, [h('span.subject-dot', { style: `background:${subjectColorVar(subject)}` }), subject ? subject.name : 'Ohne Fach']),
          h('span.badge.badge-neutral', {}, EXAM_TYPE_LABELS[exam.type]),
          exam.time ? h('span', {}, exam.time) : null,
          days != null ? h(`span.badge.badge-${tone}`, {}, formatRelativeDays(today, exam.date)) : null,
        ]),
      ]),
      h('div.task-row-progress', {}, [progressBarRow(exam.learningProgress || 0)]),
    ]);
  }));

  container.appendChild(h('div.page', {}, [header, list]));

  if (params.id && params.id !== openedFromParam) {
    openedFromParam = params.id;
    openExamEditor({ examId: params.id, onSaved: () => navigate('/klausuren') });
  }
  if (!params.id) openedFromParam = null;
}
