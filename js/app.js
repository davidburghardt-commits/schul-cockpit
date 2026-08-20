import { subscribe, getState, dispatch } from './store.js';
import { initRouter, registerRoute, setNotFound, rerenderCurrent, navigate } from './router.js';
import { mountSidebar } from './components/sidebar.js';
import { initToasts } from './components/toast.js';
import { emptyState } from './components/emptyState.js';
import { h, clearNode } from './utils/dom.js';

import { renderDashboard } from './views/dashboard.js';
import { renderHeute } from './views/heute.js';
import { renderAufgaben } from './views/aufgaben.js';
import { renderFaecher } from './views/faecher.js';
import { renderFachDetail } from './views/fachDetail.js';
import { renderEinstellungen } from './views/einstellungen.js';

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light' || theme === 'dark') {
    root.setAttribute('data-theme', theme);
  } else {
    root.removeAttribute('data-theme');
  }
}

function renderNotFound(container) {
  clearNode(container);
  container.appendChild(
    h('div.page', {}, [
      h('div.card', {}, [
        emptyState({
          icon: 'layers',
          title: 'Bald verfügbar',
          message: 'Dieser Bereich wird als Nächstes gebaut.',
          ctaLabel: 'Zum Dashboard',
          onCta: () => navigate('/dashboard'),
        }),
      ]),
    ])
  );
}

function registerRoutes() {
  registerRoute('/dashboard', renderDashboard);
  registerRoute('/heute', renderHeute);
  registerRoute('/aufgaben', renderAufgaben);
  registerRoute('/aufgaben/:id', renderAufgaben);
  registerRoute('/faecher', renderFaecher);
  registerRoute('/faecher/:id', renderFachDetail);
  registerRoute('/einstellungen', renderEinstellungen);
  setNotFound(renderNotFound);
}

function init() {
  applyTheme(getState().settings.theme);
  initToasts(document.getElementById('toast-root'));
  registerRoutes();
  initRouter(document.getElementById('main-content'));

  mountSidebar(
    document.getElementById('sidebar'),
    document.getElementById('sidebar-backdrop'),
    document.getElementById('menu-toggle')
  );

  subscribe((state) => {
    applyTheme(state.settings.theme);
    rerenderCurrent();
  });

  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    window.__debug = { getState, dispatch };
  }
}

document.addEventListener('DOMContentLoaded', init);
