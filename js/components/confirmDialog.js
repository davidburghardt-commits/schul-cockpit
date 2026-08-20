import { h } from '../utils/dom.js';

export function confirmDialog({
  title,
  message,
  confirmLabel = 'Löschen',
  cancelLabel = 'Abbrechen',
  danger = true,
}) {
  return new Promise((resolve) => {
    const backdrop = h('div.panel-backdrop', { style: 'z-index:89' });

    function close(result) {
      document.removeEventListener('keydown', onKeydown);
      backdrop.remove();
      dialog.remove();
      resolve(result);
    }

    function onKeydown(e) {
      if (e.key === 'Escape') close(false);
    }

    const dialog = h('div.dialog', {}, [
      h('h3', {}, title),
      h('p.text-secondary.text-sm', {}, message),
      h('div.dialog-actions', {}, [
        h('button.btn.btn-secondary', { onclick: () => close(false) }, cancelLabel),
        h(`button.btn.${danger ? 'btn-danger' : 'btn-primary'}`, { onclick: () => close(true) }, confirmLabel),
      ]),
    ]);

    backdrop.addEventListener('click', () => close(false));
    document.addEventListener('keydown', onKeydown);
    document.body.appendChild(backdrop);
    document.body.appendChild(dialog);
  });
}
