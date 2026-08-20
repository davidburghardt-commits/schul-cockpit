import { h } from '../utils/dom.js';
import { icon } from '../utils/icons.js';

export function emptyState({ icon: iconName = 'checkCircle', title, message, ctaLabel, onCta }) {
  const children = [
    h('div.empty-icon', { html: icon(iconName, 22) }),
    h('h3', {}, title),
    h('p', {}, message),
  ];
  if (ctaLabel && onCta) {
    children.push(
      h('button.btn.btn-primary', { onclick: onCta }, [
        h('span', { html: icon('plus', 16) }),
        ctaLabel,
      ])
    );
  }
  return h('div.empty-state', {}, children);
}
