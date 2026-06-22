/**
 * Card spotlight (#246) — um brilho radial sutil que SEGUE o cursor sobre os
 * cards (`.card`), tingido pelo acento do universo ativo (via CSS, --color-cyan).
 * Complementa o hover (lift + glow) e o tilt 3D das ferramentas.
 *
 * Leve por construção: UM listener delegado no root (não por card),
 * throttled por requestAnimationFrame, e só escreve as vars quando o cursor
 * está sobre um card. O efeito visual mora no CSS (.card::after). Respeita
 * prefers-reduced-motion (nem monta). Montado 1x pelo shell.
 */

let mounted = false;

export function mountCardSpotlight(root) {
  if (mounted) return;
  if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const target = root || (typeof document !== 'undefined' ? document.body : null);
  if (!target || !target.addEventListener) return;
  mounted = true;

  let raf = 0;
  let lastEv = null;

  target.addEventListener('pointermove', (e) => {
    lastEv = e;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const ev = lastEv;
      const card = ev && ev.target && ev.target.closest ? ev.target.closest('.card') : null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const x = ((ev.clientX - r.left) / r.width) * 100;
      const y = ((ev.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', x.toFixed(1) + '%');
      card.style.setProperty('--my', y.toFixed(1) + '%');
    });
  }, { passive: true });
}
