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
 * Cria um elemento HTML com atributos e filhos.
 * @param {string} tag
 * @param {object} [attrs] - className, dataset, onClick, style, ...
 * @param {(Node|string|Array)} [...children]
 * @returns {HTMLElement}
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs || {})) {
    if (value == null || value === false) continue;

    if (key === 'className' || key === 'class') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.assign(el.dataset, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'html') {
      el.innerHTML = value;
    } else if (key in el && typeof value !== 'object') {
      el[key] = value;
    } else {
      el.setAttribute(key, value);
    }
  }

  appendChildren(el, children);
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

/** Gera um id curto. */
export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
