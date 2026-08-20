import { h, clearNode } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { getState, dispatch } from '../store.js';
import { createExam } from '../models/exam.js';
import { EXAM_TYPE, EXAM_TYPE_LABELS } from '../utils/constants.js';
import { showToast } from './toast.js';
import { confirmDialog } from './confirmDialog.js';

const TYPE_OPTIONS = Object.values(EXAM_TYPE);

function field(labelText, inputEl) {
  return h('div.field', {}, [h('label.field-label', {}, labelText), inputEl]);
}

function select(options, current, onChange, labelFn) {
  return h('select.select', { onchange: (e) => onChange(e.target.value) }, options.map((opt) => h('option', { value: opt, selected: opt === current }, labelFn(opt))));
}

export function openExamEditor({ examId = null, subjectId = null, onSaved = null } = {}) {
  const state = getState();
  const existing = examId ? state.exams.find((e) => e.id === examId) : null;

  if (!state.subjects.length) {
    showToast('Bitte lege zuerst ein Fach an.');
    return;
  }

  const draft = existing ? { ...existing } : { ...createExam({ subjectId: subjectId || state.subjects[0].id }), title: '', date: null };
  let errorText = '';

  const backdrop = h('div.panel-backdrop', {});
  const panel = h('div.panel', {});

  function close() {
    document.removeEventListener('keydown', onKeydown);
    backdrop.remove();
    panel.remove();
  }
  function onKeydown(e) { if (e.key === 'Escape') close(); }

  function save() {
    if (!draft.subjectId) { errorText = 'Bitte ein Fach auswählen.'; render(); return; }
    if (!draft.title || !draft.title.trim()) { errorText = 'Bitte einen Titel eingeben.'; render(); return; }
    if (!draft.date) { errorText = 'Bitte ein Datum wählen.'; render(); return; }
    draft.title = draft.title.trim();
    dispatch({ type: existing ? 'exam/update' : 'exam/add', payload: draft });
    showToast(existing ? 'Termin aktualisiert.' : 'Termin hinzugefügt.');
    close();
    if (onSaved) onSaved(draft);
  }

  async function remove() {
    const ok = await confirmDialog({ title: 'Termin löschen?', message: `„${draft.title}" wird endgültig gelöscht.` });
    if (!ok) return;
    dispatch({ type: 'exam/delete', payload: draft.id });
    showToast('Termin gelöscht.');
    close();
    if (onSaved) onSaved(null);
  }

  function render() {
    clearNode(panel);
    panel.appendChild(h('div.panel-header', {}, [
      h('h3', {}, existing ? 'Termin bearbeiten' : 'Neuer Termin'),
      h('button.btn.btn-icon', { onclick: close, 'aria-label': 'Schließen', html: icon('x', 18) }),
    ]));

    panel.appendChild(h('div.panel-body', {}, [
      errorText ? h('div.warning-banner.tone-danger', {}, [h('span', { html: icon('alertTriangle', 16) }), errorText]) : null,
      field('Fach *', select(state.subjects.map((s) => s.id), draft.subjectId, (v) => { draft.subjectId = v; }, (id) => state.subjects.find((s) => s.id === id)?.name || '')),
      field('Art', select(TYPE_OPTIONS, draft.type, (v) => { draft.type = v; }, (t) => EXAM_TYPE_LABELS[t])),
      field('Titel *', h('input.input', { type: 'text', value: draft.title, placeholder: 'z. B. Klausur: Trigonometrie', oninput: (e) => { draft.title = e.target.value; } })),
      h('div.field-row', {}, [
        field('Datum *', h('input.input', { type: 'date', value: draft.date || '', onchange: (e) => { draft.date = e.target.value || null; } })),
        field('Uhrzeit', h('input.input', { type: 'time', value: draft.time || '', onchange: (e) => { draft.time = e.target.value; } })),
      ]),
      field('Thema / Beschreibung', h('textarea.textarea', { oninput: (e) => { draft.description = e.target.value; } }, draft.description || '')),
      field('Lernfortschritt (%)', h('input.input', { type: 'number', min: '0', max: '100', value: String(draft.learningProgress || 0), oninput: (e) => { draft.learningProgress = Math.max(0, Math.min(100, Number(e.target.value) || 0)); } })),
    ]));

    panel.appendChild(h('div.panel-footer', {}, [
      existing ? h('button.btn.btn-danger', { type: 'button', onclick: remove }, [h('span', { html: icon('trash', 15) }), 'Löschen']) : h('span'),
      h('div.hstack', {}, [
        h('button.btn.btn-secondary', { type: 'button', onclick: close }, 'Abbrechen'),
        h('button.btn.btn-primary', { type: 'button', onclick: save }, 'Speichern'),
      ]),
    ]));
  }

  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', onKeydown);
  render();
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);
}
