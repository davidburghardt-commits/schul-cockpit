import { h, clearNode } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { createSubtask } from '../models/subtask.js';

// Renders an editable subtask checklist into `container`. `subtasks` is a
// mutable array reference; `onChange` fires after every mutation so the
// caller can refresh derived progress elsewhere in the same form.
export function renderSubtaskList(container, subtasks, onChange) {
  clearNode(container);

  const list = h(
    'div.subtask-list',
    {},
    subtasks.map((subtask, index) =>
      h(`div.subtask-row${subtask.done ? '.done' : ''}`, {}, [
        h('input', {
          type: 'checkbox',
          checked: subtask.done,
          onchange: (e) => {
            subtasks[index] = { ...subtask, done: e.target.checked };
            renderSubtaskList(container, subtasks, onChange);
            onChange();
          },
        }),
        h('span.subtask-title', {}, subtask.title),
        h('button.btn.btn-icon.btn-sm', {
          type: 'button',
          'aria-label': 'Teilaufgabe entfernen',
          onclick: () => {
            subtasks.splice(index, 1);
            renderSubtaskList(container, subtasks, onChange);
            onChange();
          },
          html: icon('x', 14),
        }),
      ])
    )
  );

  const addRow = h('div.hstack', {}, [
    h('input.input', {
      type: 'text',
      placeholder: 'Teilaufgabe hinzufügen …',
      onkeydown: (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addFromInput(e.target);
        }
      },
    }),
    h('button.btn.btn-secondary.btn-sm', {
      type: 'button',
      onclick: (e) => addFromInput(e.currentTarget.previousElementSibling),
      html: icon('plus', 14),
    }),
  ]);

  function addFromInput(input) {
    const value = input.value.trim();
    if (!value) return;
    subtasks.push(createSubtask(value));
    input.value = '';
    renderSubtaskList(container, subtasks, onChange);
    onChange();
  }

  container.appendChild(list);
  container.appendChild(addRow);
}
