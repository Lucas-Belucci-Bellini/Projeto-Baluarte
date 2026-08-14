import '../styles/biblioteca.css';
import '../styles/simbolos.css';
import '../styles/ciberseg.css';
import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { router } from '../core/router.js';
import { ENTRIES_CS, CATEGORIES_CS, TOTAL_CS } from '../data/ciberseg.js';
import type { CyberEntry, CyberCategory, CyberSeverity } from '../data/ciberseg.js';

const STORAGE_KEY = 'ciberseg:state';
type FilterValue = 'all' | CyberSeverity;
interface CyberState { activeCat: string; severity: FilterValue; search: string; selectedId: string; }

let state: CyberState = { activeCat: 'all', severity: 'all', search: '', selectedId: ENTRIES_CS[0]?.id ?? '' };
let listEl: HTMLDivElement | null = null;
let detailEl: HTMLDivElement | null = null;
let countEl: HTMLSpanElement | null = null;

function isRecord(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function isSeverity(value: unknown): value is CyberSeverity { return value === 'crítico' || value === 'alto' || value === 'médio' || value === 'baixo' || value === 'info'; }
function loadState(): CyberState {
  const saved: unknown = storage.get(STORAGE_KEY);
  if (!isRecord(saved)) return { ...state };
  return { activeCat: typeof saved.activeCat === 'string' ? saved.activeCat : 'all', severity: saved.severity === 'all' || isSeverity(saved.severity) ? saved.severity : 'all', search: typeof saved.search === 'string' ? saved.search : '', selectedId: typeof saved.selectedId === 'string' ? saved.selectedId : state.selectedId };
}
function persist(): void { storage.set(STORAGE_KEY, state); }
function severityBadge(severity: CyberSeverity): string { return { 'crítico': 'danger', alto: 'magenta', médio: 'warning', baixo: 'cyan', info: 'success' }[severity] ?? 'muted'; }
function categoryFor(entry: CyberEntry): CyberCategory | undefined { return CATEGORIES_CS.find((category) => category.id === entry.cat); }
function applyFilters(): readonly CyberEntry[] {
  let pool: readonly CyberEntry[] = ENTRIES_CS;
  if (state.activeCat !== 'all') pool = pool.filter((entry) => entry.cat === state.activeCat);
  if (state.severity !== 'all') pool = pool.filter((entry) => entry.severity === state.severity);
  if (state.search) { const term = normalize(state.search); pool = pool.filter((entry) => normalize(entry.title).includes(term) || normalize(entry.summary).includes(term) || (entry.tools ?? []).some((tool) => normalize(tool).includes(term))); }
  return pool;
}
function renderList(): void {
  if (!listEl) return;
  empty(listEl);
  const filtered = applyFilters();
  if (countEl) countEl.textContent = `${filtered.length} de ${TOTAL_CS}`;
  if (!filtered.length) { listEl.appendChild(h('div', { className: 'biblioteca-empty u-text-muted' }, 'Nenhum item')); return; }
  filtered.forEach((entry) => {
    const category = categoryFor(entry);
    const isActive = entry.id === state.selectedId;
    listEl?.appendChild(h('div', { className: cx('ciberseg-row', isActive && 'is-active'), 'data-id': entry.id, onclick: (): void => { state.selectedId = entry.id; persist(); document.querySelectorAll<HTMLElement>('.ciberseg-row').forEach((row) => row.classList.toggle('is-active', row.dataset.id === entry.id)); renderDetail(); } },
      h('div', { className: 'ciberseg-row__icon', style: category ? `color: ${category.color}` : '' }, category?.icon ?? '?'),
      h('div', { className: 'ciberseg-row__body' }, h('div', { className: 'ciberseg-row__title' }, entry.title), h('div', { className: 'ciberseg-row__cat u-text-muted u-mono' }, category?.label ?? entry.cat)),
      h('span', { className: `badge badge--${severityBadge(entry.severity)}` }, entry.severity)));
  });
}
function renderDetail(): void {
  if (!detailEl) return;
  empty(detailEl);
  const entry = ENTRIES_CS.find((candidate) => candidate.id === state.selectedId);
  if (!entry) { detailEl.appendChild(h('div', { className: 'biblioteca-empty u-text-muted' }, 'Selecione')); return; }
  const category = categoryFor(entry);
  detailEl.appendChild(h('div', { className: 'ciberseg-detail__head' }, h('div', { className: 'ciberseg-detail__icon', style: `color: ${category?.color ?? ''}; border-color: ${category?.color ?? ''}` }, category?.icon ?? '?'), h('div', null, h('div', { className: 'ciberseg-detail__cat u-text-muted u-mono' }, category?.label ?? entry.cat), h('h2', { className: 'ciberseg-detail__title' }, entry.title)), h('span', { className: `badge badge--${severityBadge(entry.severity)}` }, entry.severity.toUpperCase())));
  detailEl.appendChild(h('div', { className: 'ciberseg-section' }, h('div', { className: 'ciberseg-section__title' }, '◆ Descrição'), h('p', null, entry.summary)));
  if (entry.tools?.length) detailEl.appendChild(h('div', { className: 'ciberseg-section' }, h('div', { className: 'ciberseg-section__title' }, '⌖ Ferramentas'), h('div', { className: 'ciberseg-tools' }, ...entry.tools.map((tool) => h('code', { className: 'ciberseg-tool' }, tool)))));
  if (entry.counter) detailEl.appendChild(h('div', { className: 'ciberseg-section ciberseg-section--counter' }, h('div', { className: 'ciberseg-section__title' }, '◈ Defesa / mitigação'), h('p', null, entry.counter)));
  detailEl.appendChild(h('button', { className: 'btn btn--ghost btn--sm', style: 'margin-top: 12px', onclick: (): void => router.navigate('/cripto') }, '⚿ ir para Lab de Cripto →'));
}

export function cibersegPage(): HTMLDivElement {
  state = loadState();
  const fullPage = h('div', { className: 'page-ciberseg' });
  fullPage.appendChild(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } }, h('div', { className: 'page-header__crumbs' }, h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'CIBERSEG')), h('h1', { className: 'page-header__title' }, '⚿ CiberSeg — Ataque & Defesa'), h('p', { className: 'page-header__description' }, h('span', { className: 'u-text-cyan' }, `${TOTAL_CS} entradas`), ` em ${CATEGORIES_CS.length} categorias. Cada item documenta vetor, ferramentas e mitigação.`)));
  const searchInput = h('input', { className: 'input input--search', type: 'search', placeholder: 'Buscar por título, descrição ou ferramenta…', value: state.search, oninput: debounce((event: Event): void => { if (event.target instanceof HTMLInputElement) { state.search = event.target.value; persist(); renderList(); } }, 120) });
  const severities: readonly CyberSeverity[] = ['crítico', 'alto', 'médio', 'baixo', 'info'];
  const sevSel = h('select', { className: 'input', 'aria-label': 'Filtrar por severidade', onchange: (event: Event): void => { if (event.target instanceof HTMLSelectElement) { state.severity = event.target.value === 'all' || isSeverity(event.target.value) ? event.target.value : 'all'; persist(); renderList(); } } }, h('option', { value: 'all', selected: state.severity === 'all' }, 'Todas severidades'), ...severities.map((severity) => h('option', { value: severity, selected: state.severity === severity }, severity)));
  countEl = h('span', { className: 'section-header__count' }, '');
  fullPage.appendChild(h('div', { className: 'elites-controls' }, h('div', { style: { flex: 1, minWidth: '200px' } }, searchInput), sevSel, countEl));
  const categories = [{ id: 'all', label: 'Tudo', icon: '⬡', color: '' }, ...CATEGORIES_CS];
  const chipBar = h('div', { className: 'symbols-cats' });
  categories.forEach((category) => chipBar.appendChild(h('button', { className: cx('symbols-cat', state.activeCat === category.id && 'is-active'), 'data-c': category.id, onclick: (): void => { state.activeCat = category.id; persist(); document.querySelectorAll<HTMLElement>('.symbols-cat').forEach((button) => button.classList.toggle('is-active', button.dataset.c === category.id)); renderList(); } }, h('span', { className: 'symbols-cat__icon' }, category.icon), h('span', { className: 'symbols-cat__label' }, category.label))));
  fullPage.appendChild(chipBar);
  listEl = h('div', { className: 'ciberseg-list' }); detailEl = h('div', { className: 'ciberseg-detail' }); fullPage.appendChild(h('div', { className: 'ciberseg-grid' }, listEl, detailEl));
  renderList(); renderDetail();
  return fullPage;
}
