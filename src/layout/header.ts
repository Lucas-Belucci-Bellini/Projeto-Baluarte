/**
 * Header — barra superior tipo HUD do Infinity Dreadnought.
 *
 * A implementação canônica está em TypeScript. O wrapper `header.js` mantém
 * os imports legados durante a conversão incremental do layout.
 */

import { bus } from '../core/events.js';
import { appState } from '../core/state.js';
import { VERSION } from '../data/version.js';
import { h, pad2 } from '../utils/helpers.js';

let clockTimer: ReturnType<typeof setInterval> | null = null;

function statusItem(
  label: string,
  value: string,
  dotClass = 'status-dot--online',
): HTMLElement {
  return h(
    'div',
    { className: 'header__status-item' },
    h('span', { className: `status-dot ${dotClass}` }),
    h('span', { className: 'header__status-label' }, label),
    h('span', { className: 'header__status-value' }, value),
  );
}

function updateClock(clockEl: HTMLElement, dateEl: HTMLElement): void {
  const now = new Date();
  const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(
    now.getSeconds(),
  )}`;
  const date = now.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  clockEl.textContent = time;
  dateEl.textContent = date.toUpperCase().replace('.', '');
}

export function renderHeader(): HTMLElement {
  const clockEl: HTMLElement = h(
    'div',
    { className: 'header__clock' },
    '--:--:--',
  );
  const dateEl: HTMLElement = h('div', { className: 'header__clock-date' }, '');

  const menuToggle = h(
    'button',
    {
      className: 'btn btn--ghost btn--icon',
      'aria-label': 'Abrir menu',
      onclick: () => bus.emit('sidebar:toggle-mobile'),
    },
    '☰',
  );

  const collapseToggle = h(
    'button',
    {
      className: 'btn btn--ghost btn--icon',
      'aria-label': 'Recolher menu',
      title: 'Recolher menu lateral (Ctrl+B)',
      onclick: () => bus.emit('sidebar:toggle-collapse'),
    },
    h('span', { html: '&#9776;' }),
  );

  const header: HTMLElement = h(
    'header',
    { className: 'header' },
    h(
      'div',
      { className: 'header__left' },
      menuToggle,
      collapseToggle,
      h(
        'div',
        { className: 'header__brand' },
        h('img', {
          className: 'header__brand-img',
          src: '/logo.svg',
          alt: 'Baluarte',
        }),
        h('span', { className: 'header__brand-text' }, 'BALUARTE'),
      ),
      h(
        'div',
        { className: 'header__status' },
        statusItem('NÚCLEO', 'ONLINE'),
        statusItem('REDE', 'OK'),
        statusItem('VERSÃO', `v${VERSION}`, 'status-dot--online'),
      ),
    ),
    h(
      'div',
      { className: 'header__right' },
      h(
        'button',
        {
          className: 'btn btn--ghost btn--icon',
          title:
            'Sobrepor: manter esta página rodando numa janela flutuante (o áudio não para ao navegar)',
          'aria-label': 'Sobrepor página',
          onclick: () => bus.emit('page:pin'),
        },
        '📌',
      ),
      dateEl,
      clockEl,
      h(
        'span',
        { className: 'badge badge--cyan', title: 'Clearance do operador' },
        appState.get('user').clearance,
      ),
    ),
  );

  if (clockTimer) clearInterval(clockTimer);
  updateClock(clockEl, dateEl);
  clockTimer = setInterval(() => updateClock(clockEl, dateEl), 1000);

  return header;
}
