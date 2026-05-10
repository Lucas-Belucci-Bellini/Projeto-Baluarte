/**
 * Sistema de toast (notificações flutuantes).
 * Inscreve-se no evento 'toast' do bus e renderiza no body.
 *
 * Uso:
 *   import { toast, initToast } from './utils/toast.js';
 *   initToast(); // uma vez no boot
 *   toast('Salvo!');
 *   toast('Erro!', { type: 'danger' });
 *   toast('Atenção', { type: 'warning', duration: 4000 });
 */

import { bus } from '../core/events.js';
import { h } from './helpers.js';

let activeToast = null;
let toastTimer = null;

function showToast({ message, duration = 2400, type = 'info' }) {
  if (activeToast) {
    activeToast.remove();
    activeToast = null;
    clearTimeout(toastTimer);
  }

  const el = h(
    'div',
    {
      className: `toast toast--${type}`,
      role: 'status',
      'aria-live': 'polite'
    },
    message
  );

  document.body.appendChild(el);
  activeToast = el;

  /* força reflow + classe visible para animar entrada */
  requestAnimationFrame(() => el.classList.add('is-visible'));

  toastTimer = setTimeout(() => {
    el.classList.remove('is-visible');
    setTimeout(() => {
      if (el === activeToast) activeToast = null;
      el.remove();
    }, 320);
  }, duration);
}

/** Registra o handler global. Chamar uma vez no boot. */
export function initToast() {
  bus.on('toast', showToast);
}

/** Helper rápido pra disparar um toast. */
export function toast(message, opts = {}) {
  bus.emit('toast', { message, ...opts });
}
