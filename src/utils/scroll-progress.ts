import { h } from './helpers.js';

let mounted = false;

export function mountScrollProgress(): void {
  if (mounted || typeof document === 'undefined' || !document.body) return;
  if (document.querySelector('.bx-scroll-progress')) return;
  mounted = true;

  const bar = h('div', { className: 'bx-scroll-progress', 'aria-hidden': 'true' });
  document.body.appendChild(bar);

  let frame = 0;
  const update = (): void => {
    frame = 0;
    const documentElement = document.documentElement;
    const max = (documentElement.scrollHeight || 0) - (documentElement.clientHeight || 0);
    const y = window.scrollY || documentElement.scrollTop || 0;
    const scrollable = max > 4;
    const progress = scrollable ? Math.min(1, Math.max(0, y / max)).toFixed(4) : '0';
    bar.style.setProperty('--sp', progress);
    bar.style.opacity = scrollable ? '1' : '0';
  };
  const onScroll = (): void => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  const main = document.querySelector<HTMLElement>('.main__inner') ??
    document.querySelector<HTMLElement>('.main');
  if (main && typeof MutationObserver !== 'undefined') {
    new MutationObserver(onScroll).observe(main, { childList: true });
  }

  update();
}
