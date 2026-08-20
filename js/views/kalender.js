import { h, clearNode } from '../utils/dom.js';
import { getState } from '../store.js';
import { icon } from '../utils/icons.js';
import { renderMonthGrid } from '../components/calendarGrid.js';
import { findSubject, subjectColorVar } from '../utils/subjectHelpers.js';
import {
  todayISO, parseISODate, toISODate, addDays, isValidISODate,
  formatLongDate, formatShortDate, monthLabel, startOfWeekISO, WEEKDAYS_LONG_DE,
} from '../utils/dateUtils.js';
import { isHoliday } from '../planner/workdays.js';
import { computeSchedule, toTimeBlocks } from '../planner/planner.js';
import { navigate, rerenderCurrent } from '../router.js';
import { EXAM_TYPE_LABELS } from '../utils/constants.js';

let view = 'month'; // 'month' | 'week' | 'day'
let cursorISO = todayISO();

function viewToggle() {
  const options = [['month', 'Monat'], ['week', 'Woche'], ['day', 'Tag']];
  return h('div.segmented', {}, options.map(([value, label]) =>
    h(`button${view === value ? '.active' : ''}`, { type: 'button', onclick: () => { view = value; rerenderCurrent(); } }, label)
  ));
}

function shiftCursor(delta) {
  if (view === 'month') {
    const date = parseISODate(cursorISO);
    date.setMonth(date.getMonth() + delta);
    cursorISO = toISODate(date);
  } else if (view === 'week') {
    cursorISO = addDays(cursorISO, delta * 7);
  } else {
    cursorISO = addDays(cursorISO, delta);
  }
  rerenderCurrent();
}

function headerLabel() {
  const date = parseISODate(cursorISO);
  if (view === 'month') return monthLabel(date.getFullYear(), date.getMonth());
  if (view === 'week') {
    const start = startOfWeekISO(cursorISO);
    const end = addDays(start, 6);
    return `${formatShortDate(start)} – ${formatShortDate(end)}`;
  }
  return formatLongDate(cursorISO);
}

function dayAgenda(iso, { tasks, exams, subjects }) {
  const dueTasks = tasks.filter((t) => t.dueDate === iso);
  const dueExams = exams.filter((e) => e.date === iso);
  if (!dueTasks.length && !dueExams.length) {
    return h('p.text-secondary.text-sm', {}, 'Keine Termine oder Abgaben.');
  }
  return h('div.vstack', {}, [
    ...dueExams.map((e) => {
      const subject = findSubject(subjects, e.subjectId);
      return h('div.hstack', { style: 'cursor:pointer', onclick: () => navigate(`/klausuren/${e.id}`) }, [
        h('span.subject-dot', { style: `background:${subjectColorVar(subject)}` }),
        h('span.text-sm', {}, `${EXAM_TYPE_LABELS[e.type]}: ${e.title}`),
        e.time ? h('span.text-xs.text-secondary', {}, e.time) : null,
      ]);
    }),
    ...dueTasks.map((t) => {
      const subject = findSubject(subjects, t.subjectId);
      return h('div.hstack', { style: 'cursor:pointer', onclick: () => navigate(`/aufgaben/${t.id}`) }, [
        h('span.subject-dot', { style: `background:${subjectColorVar(subject)}` }),
        h('span.text-sm', {}, `Abgabe: ${t.title}`),
      ]);
    }),
  ]);
}

function renderWeek(container, state) {
  const start = startOfWeekISO(cursorISO);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  container.appendChild(
    h('div.card-grid', {}, days.map((iso) => {
      const holiday = isHoliday(iso, state.settings.holidays);
      return h('div.card', { style: iso === todayISO() ? 'border-color:var(--color-accent)' : holiday ? 'background:var(--color-warning-soft)' : '' }, [
        h('div.hstack', { style: 'justify-content:space-between' }, [
          h('strong.text-sm', {}, `${WEEKDAYS_LONG_DE[parseISODate(iso).getDay()]}`),
          h('span.text-xs.text-secondary', {}, formatShortDate(iso)),
        ]),
        h('div', { style: 'margin-top:8px' }, [dayAgenda(iso, state)]),
      ]);
    }))
  );
}

function renderDay(container, state) {
  const iso = cursorISO;
  const schedule = computeSchedule(iso, state);
  const blocks = toTimeBlocks(schedule.entries, state.settings.workBlockStart);
  const holiday = isHoliday(iso, state.settings.holidays);

  container.appendChild(
    h('div.vstack', {}, [
      holiday ? h('div.warning-banner.tone-warning', {}, 'Schulfreier Tag / Ferien.') : null,
      h('div.card', {}, [h('h3.card-title', {}, 'Termine & Abgaben'), h('div', { style: 'margin-top:10px' }, [dayAgenda(iso, state)])]),
      h('div.card', {}, [
        h('h3.card-title', {}, 'Geplante Arbeit'),
        h('p.card-subtitle', {}, `${state.settings.workBlockStart} – ${state.settings.workBlockEnd} Uhr`),
        blocks.length
          ? h('div.timeline', { style: 'margin-top:10px' }, blocks.map((block) => {
              const subject = findSubject(state.subjects, block.subjectId);
              const task = state.tasks.find((t) => t.id === block.taskId);
              return h('div.timeline-block', {}, [
                h('div.timeline-time', {}, `${block.startLabel} – ${block.endLabel}`),
                h('div.timeline-content', {}, [
                  h('div.hstack', {}, [h('span.subject-dot', { style: `background:${subjectColorVar(subject)}` }), h('strong', {}, subject ? subject.name : '')]),
                  h('span.text-sm', {}, task ? task.title : ''),
                ]),
              ]);
            }))
          : h('p.text-secondary.text-sm', { style: 'margin-top:10px' }, 'Für diesen Tag ist nichts eingeplant.'),
      ]),
    ])
  );
}

export function renderKalender(container, params = {}) {
  const state = getState();
  clearNode(container);

  if (params.date && isValidISODate(params.date)) {
    cursorISO = params.date;
    view = 'day';
  }

  const page = h('div.page', {}, [
    h('div.page-header', {}, [
      h('div.page-header-text', {}, [h('h1', {}, 'Kalender')]),
      h('div.page-actions', {}, [viewToggle()]),
    ]),
    h('div.calendar-header', {}, [
      h('button.btn.btn-icon', { onclick: () => shiftCursor(-1), html: icon('chevronLeft', 18) }),
      h('h3', { style: 'min-width:200px' }, headerLabel()),
      h('button.btn.btn-icon', { onclick: () => shiftCursor(1), html: icon('chevronRight', 18) }),
      h('button.btn.btn-secondary.btn-sm', { onclick: () => { cursorISO = todayISO(); rerenderCurrent(); } }, 'Heute'),
    ]),
  ]);

  const body = h('div', {});
  page.appendChild(body);

  if (view === 'month') {
    const date = parseISODate(cursorISO);
    body.appendChild(renderMonthGrid(date.getFullYear(), date.getMonth(), { ...state, todayISO: todayISO() }));
  } else if (view === 'week') {
    renderWeek(body, state);
  } else {
    renderDay(body, state);
  }

  container.appendChild(page);
}
