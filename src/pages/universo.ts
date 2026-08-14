/**
 * Página /universo — hub de universos, lore e conexões com as Crônicas.
 */

import '../styles/universo.css';
import { h, cx, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { router } from '../core/router.js';
import type { RouteArgs } from '../core/router.js';
import { buildImmersiveHero } from '../utils/immersive.js';
import { UNIVERSOS, TOTAL_UNIVERSOS, findUniverso } from '../data/universos.js';
import { findArc } from '../data/cronicas.js';
import type { Universo } from '../data/universos.js';

const STORAGE_KEY = 'universo:state';

interface UniversoState {
  selected: string;
}

interface BibliotecaState {
  selectedArc?: string;
  selectedChapter?: string;
}

export interface UniversoPageArgs {
  query?: RouteArgs['query'] | null;
}

let state: UniversoState;
let cardsEl: HTMLDivElement | null = null;
let detailEl: HTMLDivElement | null = null;

function loadState(): UniversoState {
  const saved = storage.get<Partial<UniversoState>>(STORAGE_KEY);
  return { selected: saved?.selected ?? 'baluarte' };
}

function persist(): void {
  storage.set(STORAGE_KEY, state);
}

function renderCards(): HTMLDivElement {
  const wrap = h('div', { className: 'univ-cards' });
  UNIVERSOS.forEach((universo) => {
    wrap.appendChild(
      h('button', {
        className: cx('univ-card', state.selected === universo.id && 'is-active'),
        dataset: { u: universo.id },
        style: `--u-color: ${universo.color};`,
        onclick: (): void => {
          state.selected = universo.id;
          persist();
          document.querySelectorAll<HTMLElement>('.univ-card').forEach((element) =>
            element.classList.toggle('is-active', element.dataset.u === universo.id));
          renderDetail();
        }
      },
        h('div', { className: 'univ-card__icon', style: `color: ${universo.color};` }, universo.icon),
        h('div', { className: 'univ-card__name' }, universo.name),
        h('div', { className: 'univ-card__type u-mono' },
          universo.type === 'core' ? 'CORE' : 'CROSSOVER')));
  });
  return wrap;
}

function openArc(arcId: string): void {
  const arc = findArc(arcId);
  if (!arc) {
    router.navigate('/biblioteca');
    return;
  }

  const bibState = storage.get<BibliotecaState>('biblioteca:state', {});
  bibState.selectedArc = arcId;
  bibState.selectedChapter = arc.chapters[0]?.id;
  storage.set('biblioteca:state', bibState);
  router.navigate('/biblioteca');
}

function universeSection(
  title: string,
  items: readonly string[],
  color: string,
): HTMLDivElement | null {
  if (!items.length) return null;
  return h('div', { className: 'univ-section', style: `--s-color: ${color};` },
    h('div', { className: 'univ-section__title' }, title),
    h('ul', { className: 'univ-list' },
      ...items.map((item) => h('li', null, item))));
}

function renderDetail(): void {
  if (!detailEl) return;
  empty(detailEl);
  const universo: Universo | null = findUniverso(state.selected);
  if (!universo) return;

  detailEl.appendChild(
    h('div', { className: 'univ-detail__head', style: `--u-color: ${universo.color};` },
      h('div', {
        className: 'univ-detail__icon',
        style: `color: ${universo.color}; border-color: ${universo.color};`
      }, universo.icon),
      h('div', null,
        h('div', { className: 'univ-detail__type u-mono' },
          universo.type === 'core' ? '◆ CORE BALUARTE' : '✦ CROSSOVER'),
        h('h2', { className: 'univ-detail__name' }, universo.name),
        h('p', { className: 'univ-detail__tagline' }, universo.tagline))));

  detailEl.appendChild(
    h('div', { className: 'univ-detail__summary' },
      h('p', null, universo.summary)));

  const grid = h('div', { className: 'univ-grid' });
  const sections = [
    universeSection('◈ Pontos-chave', universo.keyFacts, '#d4a24e'),
    universeSection('◆ Facções', universo.factions, '#00ff88'),
    universeSection('⚠ Ameaças', universo.threats, '#ff3355'),
    universeSection('▶ Mídia / Referência', universo.media, '#e8c07a')
  ];
  sections.forEach((section) => {
    if (section) grid.appendChild(section);
  });
  detailEl.appendChild(grid);

  if (universo.arcs.length) {
    const arcsWrap = h('div', { className: 'univ-arcs' },
      h('div', { className: 'univ-arcs__title' }, '◫ Arcos das Crônicas relacionados'));
    universo.arcs.forEach((arcId) => {
      const arc = findArc(arcId);
      if (!arc) return;
      arcsWrap.appendChild(
        h('button', {
          className: 'univ-arc-link',
          onclick: (): void => openArc(arcId)
        },
          h('span', { className: 'univ-arc-link__code u-mono u-text-cyan' }, arc.code),
          h('span', { className: 'univ-arc-link__title' }, arc.title),
          h('span', { className: 'univ-arc-link__arrow' }, '→')));
    });
    detailEl.appendChild(arcsWrap);
  }
}

export function universoPage(args: UniversoPageArgs = {}): HTMLDivElement {
  state = loadState();
  const fullPage = h('div', { className: 'page-universo' });

  fullPage.appendChild(buildImmersiveHero({
    kicker: 'BALUARTE · HUB DE UNIVERSOS',
    title: 'Hub de Universos',
    sub: 'MULTIVERSO BALUARTE',
    variant: 'planet',
    desc: [
      h('span', { className: 'u-text-cyan' }, `${TOTAL_UNIVERSOS} universos`),
      ' catalogados: 2 core (Baluarte, Convergência) + 8 crossovers (DOOM, Halo, ',
      'Pacific Rim, Solo Leveling, Vanadis, Arifureta, Horror, Endfield).'
    ],
    ctas: [
      { label: '📖 Ler as Crônicas', variant: 'primary', onClick: () => router.navigate('/biblioteca') },
      { label: '◆ Equipes de elite', onClick: () => router.navigate('/elites') }
    ],
    hudLeft: '✦ MULTIVERSO · ONLINE',
    hudRight: `${TOTAL_UNIVERSOS} REGISTROS`,
    sceneKey: 'universo',
    query: args.query ?? null
  }));

  cardsEl = renderCards();
  detailEl = h('div', { className: 'univ-detail' });
  fullPage.appendChild(cardsEl);
  fullPage.appendChild(detailEl);
  renderDetail();
  return fullPage;
}
