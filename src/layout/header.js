/**
 * Header — barra superior tipo HUD do Infinity Dreadnought.
 * Mostra: brand, status do sistema, clock/date, ações.
 */

import { h, pad2 } from '../utils/helpers.js';
import { bus } from '../core/events.js';
import { appState } from '../core/state.js';

let clockTimer = null;

function statusItem(label, value, dotClass = 'status-dot--online') {
  return h(
    'div',
    { className: 'header__status-item' },
    h('span', { className: `status-dot ${dotClass}` }),
    h('span', { className: 'header__status-label' }, label),
    h('span', { className: 'header__status-value' }, value)
  );
}

function updateClock(clockEl, dateEl) {
  const now = new Date();
  const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
  const date = now.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });
  clockEl.textContent = time;
  dateEl.textContent = date.toUpperCase().replace('.', '');
}

export function renderHeader() {
  const clockEl = h('div', { className: 'header__clock' }, '--:--:--');
  const dateEl = h('div', { className: 'header__clock-date' }, '');

  const menuToggle = h(
    'button',
    {
      className: 'btn btn--ghost btn--icon',
      'aria-label': 'Abrir menu',
      onclick: () => bus.emit('sidebar:toggle-mobile')
    },
    '☰'
  );

  const collapseToggle = h(
    'button',
    {
      className: 'btn btn--ghost btn--icon',
      'aria-label': 'Recolher menu',
      title: 'Recolher menu lateral (Ctrl+B)',
      onclick: () => bus.emit('sidebar:toggle-collapse')
    },
    h('span', { html: '&#9776;' })
  );

  const header = h(
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
        h('span', { className: 'header__brand-glyph' }, '⬡'),
        h('span', { className: 'header__brand-text' }, 'BALUARTE')
      ),
      h(
        'div',
        { className: 'header__status' },
        statusItem('NÚCLEO', 'ONLINE'),
        statusItem('REDE', 'OK'),
        statusItem('FASE', '01/05', 'status-dot--warning')
      )
    ),
    h(
      'div',
      { className: 'header__right' },
      dateEl,
      clockEl,
      h(
        'span',
        { className: 'badge badge--cyan', title: 'Clearance do operador' },
        appState.get('user').clearance
      )
    )
  );

  if (clockTimer) clearInterval(clockTimer);
  updateClock(clockEl, dateEl);
  clockTimer = setInterval(() => updateClock(clockEl, dateEl), 1000);

  return header;
}
