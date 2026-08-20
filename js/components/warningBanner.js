import { h } from '../utils/dom.js';

export function warningBanners(warnings) {
  return h(
    'div.vstack',
    {},
    warnings.map((w) => h(`div.warning-banner.tone-${w.tone}`, {}, [h('span', {}, w.text)]))
  );
}
