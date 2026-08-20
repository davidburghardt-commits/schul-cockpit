import { h, clearNode } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { getState, dispatch } from '../store.js';
import { createSubject } from '../models/subject.js';
import { SUBJECT_COLORS } from '../utils/constants.js';
import { showToast } from './toast.js';
import { confirmDialog } from './confirmDialog.js';

export function openSubjectEditor({ subjectId = null, onSaved = null } = {}) {
  const state = getState();
  const existing = subjectId ? state.subjects.find((s) => s.id === subjectId) : null;
  const draft = existing ? { ...existing } : { ...createSubject({}), name: '' };
  let errorText = '';

  const backdrop = h('div.panel-backdrop', { style: 'z-index:85' });

  function close() {
    document.removeEventListener('keydown', onKeydown);
    backdrop.remove();
    dialog.remove();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close();
  }

  function save() {
    if (!draft.name || !draft.name.trim()) {
      errorText = 'Bitte einen Namen für das Fach eingeben.';
      render();
      return;
    }
    draft.name = draft.name.trim();
    dispatch({ type: existing ? 'subject/update' : 'subject/add', payload: draft });
    showToast(existing ? 'Fach aktualisiert.' : 'Fach hinzugefügt.');
    close();
    if (onSaved) onSaved(draft);
  }

  async function remove() {
    const relatedTasks = state.tasks.filter((t) => t.subjectId === draft.id).length;
    const ok = await confirmDialog({
      title: 'Fach löschen?',
      message: relatedTasks
        ? `„${draft.name}" sowie ${relatedTasks} zugehörige Aufgabe(n)/Termine werden endgültig gelöscht.`
        : `„${draft.name}" wird endgültig gelöscht.`,
    });
    if (!ok) return;
    dispatch({ type: 'subject/delete', payload: draft.id });
    showToast('Fach gelöscht.');
    close();
    if (onSaved) onSaved(null);
  }

  const dialog = h('div.dialog', { style: 'width:min(420px,92vw); text-align:left' });

  function render() {
    clearNode(dialog);
    dialog.appendChild(h('h3', {}, existing ? 'Fach bearbeiten' : 'Neues Fach'));
    if (errorText) {
      dialog.appendChild(h('div.warning-banner.tone-danger', {}, [h('span', { html: icon('alertTriangle', 16) }), errorText]));
    }

    dialog.appendChild(
      h('div.form-grid', {}, [
        h('div.field', {}, [
          h('label.field-label', {}, 'Name *'),
          h('input.input', {
            type: 'text', value: draft.name, placeholder: 'z. B. Mathematik',
            oninput: (e) => { draft.name = e.target.value; },
          }),
        ]),
        h('div.field', {}, [
          h('label.field-label', {}, 'Farbe'),
          h(
            'div.hstack',
            { style: 'flex-wrap:wrap' },
            SUBJECT_COLORS.map((color) =>
              h('button', {
                type: 'button',
                'aria-label': color,
                onclick: () => { draft.color = color; render(); },
                style: `width:26px;height:26px;border-radius:50%;background:var(--subject-${color});border:2px solid ${draft.color === color ? 'var(--color-text)' : 'transparent'};`,
              })
            )
          ),
        ]),
        h('div.field', {}, [
          h('label.field-label', {}, 'Lehrkraft'),
          h('input.input', {
            type: 'text', value: draft.teacher || '', placeholder: 'Optional',
            oninput: (e) => { draft.teacher = e.target.value; },
          }),
        ]),
        h('div.field', {}, [
          h('label.field-label', {}, 'Notizen'),
          h('textarea.textarea', {
            placeholder: 'Optional',
            oninput: (e) => { draft.notes = e.target.value; },
          }, draft.notes || ''),
        ]),
      ])
    );

    dialog.appendChild(
      h('div.dialog-actions', { style: 'justify-content:space-between' }, [
        existing ? h('button.btn.btn-danger', { type: 'button', onclick: remove }, [h('span', { html: icon('trash', 15) }), 'Löschen']) : h('span'),
        h('div.hstack', {}, [
          h('button.btn.btn-secondary', { type: 'button', onclick: close }, 'Abbrechen'),
          h('button.btn.btn-primary', { type: 'button', onclick: save }, 'Speichern'),
        ]),
      ])
    );
  }

  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', onKeydown);
  render();
  document.body.appendChild(backdrop);
  document.body.appendChild(dialog);
}
