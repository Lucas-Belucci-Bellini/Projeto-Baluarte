import { h } from './helpers.js';

export function mountAtmosphere(root: HTMLElement | null): HTMLDivElement | null {
  if (!root || root.querySelector('.bx-atmosphere')) return null;

  const atmosphere = h('div', {
    className: 'bx-atmosphere',
    'aria-hidden': 'true'
  },
    h('div', { className: 'bx-atmosphere__aurora' }),
    h('div', { className: 'bx-atmosphere__rays' }),
    h('div', { className: 'bx-atmosphere__grid' }),
    h('div', { className: 'bx-atmosphere__vignette' }));

  root.appendChild(atmosphere);
  return atmosphere;
}
