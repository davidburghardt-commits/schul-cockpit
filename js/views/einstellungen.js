import { h, clearNode } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { getState, dispatch } from '../store.js';
import * as db from '../db.js';
import { showToast } from '../components/toast.js';
import { confirmDialog } from '../components/confirmDialog.js';
import { rerenderCurrent } from '../router.js';
import { createId } from '../utils/id.js';

const WEEKDAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const THEME_OPTIONS = [
  { value: 'light', label: 'Hell' },
  { value: 'dark', label: 'Dunkel' },
  { value: 'system', label: 'System' },
];

export function renderEinstellungen(container) {
  const state = getState();
  const { settings } = state;
  clearNode(container);

  function updateSettings(patch) {
    dispatch({ type: 'settings/update', payload: patch });
  }

  const themeSegment = h(
    'div.segmented',
    {},
    THEME_OPTIONS.map((opt) =>
      h(`button${settings.theme === opt.value ? '.active' : ''}`, {
        type: 'button',
        onclick: () => updateSettings({ theme: opt.value }),
      }, opt.label)
    )
  );

  const workdaysRow = h(
    'div.hstack',
    { style: 'flex-wrap:wrap' },
    [1, 2, 3, 4, 5, 6, 0].map((day) => {
      const active = settings.workdays.includes(day);
      return h(`button.btn.btn-sm.${active ? 'btn-primary' : 'btn-secondary'}`, {
        type: 'button',
        onclick: () => {
          const next = active ? settings.workdays.filter((d) => d !== day) : [...settings.workdays, day];
          updateSettings({ workdays: next });
        },
      }, WEEKDAY_LABELS[day]);
    })
  );

  const holidayList = h(
    'div.vstack',
    {},
    settings.holidays.length
      ? settings.holidays.map((hday) =>
          h('div.hstack', { style: 'justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--color-border)' }, [
            h('span.text-sm', {}, `${hday.label || 'Frei'}: ${hday.start} – ${hday.end}`),
            h('button.btn.btn-icon.btn-sm', {
              onclick: () => updateSettings({ holidays: settings.holidays.filter((h2) => h2.id !== hday.id) }),
              html: icon('trash', 14),
            }),
          ])
        )
      : [h('p.text-secondary.text-sm', {}, 'Keine Ferien/freien Tage eingetragen.')]
  );

  let newHolidayLabel = '';
  let newHolidayStart = '';
  let newHolidayEnd = '';

  const addHolidayRow = h('div.field-row', { style: 'grid-template-columns:1fr 1fr 1fr auto; align-items:end' }, [
    h('div.field', {}, [h('label.field-label', {}, 'Bezeichnung'), h('input.input', { placeholder: 'z. B. Herbstferien', oninput: (e) => (newHolidayLabel = e.target.value) })]),
    h('div.field', {}, [h('label.field-label', {}, 'Von'), h('input.input', { type: 'date', onchange: (e) => (newHolidayStart = e.target.value) })]),
    h('div.field', {}, [h('label.field-label', {}, 'Bis'), h('input.input', { type: 'date', onchange: (e) => (newHolidayEnd = e.target.value) })]),
    h('button.btn.btn-secondary', {
      type: 'button',
      onclick: () => {
        if (!newHolidayStart || !newHolidayEnd) { showToast('Bitte Start- und Enddatum wählen.'); return; }
        updateSettings({ holidays: [...settings.holidays, { id: createId('hol'), label: newHolidayLabel || 'Frei', start: newHolidayStart, end: newHolidayEnd }] });
      },
    }, 'Hinzufügen'),
  ]);

  function exportData() {
    const json = db.exportJSON(getState());
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `schul-cockpit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('Backup wurde heruntergeladen.');
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const next = db.importJSON(reader.result);
        dispatch({ type: 'data/replace', payload: next });
        showToast('Daten erfolgreich importiert.');
      } catch (err) {
        console.error(err);
        showToast('Import fehlgeschlagen: Datei ist kein gültiges Backup.');
      }
    };
    reader.readAsText(file);
  }

  async function clearTasks() {
    const ok = await confirmDialog({
      title: 'Alle Aufgaben löschen?',
      message: 'Alle Aufgaben und protokollierten Arbeitsblöcke werden gelöscht. Fächer, Klausuren und Einstellungen bleiben erhalten.',
    });
    if (!ok) return;
    dispatch({ type: 'task/clearAll' });
    showToast('Alle Aufgaben wurden gelöscht.');
  }

  async function clearExams() {
    const ok = await confirmDialog({
      title: 'Alle Klausuren löschen?',
      message: 'Alle Klausuren, Tests und Termine werden gelöscht. Fächer, Aufgaben und Einstellungen bleiben erhalten.',
    });
    if (!ok) return;
    dispatch({ type: 'exam/clearAll' });
    showToast('Alle Klausuren wurden gelöscht.');
  }

  async function reseed() {
    const ok = await confirmDialog({ title: 'Beispieldaten laden?', message: 'Alle aktuellen Daten werden durch die Beispieldaten ersetzt.', confirmLabel: 'Ersetzen' });
    if (!ok) return;
    dispatch({ type: 'data/reseed' });
    showToast('Beispieldaten geladen.');
  }

  async function clearAll() {
    const ok = await confirmDialog({ title: 'Alle Daten löschen?', message: 'Alle Fächer, Aufgaben, Klausuren und Einstellungen werden unwiderruflich gelöscht.' });
    if (!ok) return;
    dispatch({ type: 'data/clear' });
    showToast('Alle Daten wurden gelöscht.');
  }

  const page = h('div.page', {}, [
    h('div.page-header', {}, [h('div.page-header-text', {}, [h('h1', {}, 'Einstellungen')])]),

    h('div.card', {}, [
      h('h3.card-title', {}, 'Darstellung'),
      h('p.card-subtitle', {}, 'Wähle, wie Schul-Cockpit aussehen soll.'),
      h('div', { style: 'margin-top:12px' }, [themeSegment]),
    ]),

    h('div.card', {}, [
      h('h3.card-title', {}, 'Arbeitsstunde & Planer'),
      h('p.card-subtitle', {}, 'Diese Werte steuern, wie der automatische Tagesplan berechnet wird.'),
      h('div.form-grid', { style: 'margin-top:12px' }, [
        h('div.field-row', {}, [
          h('div.field', {}, [h('label.field-label', {}, 'Start'), h('input.input', { type: 'time', value: settings.workBlockStart, onchange: (e) => updateSettings({ workBlockStart: e.target.value }) })]),
          h('div.field', {}, [h('label.field-label', {}, 'Ende'), h('input.input', { type: 'time', value: settings.workBlockEnd, onchange: (e) => updateSettings({ workBlockEnd: e.target.value }) })]),
        ]),
        h('div.field-row', {}, [
          h('div.field', {}, [h('label.field-label', {}, 'Kapazität (Min./Tag)'), h('input.input', { type: 'number', min: '5', step: '5', value: String(settings.dailyCapacityMinutes), onchange: (e) => updateSettings({ dailyCapacityMinutes: Math.max(5, Number(e.target.value) || 60) }) })]),
          h('div.field', {}, [h('label.field-label', {}, 'Max. Aufgaben/Tag'), h('input.input', { type: 'number', min: '1', max: '6', value: String(settings.maxTasksPerDay), onchange: (e) => updateSettings({ maxTasksPerDay: Math.max(1, Number(e.target.value) || 3) }) })]),
        ]),
        h('div.field', {}, [h('label.field-label', {}, 'Arbeitstage'), workdaysRow]),
      ]),
    ]),

    h('div.card', {}, [
      h('h3.card-title', {}, 'Ferien & freie Tage'),
      h('p.card-subtitle', {}, 'Werden im Planer und Kalender berücksichtigt.'),
      h('div', { style: 'margin-top:12px' }, [holidayList, h('div', { style: 'margin-top:10px' }, [addHolidayRow])]),
    ]),

    h('div.card', {}, [
      h('h3.card-title', {}, 'Daten'),
      h('p.card-subtitle', {}, 'Deine Daten liegen ausschließlich lokal in diesem Browser.'),
      h('div.hstack', { style: 'margin-top:12px;flex-wrap:wrap' }, [
        h('button.btn.btn-secondary', { onclick: exportData }, [h('span', { html: icon('download', 15) }), 'Backup exportieren']),
        h('label.btn.btn-secondary', { style: 'cursor:pointer' }, [
          h('span', { html: icon('upload', 15) }),
          'Backup importieren',
          h('input', { type: 'file', accept: 'application/json', style: 'display:none', onchange: (e) => e.target.files[0] && importData(e.target.files[0]) }),
        ]),
        h('button.btn.btn-secondary', { onclick: reseed }, 'Beispieldaten laden'),
        h('button.btn.btn-secondary', { onclick: clearTasks }, 'Alle Aufgaben löschen'),
        h('button.btn.btn-secondary', { onclick: clearExams }, 'Alle Klausuren löschen'),
        h('button.btn.btn-danger', { onclick: clearAll }, 'Alle Daten löschen'),
      ]),
    ]),
  ]);

  container.appendChild(page);
}
