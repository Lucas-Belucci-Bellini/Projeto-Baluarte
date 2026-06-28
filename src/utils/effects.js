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

/* Conjunto de caracteres do scramble — vibe HUD/decifrando. */
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&_<>/\\{}[]=+*';

/**
 * Revelação "decifrando" (porta do DecryptedText): embaralha os caracteres e
 * vai revelando o texto da esquerda pra direita. JS puro + setInterval que se
 * encerra sozinho (sem leak), reduced-motion deixa o texto intacto. A11y: o
 * texto real fica em aria-label durante o efeito.
 *
 * @param {HTMLElement} el  elemento de texto simples (sem filhos)
 * @param {{ speed?: number, maxIterations?: number, characters?: string }} [opts]
 * @returns {() => void} cleanup (encerra e restaura o texto)
 */
export function decryptText(el, opts = {}) {
  if (!el) return () => {};
  const original = el.textContent;
  if (REDUCED || !original || el.children.length) return () => {};

  const speed = opts.speed || 45;
  const maxIter = opts.maxIterations || 12;
  const chars = opts.characters || SCRAMBLE_CHARS;
  const len = original.length;
  let iteration = 0;

  el.setAttribute('aria-label', original);   // leitor de tela recebe o texto real
  const id = setInterval(() => {
    iteration++;
    const revealed = Math.floor((iteration / maxIter) * len);
    el.textContent = original
      .split('')
      .map((ch, i) => (ch === ' ' || i < revealed
        ? ch
        : chars[(Math.random() * chars.length) | 0]))
      .join('');
    if (iteration >= maxIter) {
      clearInterval(id);
      el.textContent = original;
      el.removeAttribute('aria-label');
    }
  }, speed);

  return () => { clearInterval(id); el.textContent = original; el.removeAttribute('aria-label'); };
}

/**
 * Aplica o decryptText nos títulos de página (`.page-header__title`) dentro de
 * `root` — chamado a cada navegação (ver shell.renderPage) pra dar o reveal
 * "decifrando" no site inteiro de uma vez. Idempotente por elemento.
 * @param {HTMLElement} root
 */
export function decryptTitles(root) {
  if (!root || REDUCED || !root.querySelectorAll) return;
  root.querySelectorAll('.page-header__title').forEach((el) => {
    if (el.dataset.fxDecrypted) return;
    el.dataset.fxDecrypted = '1';
    decryptText(el);
  });
}
