import { h } from '../utils/dom.js';
import { clamp, formatPercent } from '../utils/format.js';

export function progressToneForPercent(percent) {
  if (percent >= 100) return 'success';
  if (percent >= 50) return '';
  return '';
}

export function progressBar(percent, { tone = '' } = {}) {
  const value = clamp(Math.round(percent), 0, 100);
  return h('div.progress', {}, [
    h('div', { class: tone ? `progress-fill ${tone}` : 'progress-fill', style: `width:${value}%` }),
  ]);
}

export function progressBarRow(percent, { tone = '' } = {}) {
  const value = clamp(Math.round(percent), 0, 100);
  return h('div.progress-row', {}, [
    progressBar(value, { tone }),
    h('span.progress-label', {}, formatPercent(value)),
  ]);
}
