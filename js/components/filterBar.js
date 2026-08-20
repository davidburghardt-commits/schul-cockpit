import { h } from '../utils/dom.js';
import { TASK_STATUS_ORDER, TASK_PRIORITY_ORDER } from '../utils/constants.js';
import { formatStatus, formatPriority } from '../utils/format.js';

export const SORT_OPTIONS = [
  { value: 'dueDate', label: 'Abgabe' },
  { value: 'priority', label: 'Priorität' },
  { value: 'effort', label: 'Aufwand' },
  { value: 'progress', label: 'Fortschritt' },
  { value: 'created', label: 'Erstellung' },
];

function select(value, options, onChange, placeholder) {
  const blank = placeholder ? [h('option', { value: '', selected: value === '' }, placeholder)] : [];
  return h(
    'select.select',
    { onchange: (e) => onChange(e.target.value) },
    [...blank, ...options.map((opt) => h('option', { value: opt.value, selected: value === opt.value }, opt.label))]
  );
}

export function buildFilterBar(subjects, filters, onChange) {
  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name }));
  const statusOptions = TASK_STATUS_ORDER.map((s) => ({ value: s, label: formatStatus(s) }));
  const priorityOptions = TASK_PRIORITY_ORDER.map((p) => ({ value: p, label: formatPriority(p) }));

  return h('div.filter-bar', {}, [
    h('input.input', {
      type: 'search',
      placeholder: 'Aufgaben durchsuchen …',
      style: 'width:220px',
      value: filters.text || '',
      oninput: (e) => onChange({ ...filters, text: e.target.value }),
    }),
    select(filters.subjectId || '', subjectOptions, (v) => onChange({ ...filters, subjectId: v }), 'Alle Fächer'),
    select(filters.status || '', statusOptions, (v) => onChange({ ...filters, status: v }), 'Alle Status'),
    select(filters.priority || '', priorityOptions, (v) => onChange({ ...filters, priority: v }), 'Alle Prioritäten'),
    h('span.spacer'),
    h('div.hstack', {}, [
      h('span.text-xs.text-secondary', {}, 'Sortieren:'),
      select(filters.sort || 'dueDate', SORT_OPTIONS, (v) => onChange({ ...filters, sort: v }), null),
    ]),
  ]);
}
