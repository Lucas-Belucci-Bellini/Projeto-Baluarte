/**
 * Overlay / "Sobrepor" — mantém uma página VIVA numa janela flutuante.
 *
 * O roteador destrói a página antiga ao navegar (por isso o áudio para). Aqui
 * a página é MOVIDA para um root fora do `main` (mas dentro do <body>), então
 * ela continua no documento — áudio toca, estado persiste — enquanto você usa o
 * resto do site. Janela arrastável (mouse/toque), minimizável e fechável.
 */

import { h } from '../utils/helpers.js';

let root = null;
let z = 60;
let offset = 0;
const panels = new Set();

function ensureRoot() {
  if (root && document.body.contains(root)) return root;
  root = document.getElementById('overlay-root') || h('div', { id: 'overlay-root', className: 'overlay-root' });
  if (!document.body.contains(root)) document.body.appendChild(root);
  return root;
}

export function pinCount() { return panels.size; }

/**
 * Fixa um elemento numa janela flutuante (move o nó vivo — mantém áudio/estado).
 * @param {HTMLElement} el
 * @param {string} title
 * @returns {HTMLElement} painel
 */
export function pinElement(el, title) {
  const r = ensureRoot();

  const body = h('div', { className: 'ov-panel__body' });
  body.appendChild(el); /* MOVE o elemento vivo para cá */

  const minBtn = h('button', { className: 'ov-btn', title: 'Minimizar' }, '—');
  const closeBtn = h('button', { className: 'ov-btn ov-btn--close', title: 'Fechar (encerra a página)' }, '✕');
  const head = h('div', { className: 'ov-panel__head' },
    h('span', { className: 'ov-panel__title' }, '📌 ' + (title || 'Página')),
    h('div', { className: 'ov-panel__actions' }, minBtn, closeBtn));

  const panel = h('div', { className: 'ov-panel' }, head, body);

  const base = 22 + (offset % 5) * 26; offset++;
  panel.style.right = base + 'px';
  panel.style.bottom = base + 'px';
  panel.style.zIndex = String(++z);
  panel.addEventListener('pointerdown', () => { panel.style.zIndex = String(++z); });

  let minimized = false;
  minBtn.onclick = () => {
    minimized = !minimized;
    panel.classList.toggle('is-min', minimized);
    minBtn.textContent = minimized ? '▢' : '—';
    minBtn.title = minimized ? 'Restaurar' : 'Minimizar';
  };
  closeBtn.onclick = () => { panel.remove(); panels.delete(panel); };

  makeDraggable(panel, head);

  r.appendChild(panel);
  panels.add(panel);
  return panel;
}

function makeDraggable(panel, handle) {
  let dragging = false, sx = 0, sy = 0, sl = 0, st = 0;
  handle.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.ov-btn')) return;
    dragging = true;
    const r = panel.getBoundingClientRect();
    panel.style.left = r.left + 'px'; panel.style.top = r.top + 'px';
    panel.style.right = 'auto'; panel.style.bottom = 'auto';
    sx = e.clientX; sy = e.clientY; sl = r.left; st = r.top;
    try { handle.setPointerCapture(e.pointerId); } catch { /* ok */ }
    e.preventDefault();
  });
  handle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    let nl = sl + (e.clientX - sx);
    let nt = st + (e.clientY - sy);
    nl = Math.max(0, Math.min(window.innerWidth - 100, nl));
    nt = Math.max(0, Math.min(window.innerHeight - 38, nt));
    panel.style.left = nl + 'px'; panel.style.top = nt + 'px';
  });
  const end = (e) => { if (dragging) { dragging = false; try { handle.releasePointerCapture(e.pointerId); } catch { /* ok */ } } };
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
}
