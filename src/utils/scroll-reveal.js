/**
 * Scroll-reveal — os blocos de cada página entram suavemente conforme aparecem
 * na viewport. Sem dependência (IntersectionObserver), leve (alinhado ao "site
 * leve", #238) e respeita prefers-reduced-motion. Universal: roda a cada
 * navegação, chamado pelo renderPage() do shell. Inspirado nas skills de
 * animação (AOS / GSAP ScrollTrigger), só que em ~40 linhas e zero KB de lib.
 */

const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const SUPPORTED = typeof IntersectionObserver !== 'undefined';

let observer = null;
function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries, obs) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-revealed');
          obs.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.04 }
  );
  return observer;
}

/** Blocos a revelar: filhos diretos do root da página (as seções). */
function targets(root) {
  const out = [];
  for (const child of root.children) {
    if (child.classList && child.classList.contains('anim-fade-in')) continue; // já anima sozinho
    if (child.dataset && child.dataset.noReveal != null) continue; // opt-out
    out.push(child);
  }
  return out;
}

/**
 * Marca e observa os blocos da página recém-montada. Pula a home (a cena WebGL
 * cuida do próprio movimento). Em reduced-motion ou sem suporte, revela tudo na
 * hora (sem animação) — o conteúdo nunca fica preso invisível.
 */
export function revealScan(root, route) {
  if (!root || !root.querySelectorAll) return;
  if (route === '/home' || route === '/home-3d') return;
  const blocks = targets(root);
  if (!blocks.length) return;
  if (REDUCED || !SUPPORTED) {
    blocks.forEach((el) => el.classList.add('reveal', 'is-revealed'));
    return;
  }
  const obs = getObserver();
  blocks.forEach((el, i) => {
    if (el.classList.contains('reveal')) return;
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', Math.min(i, 5) * 45 + 'ms');
    obs.observe(el);
  });
}
