import { h, clearNode } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { getState, dispatch } from '../store.js';
import { findSubject, subjectColorVar } from '../utils/subjectHelpers.js';
import { todayISO } from '../utils/dateUtils.js';
import { createWorkSession } from '../models/workSession.js';
import { showToast } from './toast.js';
import { rerenderCurrent } from '../router.js';

function formatClock(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function openFocusMode({ taskId, minutes }) {
  const state = getState();
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;
  const subject = findSubject(state.subjects, task.subjectId);

  const plannedSeconds = Math.max(60, Math.round(minutes) * 60);
  let remaining = plannedSeconds;
  let running = true;
  let intervalId = null;
  let finished = false;
  const startedAt = new Date().toISOString();

  const overlay = h('div.focus-overlay', {});

  function cleanup() {
    if (intervalId) clearInterval(intervalId);
    overlay.remove();
  }

  function elapsedMinutes() {
    return Math.max(1, Math.round((plannedSeconds - remaining) / 60));
  }

  function logSession(outcome) {
    const session = createWorkSession({
      taskId: task.id,
      date: todayISO(),
      plannedMinutes: Math.round(plannedSeconds / 60),
      actualMinutes: elapsedMinutes(),
      outcome,
      startedAt,
      endedAt: new Date().toISOString(),
    });
    dispatch({ type: 'workSession/add', payload: session });
    showToast('Arbeitsblock gespeichert.');
    cleanup();
    rerenderCurrent();
  }

  function renderOutcomePicker() {
    finished = true;
    if (intervalId) clearInterval(intervalId);
    render();
  }

  function render() {
    clearNode(overlay);

    if (finished) {
      overlay.appendChild(
        h('div', { style: 'display:flex;flex-direction:column;align-items:center;gap:20px' }, [
          h('span.focus-subject', {}, subject ? subject.name : ''),
          h('h2.focus-title', {}, 'Arbeitsblock abgeschlossen.'),
          h('p.focus-context', {}, task.title),
          h('div.focus-actions', {}, [
            h('button.btn.btn-primary', { onclick: () => logSession('erledigt') }, 'Erledigt'),
            h('button.btn.btn-secondary', { onclick: () => logSession('teilweise') }, 'Teilweise erledigt'),
            h('button.btn.btn-ghost', { onclick: () => logSession('nicht_geschafft') }, 'Nicht geschafft'),
          ]),
        ])
      );
      return;
    }

    overlay.appendChild(h('span.subject-dot', { style: `background:${subjectColorVar(subject)};width:14px;height:14px` }));
    overlay.appendChild(h('span.focus-subject', {}, subject ? subject.name : ''));
    overlay.appendChild(h('h2.focus-title', {}, task.title));
    overlay.appendChild(h('div.focus-timer', {}, formatClock(remaining)));
    if (task.subtasks && task.subtasks.length) {
      const next = task.subtasks.find((s) => !s.done);
      overlay.appendChild(h('p.focus-context', {}, next ? `Nächster Schritt: ${next.title}` : 'Alle Teilaufgaben erledigt.'));
    }
    overlay.appendChild(
      h('div.focus-actions', {}, [
        h('button.btn.btn-secondary', {
          onclick: () => { running = !running; render(); },
        }, [h('span', { html: icon(running ? 'pause' : 'play', 16) }), running ? 'Pause' : 'Weiter']),
        h('button.btn.btn-ghost', { onclick: renderOutcomePicker }, [h('span', { html: icon('square', 16) }), 'Beenden']),
      ])
    );
  }

  intervalId = setInterval(() => {
    if (!running || finished) return;
    remaining -= 1;
    if (remaining <= 0) {
      renderOutcomePicker();
      return;
    }
    const clock = overlay.querySelector('.focus-timer');
    if (clock) clock.textContent = formatClock(remaining);
  }, 1000);

  render();
  document.body.appendChild(overlay);
}
