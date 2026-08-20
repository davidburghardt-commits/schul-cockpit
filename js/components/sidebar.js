import { h, clearNode } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { NAV_ITEMS } from '../utils/constants.js';
import { getCurrentPath } from '../router.js';
import { openSearch } from './searchOverlay.js';

export function mountSidebar(sidebarEl, backdropEl, menuButtonEl) {
  function closeMobile() {
    sidebarEl.classList.remove('open');
    backdropEl.classList.remove('open');
  }

  menuButtonEl.addEventListener('click', () => {
    sidebarEl.classList.toggle('open');
    backdropEl.classList.toggle('open');
  });
  backdropEl.addEventListener('click', closeMobile);

  function render() {
    clearNode(sidebarEl);
    const current = getCurrentPath();

    sidebarEl.appendChild(
      h('div.sidebar-brand', {}, [h('span.brand-dot'), 'Schul-Cockpit'])
    );

    sidebarEl.appendChild(
      h('button.nav-link', { type: 'button', style: 'width:100%;justify-content:space-between;margin-bottom:10px', onclick: openSearch }, [
        h('span.hstack', {}, [h('span', { html: icon('search', 18) }), 'Suche']),
        h('span.kbd', {}, '⌘K'),
      ])
    );

    sidebarEl.appendChild(
      h(
        'nav.sidebar-nav',
        {},
        NAV_ITEMS.map((item) => {
          const active = current === item.path || (current === '/' && item.path === '/dashboard');
          return h(
            `a.nav-link${active ? '.active' : ''}`,
            { href: `#${item.path}`, onclick: closeMobile },
            [h('span', { html: icon(item.icon, 18) }), item.label]
          );
        })
      )
    );
  }

  render();
  window.addEventListener('hashchange', render);
  return { refresh: render };
}
