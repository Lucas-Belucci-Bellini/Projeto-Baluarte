/**
 * Página /elites — equipes ALFA–ZULU, filtros e ficha detalhada.
 */

import '../styles/biblioteca.css';
import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { router } from '../core/router.js';
import type { RouteArgs } from '../core/router.js';
import { buildImmersiveHero } from '../utils/immersive.js';
import { ROSTERS } from '../data/elites-rosters.js';
import {
  EQUIPES,
  STATUS_OPTIONS,
  SPECIALTIES,
  TOTAL_EQUIPES,
  ACTIVE_COUNT,
  findEquipe,
  statusInfo
} from '../data/elites.js';
import { findArc } from '../data/cronicas.js';
import type { Equipe } from '../data/elites.js';

const STORAGE_KEY = 'elites:state';

interface ElitesState {
  activeStatus: string;
  activeSpec: string;
  search: string;
  selectedCode: string;
}

export interface ElitesPageArgs {
  query?: RouteArgs['query'] | null;
}

let state: ElitesState;
let gridEl: HTMLDivElement | null = null;
let detailEl: HTMLDivElement | null = null;
let countEl: HTMLSpanElement | null = null;

function loadState(): ElitesState {
  const saved = storage.get<Partial<ElitesState>>(STORAGE_KEY);
  return {
    activeStatus: saved?.activeStatus ?? 'all',
    activeSpec: saved?.activeSpec ?? 'all',
    search: saved?.search ?? '',
    selectedCode: saved?.selectedCode ?? 'ALFA'
  };
}

function persist(): void {
  storage.set(STORAGE_KEY, state);
}

function applyFilters(): readonly Equipe[] {
  let pool: readonly Equipe[] = EQUIPES;
  if (state.activeStatus !== 'all') {
    pool = pool.filter((equipe) => equipe.status === state.activeStatus);
  }
  if (state.activeSpec !== 'all') {
    pool = pool.filter((equipe) => equipe.specialty === state.activeSpec);
  }
  if (state.search) {
    const term = normalize(state.search);
    pool = pool.filter((equipe) =>
      normalize(equipe.code).includes(term) ||
      normalize(equipe.name).includes(term) ||
      normalize(equipe.specialty).includes(term) ||
      normalize(equipe.leader).includes(term) ||
      normalize(equipe.motto).includes(term) ||
      normalize(equipe.description).includes(term));
  }
  return pool;
}

function renderGrid(): void {
  const grid = gridEl;
  if (!grid) return;
  empty(grid);
  const filtered = applyFilters();
  if (countEl) countEl.textContent = `${filtered.length} de ${TOTAL_EQUIPES}`;

  if (filtered.length === 0) {
    grid.appendChild(
      h('div', { className: 'elites-empty u-text-muted' },
        h('div', { style: { fontSize: '48px' } }, '◇'),
        h('div', null, 'Nenhuma equipe corresponde aos filtros')));
    return;
  }

  filtered.forEach((equipe) => {
    const status = statusInfo(equipe.status);
    const isActive = equipe.code === state.selectedCode;
    const card = h('div', {
      className: cx('elite-card', isActive && 'is-active'),
      dataset: { c: equipe.code },
      style: `--elite-color: ${equipe.color};`,
      onclick: (): void => {
        state.selectedCode = equipe.code;
        persist();
        document.querySelectorAll<HTMLElement>('.elite-card').forEach((element) =>
          element.classList.toggle('is-active', element.dataset.c === equipe.code));
        renderDetail();
      }
    },
      h('div', { className: 'elite-card__head' },
        h('div', {
          className: 'elite-card__cover',
          style: `color: ${equipe.color}; border-color: ${equipe.color};`
        }, equipe.cover),
        h('div', { className: 'elite-card__title' },
          h('div', { className: 'elite-card__code' }, equipe.code),
          h('div', { className: 'elite-card__name' }, equipe.name)),
        h('span', { className: `badge badge--${status.color}` }, status.label)),
      h('div', { className: 'elite-card__spec' }, equipe.specialty),
      h('div', { className: 'elite-card__motto' }, '"', equipe.motto, '"'),
      h('div', { className: 'elite-card__meta' },
        h('span', null, `${equipe.members} membro${equipe.members > 1 ? 's' : ''}`),
        h('span', null, '· '),
        h('span', null, `formada ${equipe.formed}`)));
    grid.appendChild(card);
  });
}

function renderDetail(): void {
  if (!detailEl) return;
  empty(detailEl);
  const equipe = findEquipe(state.selectedCode);
  if (!equipe) {
    detailEl.appendChild(
      h('div', { className: 'elites-empty u-text-muted' }, 'Selecione uma equipe'));
    return;
  }
  const status = statusInfo(equipe.status);

  detailEl.appendChild(
    h('div', { className: 'elite-detail__head', style: `--elite-color: ${equipe.color};` },
      h('div', { className: 'elite-detail__cover' }, equipe.cover),
      h('div', { className: 'elite-detail__title' },
        h('div', { className: 'elite-detail__code' }, equipe.code),
        h('h2', { className: 'elite-detail__name' }, equipe.name),
        h('div', { className: 'elite-detail__spec' }, equipe.specialty)),
      h('span', { className: `badge badge--${status.color}` }, status.label.toUpperCase())));

  detailEl.appendChild(
    h('div', { className: 'elite-detail__motto' }, '"', equipe.motto, '"'));

  detailEl.appendChild(
    h('div', { className: 'elite-detail__stats' },
      h('div', { className: 'elite-stat' },
        h('span', { className: 'elite-stat__label' }, 'Líder'),
        h('span', { className: 'elite-stat__value' }, equipe.leader)),
      h('div', { className: 'elite-stat' },
        h('span', { className: 'elite-stat__label' }, 'Membros'),
        h('span', { className: 'elite-stat__value' }, equipe.members)),
      h('div', { className: 'elite-stat' },
        h('span', { className: 'elite-stat__label' }, 'Formada em'),
        h('span', { className: 'elite-stat__value' }, equipe.formed)),
      h('div', { className: 'elite-stat elite-stat--wide' },
        h('span', { className: 'elite-stat__label' }, 'Base'),
        h('span', { className: 'elite-stat__value' }, equipe.base))));

  const roster = ROSTERS[equipe.code];
  if (roster && roster.length) {
    const rosterSection = h('div', { className: 'elite-detail__section' });
    rosterSection.appendChild(
      h('div', { className: 'elite-detail__section-title' }, `★ Integrantes (${roster.length})`));
    const rosterWrap = h('div', { className: 'elite-roster' });
    roster.forEach((name) =>
      rosterWrap.appendChild(h('span', { className: 'elite-roster__member' }, name)));
    rosterSection.appendChild(rosterWrap);
    detailEl.appendChild(rosterSection);
  }

  detailEl.appendChild(
    h('div', { className: 'elite-detail__section' },
      h('div', { className: 'elite-detail__section-title' }, '◆ Descrição'),
      h('p', null, equipe.description)));

  const equipmentSection = h('div', { className: 'elite-detail__section' });
  equipmentSection.appendChild(
    h('div', { className: 'elite-detail__section-title' }, '⌖ Equipamento típico'));
  const equipmentList = h('ul', { className: 'elite-detail__list' });
  equipe.equipment.forEach((item) => equipmentList.appendChild(h('li', null, item)));
  equipmentSection.appendChild(equipmentList);
  detailEl.appendChild(equipmentSection);

  const operationsSection = h('div', { className: 'elite-detail__section' });
  operationsSection.appendChild(
    h('div', { className: 'elite-detail__section-title' }, '◫ Operações notáveis'));
  const operationsList = h('ul', { className: 'elite-detail__list' });
  equipe.notableOps.forEach((operation) => operationsList.appendChild(h('li', null, operation)));
  operationsSection.appendChild(operationsList);
  detailEl.appendChild(operationsSection);

  if (equipe.arc) {
    const targetArc = findArc(equipe.arc);
    detailEl.appendChild(
      h('button', {
        className: 'btn btn--primary btn--sm',
        style: 'margin-top: 12px',
        onclick: (): void => {
          const bibState = storage.get<{
            selectedArc?: string;
            selectedChapter?: string;
          }>('biblioteca:state', {});
          bibState.selectedArc = equipe.arc ?? undefined;
          if (targetArc?.chapters[0]) {
            bibState.selectedChapter = targetArc.chapters[0].id;
          }
          storage.set('biblioteca:state', bibState);
          router.navigate('/biblioteca');
        }
      }, `◫ Ler ${targetArc ? targetArc.title : 'arco'} na Biblioteca →`));
  }
}

export function elitesPage(args: ElitesPageArgs = {}): HTMLDivElement {
  state = loadState();

  const fullPage = h('div', { className: 'page-elites' });

  fullPage.appendChild(buildImmersiveHero({
    kicker: 'BALUARTE · ELITES',
    title: 'Elites do Baluarte',
    sub: 'ESQUADRÕES ALFA → ZULU',
    desc: [
      h('span', { className: 'u-text-cyan' }, `${TOTAL_EQUIPES} equipes`),
      ' catalogadas (ALFA → ZULU), ',
      h('span', { className: 'u-text-cyan' }, `${ACTIVE_COUNT} operacionais`),
      '. Filtre por status, especialidade ou busque por nome/líder/lema.'
    ],
    ctas: [
      { label: '⌖ Arsenal', variant: 'primary', onClick: () => router.navigate('/arsenal') },
      { label: '▣ Dossiê das Forças', onClick: () => router.navigate('/dossie') }
    ],
    hudLeft: '◆ ESQUADRÕES · ATIVOS',
    hudRight: `${ACTIVE_COUNT}/${TOTAL_EQUIPES} OPERACIONAIS`,
    sceneKey: 'elites',
    query: args.query ?? null
  }));

  const searchInput = h('input', {
    className: 'input input--search',
    type: 'search',
    placeholder: 'Buscar por código, nome, especialidade, líder, lema…',
    value: state.search,
    oninput: debounce((event: Event): void => {
      if (event.target instanceof HTMLInputElement) {
        state.search = event.target.value;
        persist();
        renderGrid();
      }
    }, 120)
  });

  const statusSel = h('select', {
    className: 'input',
    'aria-label': 'Filtrar por status',
    onchange: (event: Event): void => {
      if (event.target instanceof HTMLSelectElement) {
        state.activeStatus = event.target.value;
        persist();
        renderGrid();
      }
    }
  },
    h('option', { value: 'all', selected: state.activeStatus === 'all' }, 'Todos status'),
    ...STATUS_OPTIONS.map((status) =>
      h('option', { value: status.id, selected: state.activeStatus === status.id }, status.label)));

  const specSel = h('select', {
    className: 'input',
    'aria-label': 'Filtrar por especialidade',
    onchange: (event: Event): void => {
      if (event.target instanceof HTMLSelectElement) {
        state.activeSpec = event.target.value;
        persist();
        renderGrid();
      }
    }
  },
    h('option', { value: 'all', selected: state.activeSpec === 'all' }, 'Todas especialidades'),
    ...SPECIALTIES.map((specialty) =>
      h('option', { value: specialty, selected: state.activeSpec === specialty }, specialty)));

  countEl = h('span', { className: 'section-header__count' }, '');
  fullPage.appendChild(
    h('div', { className: 'elites-controls' },
      h('div', { style: { flex: 1, minWidth: '200px' } }, searchInput),
      statusSel,
      specSel,
      countEl));

  gridEl = h('div', { className: 'elites-grid' });
  detailEl = h('div', { className: 'elite-detail' });
  fullPage.appendChild(h('div', { className: 'elites-main' }, gridEl, detailEl));

  renderGrid();
  renderDetail();
  return fullPage;
}
