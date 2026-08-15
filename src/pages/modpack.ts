import '../styles/biblioteca.css';
import '../styles/simbolos.css';
import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { MODS, MOD_CATEGORIES, TOTAL_MODS } from '../data/modpack.js';
import type { ModEntry, ModCategory, ModpackTier } from '../data/modpack.js';
import { ARMA3_PRESETS, ARMA3_TOTAL_MODS } from '../data/arma3-presets.js';
import type { Arma3Preset } from '../data/arma3-presets.js';
import { ARMA3_DLCS, ARMA3_INSTALACAO } from '../data/arma3-instalacao.js';

const STORAGE_KEY = 'modpack:state';
type TierFilter = 'all' | ModpackTier;
interface ModpackState { cat: string; tier: TierFilter; search: string; }
let state: ModpackState = { cat: 'all', tier: 'all', search: '' };
let listEl: HTMLDivElement | null = null;
let countEl: HTMLSpanElement | null = null;

function isRecord(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function isTier(value: unknown): value is ModpackTier { return value === 'S' || value === 'A' || value === 'B' || value === 'C'; }
function loadState(): ModpackState {
  const saved: unknown = storage.get(STORAGE_KEY);
  if (!isRecord(saved)) return { ...state };
  return { cat: typeof saved.cat === 'string' ? saved.cat : 'all', tier: saved.tier === 'all' || isTier(saved.tier) ? saved.tier : 'all', search: typeof saved.search === 'string' ? saved.search : '' };
}
function persist(): void { storage.set(STORAGE_KEY, state); }
function applyFilters(): readonly ModEntry[] {
  let pool: readonly ModEntry[] = MODS;
  if (state.cat !== 'all') pool = pool.filter((mod) => mod.cat === state.cat);
  if (state.tier !== 'all') pool = pool.filter((mod) => mod.tier === state.tier);
  if (state.search) { const term = normalize(state.search); pool = pool.filter((mod) => normalize(mod.name).includes(term) || normalize(mod.author).includes(term) || normalize(mod.desc).includes(term)); }
  return pool;
}
function tierColor(tier: ModpackTier): string { return { S: 'magenta', A: 'cyan', B: 'success', C: 'muted' }[tier] ?? 'muted'; }
function renderList(): void {
  if (!listEl) return;
  empty(listEl);
  const filtered = applyFilters();
  if (countEl) countEl.textContent = `${filtered.length} de ${TOTAL_MODS}`;
  if (!filtered.length) { listEl.appendChild(h('div', { className: 'media-empty u-text-muted' }, 'Nenhum mod encontrado')); return; }
  filtered.forEach((mod) => {
    const category = MOD_CATEGORIES.find((candidate) => candidate.id === mod.cat);
    listEl?.appendChild(h('div', { className: 'modpack-card', style: category ? `--c-color: ${category.color};` : '' },
      h('div', { className: 'modpack-card__head' }, h('span', { className: `badge badge--${tierColor(mod.tier)}` }, `TIER ${mod.tier}`), h('span', { className: 'modpack-card__cat u-text-muted u-mono' }, category?.label ?? mod.cat)),
      h('div', { className: 'modpack-card__name' }, mod.name), h('div', { className: 'modpack-card__author u-text-muted u-mono' }, `by ${mod.author}`), h('p', { className: 'modpack-card__desc' }, mod.desc)));
  });
}

export function modpackPage(): HTMLDivElement {
  state = loadState();
  const fullPage = h('div', { className: 'page-modpack' });
  fullPage.appendChild(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } }, h('div', { className: 'page-header__crumbs' }, h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'FERRAMENTAS'), h('span', null, '›'), h('span', null, 'CENTRAL DE MODPACKS')), h('h1', { className: 'page-header__title' }, '◧ Central de Modpacks'), h('p', { className: 'page-header__description' }, 'Todos os dados dos modpacks: ', h('span', { className: 'u-text-cyan' }, `Minecraft — ${TOTAL_MODS} mods`), ` em ${MOD_CATEGORIES.length} categorias · `, h('span', { className: 'u-text-cyan' }, `Arma 3 — ${ARMA3_PRESETS.length} presets (${ARMA3_TOTAL_MODS} mods)`), ' prontos para importar no Launcher.')));
  const mcWrap = h('div');
  const a3Wrap = h('div', { style: 'display:none' });
  const tabs = h('div', { className: 'symbols-cats', style: { marginBottom: '10px' } });
  const switchTab = (game: 'mc' | 'a3'): void => { mcWrap.style.display = game === 'mc' ? '' : 'none'; a3Wrap.style.display = game === 'a3' ? '' : 'none'; Array.from(tabs.children).forEach((child) => (child as HTMLElement).classList.toggle('is-active', (child as HTMLElement).dataset.jogo === game)); };
  tabs.append(h('button', { className: 'symbols-cat is-active', dataset: { jogo: 'mc' }, onclick: (): void => switchTab('mc') }, h('span', { className: 'symbols-cat__icon' }, '◧'), h('span', { className: 'symbols-cat__label' }, `Minecraft (${TOTAL_MODS})`)), h('button', { className: 'symbols-cat', dataset: { jogo: 'a3' }, onclick: (): void => switchTab('a3') }, h('span', { className: 'symbols-cat__icon' }, '🪖'), h('span', { className: 'symbols-cat__label' }, `Arma 3 (${ARMA3_TOTAL_MODS})`)));
  fullPage.append(tabs, mcWrap, a3Wrap);
  const searchInput = h('input', { className: 'input input--search', type: 'search', placeholder: 'Buscar mod por nome, autor ou descrição…', value: state.search, oninput: debounce((event: Event): void => { if (event.target instanceof HTMLInputElement) { state.search = event.target.value; persist(); renderList(); } }, 120) });
  const tierSel = h('select', { className: 'input', 'aria-label': 'Filtrar por tier', onchange: (event: Event): void => { if (event.target instanceof HTMLSelectElement) { state.tier = event.target.value === 'all' || isTier(event.target.value) ? event.target.value : 'all'; persist(); renderList(); } } }, h('option', { value: 'all', selected: state.tier === 'all' }, 'Todos os tiers'), ...(['S', 'A', 'B', 'C'] as const).map((tier) => h('option', { value: tier, selected: state.tier === tier }, `${tier} · ${tier === 'S' ? 'essencial' : tier === 'A' ? 'muito recomendado' : tier === 'B' ? 'situacional' : 'niche'}`)));
  countEl = h('span', { className: 'section-header__count' }, '');
  mcWrap.appendChild(h('div', { className: 'elites-controls' }, h('div', { style: { flex: 1, minWidth: '200px' } }, searchInput), tierSel, countEl));
  const chips = h('div', { className: 'symbols-cats' });
  const categories: readonly ModCategory[] = [{ id: 'all', label: 'Tudo', icon: '⬡', color: '#93a4bf' }, ...MOD_CATEGORIES];
  categories.forEach((category) => chips.appendChild(h('button', { className: cx('symbols-cat', state.cat === category.id && 'is-active'), onclick: (): void => { state.cat = category.id; persist(); chips.querySelectorAll<HTMLElement>('.symbols-cat').forEach((button) => button.classList.toggle('is-active', button.textContent?.trim().startsWith(category.label) ?? false)); renderList(); } }, category.icon && h('span', { className: 'symbols-cat__icon' }, category.icon), h('span', { className: 'symbols-cat__label' }, category.label))));
  mcWrap.appendChild(chips);
  listEl = h('div', { className: 'modpack-grid' }); mcWrap.appendChild(listEl); renderList();
  if (/[?&]jogo=arma3/.test(window.location.hash)) switchTab('a3');
  a3Wrap.appendChild(h('div', { className: 'page-header anim-fade-in', style: { margin: '4px 0 12px' } }, h('h2', { className: 'page-header__title', style: { fontSize: '1.6em' } }, '🪖 Presets Arma 3'), h('p', { className: 'page-header__description' }, h('span', { className: 'u-text-cyan' }, `${ARMA3_PRESETS.length} presets`), ' do operador com ', h('span', { className: 'u-text-cyan' }, `${ARMA3_TOTAL_MODS} mods`), ' no total. Baixe o preset e arraste para o Arma 3 Launcher.'), h('a', { className: 'btn btn--primary', style: 'margin-top:10px', href: '#/arma3-tutorial' }, '📖 Tutorial detalhado dos mods')));
  a3Wrap.appendChild(h('div', { className: 'card', style: 'padding:16px; margin-bottom:16px' }, h('div', { style: 'display:flex; align-items:center; gap:10px; margin-bottom:10px' }, h('b', null, '🎖️ DLCs & expansões instalados'), h('span', { className: 'badge badge--cyan' }, `${ARMA3_INSTALACAO.totalDlcs}`)), h('div', { className: 'a3-dlc-grid' }, ...ARMA3_DLCS.map((dlc) => h('div', { className: 'a3-dlc' }, h('span', { className: 'a3-dlc__nome' }, dlc.nome), h('span', { className: 'a3-dlc__tag u-text-muted' }, `${dlc.tipo} · ${dlc.ano}`)))), h('p', { className: 'u-text-muted', style: 'font-size:12px; margin:10px 0 0' }, ARMA3_INSTALACAO.nota)));
  const presetsGrid = h('div', { className: 'modpack-grid' });
  ARMA3_PRESETS.forEach((preset: Arma3Preset) => {
    const list = h('div', { className: 'a3-mods', style: 'display:none' }, ...preset.mods.map((mod) => h('div', { className: 'a3-mod' }, h('a', { href: mod.url, target: '_blank', rel: 'noopener noreferrer' }, mod.nome))), preset.dlcs.length ? h('div', { className: 'a3-mod u-text-muted' }, `DLCs: ${preset.dlcs.map((dlc) => dlc.nome).join(' · ')}`) : null);
    let toggle: HTMLButtonElement;
    toggle = h('button', { className: 'btn', onclick: (): void => { const open = list.style.display !== 'none'; list.style.display = open ? 'none' : 'block'; toggle.textContent = open ? `▸ ver os ${preset.mods.length} mods` : '▾ esconder mods'; } }, `▸ ver os ${preset.mods.length} mods`);
    presetsGrid.appendChild(h('div', { className: 'modpack-card' }, h('div', { className: 'modpack-card__head' }, h('span', { className: 'badge badge--cyan' }, 'ARMA 3'), h('span', { className: 'modpack-card__cat u-text-muted u-mono' }, `${preset.mods.length} mods · ${preset.dlcs.length} DLCs`)), h('div', { className: 'modpack-card__name' }, preset.nome), h('div', { style: 'display:flex; gap:8px; margin:10px 0; flex-wrap:wrap' }, h('a', { className: 'btn btn--primary', href: preset.arquivo, download: '' }, '⬇ Baixar preset'), toggle), list));
  });
  a3Wrap.appendChild(presetsGrid);
  return fullPage;
}
