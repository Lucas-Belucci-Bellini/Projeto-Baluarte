import '../styles/biblioteca.css';
import '../styles/simbolos.css';
import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast';
import { SYMBOL_CATEGORIES, describe, getAllSymbols, countTotal } from '../data/symbols.js';
import type { SymbolEntry } from '../data/symbols.js';
import { setStatus } from '../utils/baluarte-status';

const STORAGE_KEY = 'simbolos:state';

interface SymbolState {
  activeCat: string;
  search: string;
  favorites: string[];
}

interface SymbolCategoryChip {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly count: number;
}

let state: SymbolState = { activeCat: 'all', search: '', favorites: [] };
let gridEl: HTMLDivElement | null = null;
let countEl: HTMLSpanElement | null = null;
let allSymbols: SymbolEntry[] = [];

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function loadState(): SymbolState {
  const saved: unknown = storage.get(STORAGE_KEY);
  if (!isRecord(saved)) {
    return { activeCat: 'all', search: '', favorites: ['★', '⬡', '◆', '✓'] };
  }
  const favorites = Array.isArray(saved.favorites)
    ? saved.favorites.filter((value): value is string => typeof value === 'string')
    : ['★', '⬡', '◆', '✓'];
  return {
    activeCat: typeof saved.activeCat === 'string' ? saved.activeCat : 'all',
    search: typeof saved.search === 'string' ? saved.search : '',
    favorites,
  };
}

function persist(): void {
  storage.set(STORAGE_KEY, state);
}

function copyChar(char: string): void {
  void navigator.clipboard.writeText(char).then(
    () => toast(`Copiado: ${char}  (${describe(char)})`, { type: 'success', duration: 1800 }),
    () => toast('Erro ao copiar', { type: 'danger' }),
  );
}

function toggleFavorite(char: string): void {
  const index = state.favorites.indexOf(char);
  if (index >= 0) state.favorites.splice(index, 1);
  else state.favorites.unshift(char);
  if (state.favorites.length > 30) state.favorites = state.favorites.slice(0, 30);
  persist();
  render();
}

function symbolCode(char: string): string {
  return (char.codePointAt(0) ?? 0).toString(16);
}

function render(): void {
  if (!gridEl) return;
  setStatus('simbolos', { categoria: state.activeCat, busca: state.search });
  empty(gridEl);

  let pool: readonly SymbolEntry[];
  if (state.activeCat === 'all') pool = allSymbols;
  else if (state.activeCat === 'fav') pool = state.favorites.map((char) => ({ char, catId: 'fav' }));
  else pool = allSymbols.filter((symbol) => symbol.catId === state.activeCat);

  const term = normalize(state.search);
  const filtered = term
    ? pool.filter((symbol) => symbol.char.includes(term) || symbolCode(symbol.char).includes(term) || normalize(describe(symbol.char)).includes(term))
    : pool;

  if (countEl) countEl.textContent = `${filtered.length} símbolos`;
  if (!filtered.length) {
    gridEl.appendChild(h('div', { className: 'symbols-empty u-text-muted' },
      h('div', { style: { fontSize: '48px', marginBottom: '8px' } }, '∅'),
      h('div', null, 'Nenhum símbolo encontrado')));
    return;
  }

  filtered.forEach((symbol) => {
    const isFavorite = state.favorites.includes(symbol.char);
    gridEl?.appendChild(h('button', {
      className: cx('symbol-tile', isFavorite && 'is-fav'),
      title: `${describe(symbol.char)} · Click: copiar · Shift+Click: favoritar`,
      onclick: (event: MouseEvent): void => {
        if (event.shiftKey) toggleFavorite(symbol.char);
        else copyChar(symbol.char);
      },
    },
      h('span', { className: 'symbol-tile__char' }, symbol.char),
      h('span', { className: 'symbol-tile__code' }, `U+${symbolCode(symbol.char).toUpperCase().padStart(4, '0')}`),
    ));
  });
}

function renderCategoryChips(): HTMLDivElement {
  const wrap = h('div', { className: 'symbols-cats' });
  const categories: SymbolCategoryChip[] = [
    { id: 'all', label: 'Todas', icon: '✦', count: allSymbols.length },
    { id: 'fav', label: 'Favoritos', icon: '♥', count: state.favorites.length },
    ...SYMBOL_CATEGORIES.map((category) => ({
      id: category.id,
      label: category.label,
      icon: category.icon,
      count: allSymbols.filter((symbol) => symbol.catId === category.id).length,
    })),
  ];

  categories.forEach((category) => {
    wrap.appendChild(h('button', {
      className: cx('symbols-cat', state.activeCat === category.id && 'is-active'),
      onclick: (): void => {
        state.activeCat = category.id;
        persist();
        document.querySelectorAll<HTMLElement>('.symbols-cat').forEach((button) => {
          button.classList.toggle('is-active', button.dataset.c === category.id);
        });
        render();
      },
      'data-c': category.id,
    },
      h('span', { className: 'symbols-cat__icon' }, category.icon),
      h('span', { className: 'symbols-cat__label' }, category.label),
      h('span', { className: 'symbols-cat__count' }, category.count),
    ));
  });
  return wrap;
}

export function simbolosPage(): HTMLDivElement {
  state = loadState();
  allSymbols = getAllSymbols();

  const fullPage = h('div', { className: 'page-simbolos' });
  fullPage.appendChild(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
    h('div', { className: 'page-header__crumbs' },
      h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'FERRAMENTAS'), h('span', null, '›'), h('span', null, 'HUB DE SÍMBOLOS')),
    h('h1', { className: 'page-header__title' }, '✦ Hub de Símbolos'),
    h('p', { className: 'page-header__description' },
      'Catálogo de ', h('span', { className: 'u-text-cyan' }, `${countTotal()}+ caracteres Unicode`),
      ` em ${SYMBOL_CATEGORIES.length} categorias. `, h('kbd', null, 'Click'), ' copia · ', h('kbd', null, 'Shift+Click'), ' favorita.')));

  const searchInput = h('input', {
    className: 'input input--search',
    type: 'search',
    placeholder: 'Buscar por símbolo, nome ou code point (ex: 2605, star, arrow)...',
    spellcheck: 'false',
    autocomplete: 'off',
    value: state.search,
    oninput: debounce((event: Event): void => {
      if (!(event.target instanceof HTMLInputElement)) return;
      state.search = event.target.value;
      persist();
      render();
    }, 120),
  });

  countEl = h('span', { className: 'section-header__count' }, '');
  fullPage.appendChild(h('div', { className: 'tool-search-wrap' }, searchInput));
  fullPage.appendChild(renderCategoryChips());
  fullPage.appendChild(h('div', { className: 'section-header' }, h('h2', { className: 'section-header__title' }, 'Catálogo'), countEl));
  gridEl = h('div', { className: 'symbols-grid' });
  fullPage.appendChild(gridEl);
  render();
  return fullPage;
}
