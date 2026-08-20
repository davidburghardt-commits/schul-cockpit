import { h } from '../utils/dom.js';

export function statCard(value, label) {
  return h('div.card.stat-card', {}, [
    h('span.stat-value', {}, String(value)),
    h('span.stat-label', {}, label),
  ]);
}
