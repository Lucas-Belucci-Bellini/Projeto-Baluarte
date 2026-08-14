import { bus } from '../core/events.js';
import { h } from './helpers.js';

export type ToastType = 'info' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

interface ToastEvent extends Required<Pick<ToastOptions, 'type' | 'duration'>> {
  message: string;
}

let activeToast: HTMLDivElement | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast({ message, duration = 2400, type = 'info' }: ToastEvent): void {
  if (activeToast) {
    activeToast.remove();
    activeToast = null;
  }
  if (toastTimer !== null) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }

  const element = h('div', {
    className: `toast toast--${type}`,
    role: 'status',
    'aria-live': 'polite'
  }, message);

  document.body.appendChild(element);
  activeToast = element;
  requestAnimationFrame(() => element.classList.add('is-visible'));

  toastTimer = setTimeout(() => {
    element.classList.remove('is-visible');
    setTimeout(() => {
      if (element === activeToast) activeToast = null;
      element.remove();
    }, 320);
  }, duration);
}

export function initToast(): void {
  bus.on<ToastEvent>('toast', (payload) => showToast(payload));
}

export function toast(message: string, options: ToastOptions = {}): void {
  bus.emit<ToastEvent>('toast', {
    message,
    type: options.type ?? 'info',
    duration: options.duration ?? 2400
  });
}
