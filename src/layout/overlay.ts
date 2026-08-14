/**
 * Overlay / "Sobrepor" — mantém uma página viva numa janela flutuante.
 *
 * O wrapper `overlay.js` preserva os imports JavaScript enquanto esta é a
 * implementação canônica tipada do subsistema de painéis sobrepostos.
 */

import { h } from '../utils/helpers.js';

let root: HTMLElement | null = null;
let z = 60;
let offset = 0;
const panels = new Set<HTMLElement>();

function ensureRoot(): HTMLElement {
  if (root && document.body.contains(root)) return root;

  root =
    document.getElementById('overlay-root') ??
    h('div', { id: 'overlay-root', className: 'overlay-root' });
  if (!document.body.contains(root)) document.body.appendChild(root);
  return root;
}

export function pinCount(): number {
  return panels.size;
}

export function pinElement(el: HTMLElement, title: string): HTMLElement {
  const overlayRoot = ensureRoot();
  const body = h('div', { className: 'ov-panel__body' });
  body.appendChild(el);

  const minBtn = h(
    'button',
    { className: 'ov-btn', title: 'Minimizar' },
    '—',
  );
  const closeBtn = h(
    'button',
    {
      className: 'ov-btn ov-btn--close',
      title: 'Fechar (encerra a página)',
    },
    '✕',
  );
  const head = h(
    'div',
    { className: 'ov-panel__head' },
    h('span', { className: 'ov-panel__title' }, `📌 ${title || 'Página'}`),
    h('div', { className: 'ov-panel__actions' }, minBtn, closeBtn),
  );
  const panel = h('div', { className: 'ov-panel' }, head, body);

  const base = 22 + (offset % 5) * 26;
  offset += 1;
  panel.style.right = `${base}px`;
  panel.style.bottom = `${base}px`;
  panel.style.zIndex = String(++z);
  panel.addEventListener('pointerdown', () => {
    panel.style.zIndex = String(++z);
  });

  let minimized = false;
  minBtn.onclick = () => {
    minimized = !minimized;
    panel.classList.toggle('is-min', minimized);
    minBtn.textContent = minimized ? '▢' : '—';
    minBtn.title = minimized ? 'Restaurar' : 'Minimizar';
  };
  closeBtn.onclick = () => {
    panel.remove();
    panels.delete(panel);
  };

  makeDraggable(panel, head);
  overlayRoot.appendChild(panel);
  panels.add(panel);
  wireMediaSession(body, title);
  return panel;
}

function wireMediaSession(container: HTMLElement, title: string): void {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
    return;
  }

  const media = container.querySelector<HTMLMediaElement>('audio, video');
  if (!media) return;

  try {
    if (typeof MediaMetadata !== 'undefined') {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title || 'Baluarte',
        artist: 'Projeto Baluarte',
        album: 'Sobrepor (segundo plano)',
      });
    }
    navigator.mediaSession.setActionHandler('play', () => {
      void media.play().catch(() => undefined);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      media.pause();
    });
    navigator.mediaSession.setActionHandler('stop', () => {
      media.pause();
    });

    const sync = (): void => {
      try {
        navigator.mediaSession.playbackState = media.paused ? 'paused' : 'playing';
      } catch {
        // A Media Session API pode estar presente, mas não aceitar mutação no agente atual.
      }
    };
    media.addEventListener('play', sync);
    media.addEventListener('pause', sync);
    sync();
  } catch {
    // Integração opcional: o painel permanece funcional sem Media Session.
  }
}

function makeDraggable(panel: HTMLElement, handle: HTMLElement): void {
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  handle.addEventListener('pointerdown', (event: PointerEvent) => {
    if (event.target instanceof Element && event.target.closest('.ov-btn')) {
      return;
    }

    dragging = true;
    const bounds = panel.getBoundingClientRect();
    panel.style.left = `${bounds.left}px`;
    panel.style.top = `${bounds.top}px`;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    startX = event.clientX;
    startY = event.clientY;
    startLeft = bounds.left;
    startTop = bounds.top;

    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      // Alguns navegadores não permitem captura para todos os dispositivos.
    }
    event.preventDefault();
  });

  handle.addEventListener('pointermove', (event: PointerEvent) => {
    if (!dragging) return;

    const nextLeft = Math.max(
      0,
      Math.min(window.innerWidth - 100, startLeft + (event.clientX - startX)),
    );
    const nextTop = Math.max(
      0,
      Math.min(window.innerHeight - 38, startTop + (event.clientY - startY)),
    );
    panel.style.left = `${nextLeft}px`;
    panel.style.top = `${nextTop}px`;
  });

  const end = (event: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    try {
      handle.releasePointerCapture(event.pointerId);
    } catch {
      // A captura pode ter sido perdida antes do pointerup.
    }
  };
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
}
