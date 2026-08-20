import { h } from '../utils/dom.js';
import { toISODate, WEEKDAYS_SHORT_DE } from '../utils/dateUtils.js';
import { isHoliday } from '../planner/workdays.js';
import { subjectColorVar, findSubject } from '../utils/subjectHelpers.js';
import { navigate } from '../router.js';

const ORDERED_WEEKDAY_LABELS = [1, 2, 3, 4, 5, 6, 0].map((d) => WEEKDAYS_SHORT_DE[d]);

function firstWeekdayOffset(year, month) {
  const day = new Date(year, month, 1).getDay(); // 0=Sun..6=Sat
  return day === 0 ? 6 : day - 1;
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function chip(entry, subjects, kind) {
  const subject = findSubject(subjects, entry.subjectId);
  return h(
    'span.calendar-chip',
    {
      style: `--chip-color:${subjectColorVar(subject)}`,
      onclick: (e) => {
        e.stopPropagation();
        navigate(kind === 'exam' ? `/klausuren/${entry.id}` : `/aufgaben/${entry.id}`);
      },
    },
    entry.title
  );
}

export function renderMonthGrid(year, month, { tasks, exams, settings, subjects, todayISO }) {
  const offset = firstWeekdayOffset(year, month);
  const total = daysInMonth(year, month);
  const cells = [];

  for (let i = 0; i < 42; i += 1) {
    const dayNum = i - offset + 1;
    const date = new Date(year, month, dayNum);
    const iso = toISODate(date);
    const outside = dayNum < 1 || dayNum > total;
    cells.push({ iso, dayNum: date.getDate(), outside });
  }

  const grid = h('div.calendar-grid', {}, [
    ...ORDERED_WEEKDAY_LABELS.map((label) => h('div.calendar-weekday', {}, label)),
    ...cells.map((cell) => {
      const dueTasks = tasks.filter((t) => t.dueDate === cell.iso);
      const dueExams = exams.filter((e) => e.date === cell.iso);
      const holiday = isHoliday(cell.iso, settings.holidays);
      const classes = ['calendar-cell'];
      if (cell.outside) classes.push('outside');
      if (cell.iso === todayISO) classes.push('today');
      if (holiday) classes.push('holiday');

      const all = [...dueExams.map((e) => ({ entry: e, kind: 'exam' })), ...dueTasks.map((t) => ({ entry: t, kind: 'task' }))];
      const items = all.slice(0, 3).map(({ entry, kind }) => chip(entry, subjects, kind));
      const overflow = all.length - items.length;
      const dots = all.slice(0, 6).map(({ entry, kind }) => {
        const subject = findSubject(subjects, entry.subjectId);
        return h('span.calendar-dot', { style: `background:${subjectColorVar(subject)}` });
      });

      return h(
        `div.${classes.join('.')}`,
        { onclick: () => navigate(`/kalender/${cell.iso}`) },
        [
          h('span.cell-date', {}, String(cell.dayNum)),
          ...items,
          overflow > 0 ? h('span.text-xs.text-secondary', {}, `+${overflow} mehr`) : null,
          dots.length ? h('div.calendar-dots', {}, dots) : null,
        ]
      );
    }),
  ]);

  return grid;
}
