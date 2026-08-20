import { h, clearNode } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { getState } from '../store.js';
import { findSubject, subjectColorVar } from '../utils/subjectHelpers.js';
import { navigate } from '../router.js';

let overlayEl = null;
let inputEl = null;
let resultsEl = null;

function buildIndex() {
  const state = getState();
  const items = [];

  for (const t of state.tasks) {
    const subject = findSubject(state.subjects, t.subjectId);
    items.push({
      kind: 'Aufgabe', title: t.title, subtitle: subject ? subject.name : '',
      color: subjectColorVar(subject), path: `/aufgaben/${t.id}`,
      haystack: `${t.title} ${t.description || ''} ${t.notes || ''} ${subject ? subject.name : ''}`.toLowerCase(),
    });
  }
  for (const s of state.subjects) {
    items.push({
      kind: 'Fach', title: s.name, subtitle: s.teacher || '',
      color: subjectColorVar(s), path: `/faecher/${s.id}`,
      haystack: `${s.name} ${s.teacher || ''} ${s.notes || ''}`.toLowerCase(),
    });
  }
  for (const e of state.exams) {
    const subject = findSubject(state.subjects, e.subjectId);
    items.push({
      kind: 'Klausur', title: e.title, subtitle: subject ? subject.name : '',
      color: subjectColorVar(subject), path: `/klausuren/${e.id}`,
      haystack: `${e.title} ${e.description || ''} ${subject ? subject.name : ''}`.toLowerCase(),
    });
  }
  return items;
}

function renderResults(query) {
  clearNode(resultsEl);
  const index = buildIndex();
  const q = query.trim().toLowerCase();
  const matches = q ? index.filter((item) => item.haystack.includes(q)).slice(0, 20) : [];

  if (!q) {
    resultsEl.appendChild(h('p.text-secondary.text-sm', { style: 'padding:16px' }, 'Suche nach Aufgaben, Fächern oder Klausuren …'));
    return;
  }
  if (!matches.length) {
    resultsEl.appendChild(h('p.text-secondary.text-sm', { style: 'padding:16px' }, 'Keine Ergebnisse.'));
    return;
  }

  matches.forEach((item) => {
    resultsEl.appendChild(
      h('div.search-result', { onclick: () => { navigate(item.path); closeSearch(); } }, [
        h('span.subject-dot', { style: `background:${item.color}` }),
        h('div', { style: 'flex:1;min-width:0' }, [
          h('div.text-sm', { style: 'font-weight:600' }, item.title),
          item.subtitle ? h('div.text-xs.text-secondary', {}, item.subtitle) : null,
        ]),
        h('span.badge.badge-neutral', {}, item.kind),
      ])
    );
  });
}

export function openSearch() {
  if (overlayEl) { inputEl.focus(); return; }

  const backdrop = h('div.search-backdrop', {});
  inputEl = h('input', { type: 'text', placeholder: 'Suchen …', oninput: (e) => renderResults(e.target.value) });
  resultsEl = h('div.search-results', {});

  const panel = h('div.search-panel', {}, [
    h('div.search-input-row', {}, [h('span', { html: icon('search', 18) }), inputEl, h('span.kbd', {}, 'Esc')]),
    resultsEl,
  ]);

  backdrop.appendChild(panel);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeSearch(); });
  document.addEventListener('keydown', onKeydown);

  overlayEl = backdrop;
  document.body.appendChild(backdrop);
  renderResults('');
  setTimeout(() => inputEl.focus(), 0);
}

function onKeydown(e) {
  if (e.key === 'Escape') closeSearch();
}

export function closeSearch() {
  if (!overlayEl) return;
  document.removeEventListener('keydown', onKeydown);
  overlayEl.remove();
  overlayEl = null;
  inputEl = null;
  resultsEl = null;
}

export function initGlobalSearchShortcut() {
  document.addEventListener('keydown', (e) => {
    const isMod = e.metaKey || e.ctrlKey;
    if (isMod && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearch();
    }
  });
}
