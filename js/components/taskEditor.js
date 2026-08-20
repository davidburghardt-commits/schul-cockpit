import { h, clearNode } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { getState, dispatch } from '../store.js';
import { createTask, taskProgress, hasDerivedProgress } from '../models/task.js';
import { TASK_STATUS, TASK_PRIORITY } from '../utils/constants.js';
import { formatStatus, formatPriority, clamp } from '../utils/format.js';
import { todayISO } from '../utils/dateUtils.js';
import { renderSubtaskList } from './subtaskList.js';
import { showToast } from './toast.js';
import { confirmDialog } from './confirmDialog.js';

const STATUS_OPTIONS = [TASK_STATUS.NICHT_BEGONNEN, TASK_STATUS.IN_BEARBEITUNG, TASK_STATUS.PAUSIERT, TASK_STATUS.ERLEDIGT];
const PRIORITY_OPTIONS = [TASK_PRIORITY.NIEDRIG, TASK_PRIORITY.NORMAL, TASK_PRIORITY.HOCH, TASK_PRIORITY.SEHR_HOCH];

function field(labelText, inputEl, hint) {
  return h('div.field', {}, [
    h('label.field-label', {}, labelText),
    inputEl,
    hint ? h('div.field-hint', {}, hint) : null,
  ]);
}

function select(options, current, onChange, labelFn) {
  return h(
    'select.select',
    { onchange: (e) => onChange(e.target.value) },
    options.map((opt) => h('option', { value: opt, selected: opt === current }, labelFn(opt)))
  );
}

export function openTaskEditor({ taskId = null, subjectId = null, onSaved = null } = {}) {
  const state = getState();
  const existing = taskId ? state.tasks.find((t) => t.id === taskId) : null;

  if (!state.subjects.length) {
    showToast('Bitte lege zuerst ein Fach an, bevor du Aufgaben hinzufügst.');
    return;
  }

  const draft = existing
    ? { ...existing, subtasks: existing.subtasks.map((s) => ({ ...s })), attachments: existing.attachments.map((a) => ({ ...a })) }
    : { ...createTask({ subjectId: subjectId || state.subjects[0].id, dueDate: null, startDate: null }), title: '' };

  let errorText = '';

  const backdrop = h('div.panel-backdrop', {});
  const panel = h('div.panel', {});

  function close() {
    document.removeEventListener('keydown', onKeydown);
    backdrop.remove();
    panel.remove();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close();
  }

  function save() {
    if (!draft.subjectId) { errorText = 'Bitte ein Fach auswählen.'; render(); return; }
    if (!draft.title || !draft.title.trim()) { errorText = 'Bitte einen Aufgabennamen eingeben.'; render(); return; }
    if (!draft.dueDate) { errorText = 'Bitte ein Abgabedatum wählen.'; render(); return; }

    draft.title = draft.title.trim();
    draft.progress = taskProgress(draft);
    draft.updatedAt = new Date().toISOString();
    draft.completedAt = draft.status === TASK_STATUS.ERLEDIGT ? (draft.completedAt || new Date().toISOString()) : null;

    dispatch({ type: existing ? 'task/update' : 'task/add', payload: draft });
    showToast(existing ? 'Aufgabe aktualisiert.' : 'Aufgabe hinzugefügt.');
    close();
    if (onSaved) onSaved(draft);
  }

  async function remove() {
    const ok = await confirmDialog({
      title: 'Aufgabe löschen?',
      message: `„${draft.title}" wird endgültig gelöscht.`,
    });
    if (!ok) return;
    dispatch({ type: 'task/delete', payload: draft.id });
    showToast('Aufgabe gelöscht.');
    close();
    if (onSaved) onSaved(null);
  }

  function render() {
    clearNode(panel);

    const derived = hasDerivedProgress(draft);
    const progressValue = taskProgress(draft);

    const subtaskContainer = h('div', {});

    panel.appendChild(
      h('div.panel-header', {}, [
        h('h3', {}, existing ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'),
        h('button.btn.btn-icon', { onclick: close, 'aria-label': 'Schließen', html: icon('x', 18) }),
      ])
    );

    const body = h('div.panel-body', {}, [
      errorText ? h('div.warning-banner.tone-danger', {}, [h('span', { html: icon('alertTriangle', 16) }), errorText]) : null,

      field('Fach *', select(state.subjects.map((s) => s.id), draft.subjectId, (v) => { draft.subjectId = v; }, (id) => state.subjects.find((s) => s.id === id)?.name || '')),

      field('Aufgabenname *', h('input.input', {
        type: 'text', value: draft.title, placeholder: 'z. B. Trigonometrie Aufgaben',
        oninput: (e) => { draft.title = e.target.value; },
      })),

      field('Beschreibung', h('textarea.textarea', {
        placeholder: 'Optional',
        oninput: (e) => { draft.description = e.target.value; },
      }, draft.description || '')),

      h('div.field-row', {}, [
        field('Status', select(STATUS_OPTIONS, draft.status, (v) => { draft.status = v; render(); }, formatStatus)),
        field('Priorität', select(PRIORITY_OPTIONS, draft.priority, (v) => { draft.priority = v; }, formatPriority)),
      ]),

      h('div.field-row', {}, [
        field('Startdatum', h('input.input', { type: 'date', value: draft.startDate || '', onchange: (e) => { draft.startDate = e.target.value || null; } })),
        field('Abgabedatum *', h('input.input', { type: 'date', value: draft.dueDate || '', onchange: (e) => { draft.dueDate = e.target.value || null; } })),
      ]),

      h('div.field-row', {}, [
        field('Aufwand (Minuten)', h('input.input', {
          type: 'number', min: '0', step: '5', value: String(draft.estimatedMinutes || 0),
          oninput: (e) => { draft.estimatedMinutes = Math.max(0, Number(e.target.value) || 0); },
        })),
        field(
          'Fortschritt',
          h('input.input', {
            type: 'number', min: '0', max: '100', value: String(progressValue),
            disabled: derived,
            oninput: (e) => { draft.progress = clamp(Number(e.target.value) || 0, 0, 100); },
          }),
          derived ? 'Wird automatisch aus Teilaufgaben berechnet' : null
        ),
      ]),

      field('Teilaufgaben', subtaskContainer),

      field('Notizen', h('textarea.textarea', {
        placeholder: 'Optional',
        oninput: (e) => { draft.notes = e.target.value; },
      }, draft.notes || '')),
    ]);

    panel.appendChild(body);

    renderSubtaskList(subtaskContainer, draft.subtasks, () => {
      if (hasDerivedProgress(draft)) render();
    });

    const footer = h('div.panel-footer', {}, [
      existing
        ? h('button.btn.btn-danger', { type: 'button', onclick: remove }, [h('span', { html: icon('trash', 15) }), 'Löschen'])
        : h('span'),
      h('div.hstack', {}, [
        h('button.btn.btn-secondary', { type: 'button', onclick: close }, 'Abbrechen'),
        h('button.btn.btn-primary', { type: 'button', onclick: save }, 'Speichern'),
      ]),
    ]);
    panel.appendChild(footer);
  }

  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', onKeydown);
  render();
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);
}
