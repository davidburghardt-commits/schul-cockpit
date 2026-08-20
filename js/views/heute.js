import { h, clearNode } from '../utils/dom.js';
import { getState } from '../store.js';
import { icon } from '../utils/icons.js';
import { explainToday, toTimeBlocks, computeWarnings } from '../planner/planner.js';
import { warningBanners } from '../components/warningBanner.js';
import { emptyState } from '../components/emptyState.js';
import { openTaskEditor } from '../components/taskEditor.js';
import { findSubject, subjectColorVar } from '../utils/subjectHelpers.js';
import { formatLongDate, todayISO } from '../utils/dateUtils.js';
import { formatMinutes } from '../utils/format.js';
import { navigate, rerenderCurrent } from '../router.js';

let explainVisible = false;

export function renderHeute(container) {
  const state = getState();
  const { tasks, exams, subjects, settings, workSessions } = state;
  const today = todayISO();
  clearNode(container);

  if (!tasks.length) {
    container.appendChild(
      h('div.page', {}, [
        h('div.page-header', {}, [h('div.page-header-text', {}, [h('h1', {}, 'Heute'), h('p', {}, formatLongDate(today))])]),
        h('div.card', {}, [
          emptyState({
            icon: 'sun',
            title: 'Noch keine Aufgaben',
            message: 'Füge deine erste Aufgabe hinzu, damit dir Schul-Cockpit deine Arbeitsstunde planen kann.',
            ctaLabel: '+ Erste Aufgabe hinzufügen',
            onCta: () => openTaskEditor({ onSaved: rerenderCurrent }),
          }),
        ]),
      ])
    );
    return;
  }

  const result = explainToday(today, { tasks, exams, settings });
  const blocks = toTimeBlocks(result.entries, settings.workBlockStart);
  const warnings = computeWarnings(today, { tasks, settings, workSessions });
  const doneToday = workSessions.filter((ws) => ws.date === today).reduce((sum, ws) => sum + (ws.actualMinutes || 0), 0);

  const timeline = blocks.length
    ? h(
        'div.timeline',
        {},
        blocks.map((block) => {
          const item = result.items.find((i) => i.taskId === block.taskId);
          const subject = findSubject(subjects, block.subjectId);
          return h('div.timeline-block', {}, [
            h('div.timeline-time', {}, `${block.startLabel} – ${block.endLabel}`),
            h('div.timeline-content', {}, [
              h('div.hstack', {}, [
                h('span.subject-dot', { style: `background:${subjectColorVar(subject)}` }),
                h('strong', {}, subject ? subject.name : 'Ohne Fach'),
                block.overdue ? h('span.badge.badge-danger', {}, 'Überfällig') : null,
              ]),
              h('span.text-sm', {}, item && item.task ? item.task.title : ''),
              h('button.btn.btn-secondary.btn-sm', {
                style: 'align-self:flex-start;margin-top:4px',
                onclick: () => navigate(`/aufgaben/${block.taskId}`),
              }, 'Aufgabe öffnen'),
            ]),
          ]);
        })
      )
    : h('div.card', {}, [
        emptyState({
          icon: 'checkCircle',
          title: 'Für heute ist nichts eingeplant',
          message: 'Alle Aufgaben sind im Zeitplan oder noch nicht fällig. Genieß deine Stunde.',
        }),
      ]);

  const explainBox = h(
    `div.explain-box${explainVisible ? '.visible' : ''}`,
    {},
    result.items.length
      ? [
          ...result.items.map((item) => h('p', { style: 'margin-bottom:8px' }, item.reason)),
          h('p', { style: 'margin:0;font-weight:600' }, 'Damit bleibst du im Zeitplan.'),
        ]
      : [h('p', {}, 'Für heute ist nichts Dringendes eingeplant.')]
  );

  const page = h('div.page', {}, [
    h('div.page-header', {}, [
      h('div.page-header-text', {}, [h('h1', {}, 'Heute'), h('p', {}, formatLongDate(today))]),
    ]),

    warnings.length ? warningBanners(warnings) : null,

    h('div.card', {}, [
      h('div.card-header', {}, [
        h('div', {}, [
          h('h3.card-title', {}, 'Deine Arbeitsstunde'),
          h('p.card-subtitle', {}, `${settings.workBlockStart} – ${settings.workBlockEnd} Uhr`),
        ]),
        h('button.btn.btn-primary', {
          onclick: () => { explainVisible = !explainVisible; rerenderCurrent(); },
        }, [h('span', { html: icon('checkCircle', 16) }), 'Was soll ich heute machen?']),
      ]),
      explainBox,
      h('div', { style: 'margin-top:16px' }, [timeline]),
      h('p.text-xs.text-secondary', { style: 'margin-top:12px' }, `Tagesziel: ${formatMinutes(doneToday)} / ${formatMinutes(result.capacityMinutes)}`),
    ]),
  ]);

  container.appendChild(page);
}
