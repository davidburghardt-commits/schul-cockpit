import { h } from '../utils/dom.js';

let root = null;

export function initToasts(rootEl) {
  root = rootEl;
}

export function showToast(message, { duration = 3000 } = {}) {
  if (!root) return;
  const node = h('div.toast', {}, [message]);
  root.appendChild(node);
  setTimeout(() => {
    node.style.transition = 'opacity 160ms ease';
    node.style.opacity = '0';
    setTimeout(() => node.remove(), 180);
  }, duration);
}
