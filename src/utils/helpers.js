/**
 * Utilitários globais — Baluarte Mark XIII
 * Funções pequenas reutilizáveis. Sem dependências externas.
 */

/** Query selector com escopo opcional. */
export const $ = (selector, scope = document) => scope.querySelector(selector);

/** Query selector all retornando array. */
export const $$ = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

/**
 * Hyperscript: cria um elemento DOM com atributos e filhos. É a BASE de toda a
 * UI do Baluarte (o projeto não usa framework).
 *
 * Chaves especiais em `attrs`:
 *   - `className` / `class` (string) -> el.className
 *   - `style` (objeto)               -> Object.assign(el.style, …)  ex.: { color: 'red' }
 *   - `dataset` (objeto)             -> data-* attributes
 *   - `onX` (função)                 -> addEventListener('x', fn)   ex.: onclick, oninput
 *   - `html` (string)                -> innerHTML (⚠ use só com conteúdo confiável)
 * Outras chaves viram propriedade nativa do elemento (se existir) ou atributo HTML.
 * Valores null/false/undefined são ignorados — ótimo para filhos/atributos condicionais.
 *
 * @param {string} tag  ex.: 'div', 'button'
 * @param {object} [attrs]
 * @param {...(Node|string|number|Array|false|null)} children  arrays são achatados; falsy é ignorado
 * @returns {HTMLElement}
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs || {})) {
    if (value == null || value === false) continue;            // pula atributos "desligados"

    if (key === 'className' || key === 'class') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);                          // estilo inline via objeto
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.assign(el.dataset, value);                        // data-* attributes
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);  // onclick -> evento 'click'
    } else if (key === 'html') {
      el.innerHTML = value;                                    // ⚠ só com conteúdo confiável
    } else if (key in el && typeof value !== 'object') {
      el[key] = value;                                         // propriedade nativa (value, checked, href…)
    } else {
      el.setAttribute(key, value);                             // atributo HTML genérico (aria-*, role…)
    }
  }

  appendChildren(el, children);   // achata arrays, ignora null/false, texto vira textNode
  return el;
}

function appendChildren(parent, children) {
  for (const child of children) {
    if (child == null || child === false) continue;
    if (Array.isArray(child)) {
      appendChildren(parent, child);
    } else if (child instanceof Node) {
      parent.appendChild(child);
    } else {
      parent.appendChild(document.createTextNode(String(child)));
    }
  }
}

/** Combina classNames descartando falsy. */
export function cx(...parts) {
  return parts
    .flat()
    .filter(Boolean)
    .join(' ');
}

/** Debounce para inputs. */
export function debounce(fn, delay = 200) {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/** Throttle para eventos frequentes (scroll, resize). */
export function throttle(fn, limit = 100) {
  let inThrottle = false;
  return function throttled(...args) {
    if (inThrottle) return;
    inThrottle = true;
    fn.apply(this, args);
    setTimeout(() => (inThrottle = false), limit);
  };
}

/** Formata número com separador de milhar pt-BR. */
export function formatNumber(value, opts = {}) {
  return new Intl.NumberFormat('pt-BR', opts).format(value);
}

/** Formata data/hora pt-BR. */
export function formatDateTime(date, opts = { dateStyle: 'short', timeStyle: 'medium' }) {
  return new Intl.DateTimeFormat('pt-BR', opts).format(date);
}

/** Pad zero para números (clock). */
export const pad2 = (n) => String(n).padStart(2, '0');

/** Espera ms (Promise). */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Remove acentos para busca. */
export function normalize(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/** Limpa um elemento (filhos). */
export function empty(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

/** Substitui o conteúdo de um container por um novo nó. */
export function mount(container, child) {
  empty(container);
  if (child) container.appendChild(child);
}

/** n bytes aleatórios em hex — criptograficamente fortes (crypto, não
 *  Math.random): ids gerados aqui são persistidos no mesmo storage de dados
 *  sensíveis (ex: cofre do /apis), e o CodeQL exige aleatoriedade forte. */
export function randHex(bytes = 4) {
  const b = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

/** Gera um id curto. */
export function uid(prefix = 'id') {
  return `${prefix}_${randHex(6)}`;
}
