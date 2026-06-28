/**
 * Efeitos reutilizáveis — portados pra vanilla (web leve, sem dependência).
 *
 * Inspirados no react-bits (MIT + Commons Clause · © David Haz) e reimplementados
 * do zero em JS/CSS puro com os tokens do Baluarte — NÃO é o código do react-bits
 * (que é React + framer-motion/WebGL). Estilos em `src/styles/effects.css`.
 * Curadoria e plano de adoção: `docs/REACT-BITS.md`.
 */

const REDUCED = typeof matchMedia !== 'undefined'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Spotlight que segue o cursor (porta do SpotlightCard). Adiciona a classe
 * `.fx-spotlight` ao elemento e atualiza as CSS vars --fx-x/--fx-y no pointermove;
 * o brilho radial em si vem do `::after` de effects.css. Respeita reduced-motion
 * (sem rastrear o cursor) e não roda sem dependências.
 *
 * @param {HTMLElement} el        cartão/alvo (precisa de position != static — já garantido pela classe)
 * @param {{color?: string}} [opts]  cor do brilho (default: ciano translúcido do tema)
 * @returns {() => void} cleanup que remove o listener
 */
export function attachSpotlight(el, opts = {}) {
  if (!el) return () => {};
  el.classList.add('fx-spotlight');
  if (opts.color) el.style.setProperty('--fx-spot', opts.color);
  if (REDUCED) return () => {};
  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--fx-x', (e.clientX - r.left) + 'px');
    el.style.setProperty('--fx-y', (e.clientY - r.top) + 'px');
  };
  el.addEventListener('pointermove', onMove);
  return () => el.removeEventListener('pointermove', onMove);
}

/**
 * Varredura de brilho num texto (porta do ShinyText) — é só a classe CSS
 * `.fx-shiny` (animação pura em CSS, sem JS). Helper por conveniência.
 * @param {HTMLElement} el
 * @returns {HTMLElement} o próprio elemento (encadeável)
 */
export function shiny(el) {
  if (el) el.classList.add('fx-shiny');
  return el;
}
