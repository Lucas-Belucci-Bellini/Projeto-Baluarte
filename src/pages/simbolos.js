/**
 * Página /simbolos — Hub de 1200+ caracteres Unicode (Fase 10).
 *
 * - Filtro por categoria (chips)
 * - Busca por nome ou code point
 * - Click copia para clipboard
 * - Favoritos persistidos
 */

import '../styles/biblioteca.css';
import '../styles/simbolos.css';
import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { SYMBOL_CATEGORIES, describe, getAllSymbols, countTotal } from '../data/symbols.js';
import { setStatus } from '../utils/baluarte-status.js';

const STORAGE_KEY = 'simbolos:state';

let state = null;
let gridEl = null;
let countEl = null;
let allSymbols = [];

function loadState() {
  return storage.get(STORAGE_KEY) || {
    activeCat: 'all',
    search: '',
    favorites: ['★', '⬡', '◆', '✓']
  };
}
function persist() { storage.set(STORAGE_KEY, state); }

function copyChar(char) {
  navigator.clipboard.writeText(char).then(() => {
    toast(`Copiado: ${char}  (${describe(char)})`, { type: 'success', duration: 1800 });
  }).catch(() => toast('Erro ao copiar', { type: 'danger' }));
}

function toggleFavorite(char) {
  const i = state.favorites.indexOf(char);
  if (i >= 0) state.favorites.splice(i, 1);
  else state.favorites.unshift(char);
  if (state.favorites.length > 30) state.favorites = state.favorites.slice(0, 30);
  persist();
  render();
}

function render() {
  if (!gridEl) return;
  setStatus('simbolos', { categoria: state.activeCat, busca: state.search });
  empty(gridEl);

  let pool;
  if (state.activeCat === 'all') {
    pool = allSymbols;
  } else if (state.activeCat === 'fav') {
    pool = state.favorites.map((c) => ({ char: c, catId: 'fav' }));
  } else {
    pool = allSymbols.filter((s) => s.catId === state.activeCat);
  }

  const term = normalize(state.search);
  let filtered = pool;
  if (term) {
    filtered = pool.filter((s) => {
      const code = s.char.codePointAt(0).toString(16);
      const desc = normalize(describe(s.char));
      return s.char.includes(term) || code.includes(term) || desc.includes(term);
    });
  }

  if (countEl) countEl.textContent = `${filtered.length} símbolos`;

  if (filtered.length === 0) {
    gridEl.appendChild(
      h('div', { className: 'symbols-empty u-text-muted' },
        h('div', { style: { fontSize: '48px', marginBottom: '8px' } }, '∅'),
        h('div', null, 'Nenhum símbolo encontrado')
      )
    );
    return;
  }

  filtered.forEach((s) => {
    const isFav = state.favorites.includes(s.char);
    const tile = h('button', {
      className: cx('symbol-tile', isFav && 'is-fav'),
      title: `${describe(s.char)} · Click: copiar · Shift+Click: favoritar`,
      onclick: (e) => {
        if (e.shiftKey) toggleFavorite(s.char);
        else copyChar(s.char);
      }
    },
      h('span', { className: 'symbol-tile__char' }, s.char),
      h('span', { className: 'symbol-tile__code' }, 'U+' + s.char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'))
    );
    gridEl.appendChild(tile);
  });
}

function renderCategoryChips() {
  const wrap = h('div', { className: 'symbols-cats' });
  const cats = [
    { id: 'all', label: 'Todas', icon: '✦', count: allSymbols.length },
    { id: 'fav', label: 'Favoritos', icon: '♥', count: state.favorites.length },
    ...SYMBOL_CATEGORIES.map((c) => ({
      id: c.id, label: c.label, icon: c.icon,
      count: allSymbols.filter((s) => s.catId === c.id).length
    }))
  ];
  cats.forEach((cat) => {
    wrap.appendChild(
      h('button', {
        className: cx('symbols-cat', state.activeCat === cat.id && 'is-active'),
        onclick: () => {
          state.activeCat = cat.id;
          persist();
          document.querySelectorAll('.symbols-cat').forEach((b) =>
            b.classList.toggle('is-active', b.dataset.c === cat.id)
          );
          render();
        },
        'data-c': cat.id
      },
        h('span', { className: 'symbols-cat__icon' }, cat.icon),
        h('span', { className: 'symbols-cat__label' }, cat.label),
        h('span', { className: 'symbols-cat__count' }, cat.count)
      )
    );
  });
  return wrap;
}

export function simbolosPage() {
  state = loadState();
  allSymbols = getAllSymbols();

  const fullPage = h('div', { className: 'page-simbolos' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'),
        h('span', null, '›'),
        h('span', null, 'HUB DE SÍMBOLOS')
      ),
      h('h1', { className: 'page-header__title' }, '✦ Hub de Símbolos'),
      h('p', { className: 'page-header__description' },
        `Catálogo de `,
        h('span', { className: 'u-text-cyan' }, `${countTotal()}+ caracteres Unicode`),
        ` em ${SYMBOL_CATEGORIES.length} categorias. `,
        h('kbd', null, 'Click'), ' copia · ',
        h('kbd', null, 'Shift+Click'), ' favorita.'
      )
    )
  );

  const searchInput = h('input', {
    className: 'input input--search',
    type: 'search',
    placeholder: 'Buscar por símbolo, nome ou code point (ex: 2605, star, arrow)...',
    spellcheck: 'false',
    autocomplete: 'off',
    oninput: debounce((e) => {
      state.search = e.target.value;
      persist();
      render();
    }, 120)
  });

  countEl = h('span', { className: 'section-header__count' }, '');

  fullPage.appendChild(h('div', { className: 'tool-search-wrap' }, searchInput));
  fullPage.appendChild(renderCategoryChips());
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Catálogo'),
      countEl
    )
  );

  gridEl = h('div', { className: 'symbols-grid' });
  fullPage.appendChild(gridEl);

  render();

  return fullPage;
}
