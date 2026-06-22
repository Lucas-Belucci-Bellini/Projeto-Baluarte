/**
 * Scroll progress (#246) — barra fina no topo que enche conforme a página rola,
 * tingida pelo acento do universo ativo. Indica progresso de leitura.
 *
 * Leve: UM listener de scroll no window, throttled por requestAnimationFrame;
 * o visual mora no CSS (scroll-progress.css). Um MutationObserver no conteúdo
 * principal re-mede quando a página troca (a altura muda). Montado 1x pelo shell.
 */

import { h } from './helpers.js';

let mounted = false;

export function mountScrollProgress() {
  if (mounted || typeof document === 'undefined' || !document.body) return;
  if (document.querySelector('.bx-scroll-progress')) return;
  mounted = true;

  const bar = h('div', { className: 'bx-scroll-progress', 'aria-hidden': 'true' });
  document.body.appendChild(bar);

  let raf = 0;
  const update = () => {
    raf = 0;
    const doc = document.documentElement;
    const max = (doc.scrollHeight || 0) - (doc.clientHeight || 0);
    const y = window.scrollY || doc.scrollTop || 0;
    const scrollable = max > 4;
    bar.style.setProperty('--sp', scrollable ? Math.min(1, Math.max(0, y / max)).toFixed(4) : '0');
    bar.style.opacity = scrollable ? '1' : '0';
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Re-medir quando a página troca (o shell substitui o filho do .main__inner).
  const main = document.querySelector('.main__inner') || document.querySelector('.main');
  if (main && typeof MutationObserver !== 'undefined') {
    new MutationObserver(onScroll).observe(main, { childList: true });
  }

  update();
}
