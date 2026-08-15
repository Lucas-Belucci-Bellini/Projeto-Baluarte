import { h, cx, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { ELEMENTS, CATEGORIES_PT, TOTAL_ELEMENTS, findElement, electronConfig } from '../data/periodic.js';
import type { PeriodicCategory, PeriodicElement } from '../data/periodic.js';

const STORAGE_KEY = 'periodic:state';
type FilterId = 'all' | PeriodicCategory;
interface PeriodicState { selected: number; filter: FilterId; }
interface GridPosition { readonly col: number; readonly row: number; }
interface FilterOption { readonly id: FilterId; readonly label: string; readonly color: string; }
let state: PeriodicState = { selected: 1, filter: 'all' };
let tableEl: HTMLDivElement | null = null;
let detailEl: HTMLDivElement | null = null;
function loadState(): PeriodicState { const stored = storage.get(STORAGE_KEY); if (typeof stored === 'object' && stored !== null && 'selected' in stored && 'filter' in stored && typeof stored.selected === 'number' && typeof stored.filter === 'string') return { selected: stored.selected, filter: stored.filter as FilterId }; return { selected: 1, filter: 'all' }; }
function persist(): void { storage.set(STORAGE_KEY, state); }
function gridPosition(element: PeriodicElement): GridPosition { if (element.group === 'L') return { col: element.z - 57 + 3, row: 9 }; if (element.group === 'A') return { col: element.z - 89 + 3, row: 10 }; return { col: element.group, row: element.period }; }
function renderTable(): void {
  if (!tableEl) return;
  const table = tableEl;
  empty(table);
  for (let row = 1; row <= 10; row += 1) for (let col = 1; col <= 18; col += 1) table.appendChild(h('div', { className: 'periodic-cell periodic-cell--gap', style: `grid-row: ${row}; grid-column: ${col};` }));
  ELEMENTS.forEach((element) => {
    const position = gridPosition(element);
    const category = CATEGORIES_PT[element.category] ?? CATEGORIES_PT.unknown;
    const isActive = element.z === state.selected;
    const dim = state.filter !== 'all' && state.filter !== element.category;
    const cell = h('button', { className: cx('periodic-cell', isActive && 'is-active', dim && 'is-dim'), style: `grid-row: ${position.row}; grid-column: ${position.col}; --el-color: ${category.color};`, 'data-z': element.z, title: `${element.name} (${element.symbol}) · Z=${element.z}`, onclick: (): void => { state.selected = element.z; persist(); document.querySelectorAll('.periodic-cell').forEach((candidate) => candidate.classList.toggle('is-active', candidate.getAttribute('data-z') === String(element.z))); renderDetail(); } }, h('div', { className: 'periodic-cell__z' }, element.z), h('div', { className: 'periodic-cell__sym' }, element.symbol), h('div', { className: 'periodic-cell__mass u-mono' }, element.mass.toString().slice(0, 5)));
    table.appendChild(cell);
  });
  table.appendChild(h('div', { className: 'periodic-cell periodic-cell--marker', style: 'grid-row: 6; grid-column: 3;' }, h('div', { className: 'periodic-cell__sym' }, '57-71')));
  table.appendChild(h('div', { className: 'periodic-cell periodic-cell--marker', style: 'grid-row: 7; grid-column: 3;' }, h('div', { className: 'periodic-cell__sym' }, '89-103')));
}
function renderDetail(): void {
  if (!detailEl) return;
  empty(detailEl);
  const element = findElement(state.selected);
  if (!element) return;
  const category = CATEGORIES_PT[element.category] ?? CATEGORIES_PT.unknown;
  const head = h('div', { className: 'pt-detail__head', style: `--el-color: ${category.color};` }, h('div', { className: 'pt-detail__symbol' }, element.symbol), h('div', null, h('div', { className: 'pt-detail__z u-mono u-text-muted' }, `Z = ${element.z}`), h('h2', { className: 'pt-detail__name' }, element.name), h('div', { className: 'pt-detail__cat' }, category.label)));
  const stats = h('div', { className: 'pt-detail__stats' },
    h('div', { className: 'pt-stat' }, h('span', { className: 'pt-stat__label' }, 'Massa atômica'), h('span', { className: 'pt-stat__value' }, `${element.mass} u`)),
    h('div', { className: 'pt-stat' }, h('span', { className: 'pt-stat__label' }, 'Período'), h('span', { className: 'pt-stat__value' }, element.period)),
    h('div', { className: 'pt-stat' }, h('span', { className: 'pt-stat__label' }, 'Grupo'), h('span', { className: 'pt-stat__value' }, element.group)),
    h('div', { className: 'pt-stat pt-stat--wide' }, h('span', { className: 'pt-stat__label' }, 'Configuração eletrônica'), h('span', { className: 'pt-stat__value u-mono', style: 'font-size: 12px' }, electronConfig(element.z)))
  );
  detailEl.append(head, stats);
}
export function tabelaPeriodicaPage(): HTMLDivElement {
  state = loadState();
  const fullPage = h('div', { className: 'page-pt' });
  fullPage.append(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } }, h('div', { className: 'page-header__crumbs' }, h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'FERRAMENTAS'), h('span', null, '›'), h('span', null, 'TABELA PERIÓDICA')), h('h1', { className: 'page-header__title' }, '⚛ Tabela Periódica'), h('p', { className: 'page-header__description' }, h('span', { className: 'u-text-cyan' }, `${TOTAL_ELEMENTS} elementos`), ' com massa, configuração eletrônica e categoria. Filtre por categoria, clique pra ver detalhes.')));
  const filterOptions: FilterOption[] = [{ id: 'all', label: 'Todos', color: '#93a4bf' }, ...Object.entries(CATEGORIES_PT).map(([id, info]) => ({ id: id as PeriodicCategory, ...info }))];
  const chips = h('div', { className: 'pt-filters' });
  filterOptions.forEach((filter) => chips.appendChild(h('button', { className: cx('pt-filter', state.filter === filter.id && 'is-active'), style: `--f-color: ${filter.color};`, onclick: (): void => { state.filter = filter.id; persist(); document.querySelectorAll('.pt-filter').forEach((button) => button.classList.toggle('is-active', (button.textContent ?? '').trim() === filter.label)); renderTable(); } }, filter.label)));
  fullPage.appendChild(chips);
  tableEl = h('div', { className: 'pt-table' });
  detailEl = h('div', { className: 'pt-detail' });
  fullPage.append(tableEl, detailEl);
  renderTable(); renderDetail();
  return fullPage;
}
