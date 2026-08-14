/**
 * /enciclopedia-militar — base navegável de conhecimento militar.
 */

import '../styles/enciclopedia-militar.css';
import { h, cx, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { MILITAR_CATEGORIAS, MILITAR_FONTES } from '../data/militar-db.js';
import type {
  BattlespaceItem,
  MilitaryCard,
  MilitaryEra,
  MilitaryLevel,
  MilitaryListItem,
  MilitaryRankItem,
  MilitaryUnit
} from '../data/militar-db.js';

const KEY = 'militar-enc:cat';
type MilitaryCategory = (typeof MILITAR_CATEGORIAS)[number];

let state = '';
let navEl: HTMLDivElement | null = null;
let viewEl: HTMLDivElement | null = null;

function maxOf(data: readonly MilitaryRankItem[]): number {
  return data.reduce((max, item) => Math.max(max, item.v), 0) || 1;
}

function renderCards(data: readonly MilitaryCard[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const grid = h('div', { className: 'mil-grid' });
  data.forEach((card) => grid.appendChild(
    h('div', { className: 'mil-card' },
      h('div', { className: 'mil-card__head' },
        h('span', { className: 'mil-card__icon' }, card.icon),
        h('span', { className: 'mil-card__name' }, card.nome),
        h('span', { className: 'badge badge--cyan' }, card.dominio)),
      h('p', { className: 'mil-card__desc' }, card.resumo))));
  fragment.appendChild(grid);
  return fragment;
}

function renderBattlespace(data: readonly BattlespaceItem[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const grid = h('div', { className: 'mil-grid' });
  data.forEach((item) => grid.appendChild(
    h('div', { className: 'mil-card' },
      h('div', { className: 'mil-card__name' }, item.nome),
      h('p', { className: 'mil-card__desc' }, item.resumo),
      h('div', { className: 'mil-tags' },
        ...item.sub.map((subitem) => h('span', { className: 'mil-tag' }, subitem))))));
  fragment.appendChild(grid);
  return fragment;
}

function renderUnits(data: readonly MilitaryUnit[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const table = h('div', { className: 'mil-table' });
  table.appendChild(h('div', { className: 'mil-table__row mil-table__row--head' },
    h('span', null, 'Unidade'),
    h('span', null, 'Efetivo'),
    h('span', null, 'Comando'),
    h('span', { className: 'u-mono' }, 'OTAN')));
  data.forEach((unit) => table.appendChild(
    h('div', { className: 'mil-table__row' },
      h('span', null, unit.nome),
      h('span', { className: 'u-text-muted' }, unit.efetivo),
      h('span', { className: 'u-text-muted' }, unit.comando),
      h('span', { className: 'u-mono u-text-cyan' }, unit.simbolo))));
  fragment.appendChild(table);
  return fragment;
}

function renderLevels(data: readonly MilitaryLevel[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const grid = h('div', { className: 'mil-grid' });
  data.forEach((level) => grid.appendChild(
    h('div', { className: 'mil-card' },
      h('div', { className: 'mil-card__head' },
        h('span', { className: 'mil-card__name' }, level.nome),
        h('span', { className: 'badge badge--magenta' }, level.escopo)),
      h('p', { className: 'mil-card__desc' }, level.resumo))));
  fragment.appendChild(grid);
  return fragment;
}

function renderEras(data: readonly MilitaryEra[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const timeline = h('div', { className: 'mil-timeline' });
  data.forEach((era) => timeline.appendChild(
    h('div', { className: 'mil-tl__item' },
      h('div', { className: 'mil-tl__dot' }),
      h('div', null,
        h('div', { className: 'mil-tl__era' }, era.era),
        h('div', { className: 'mil-tl__marco u-text-muted' }, era.marco)))));
  fragment.appendChild(timeline);
  return fragment;
}

function renderRanking(data: readonly MilitaryRankItem[], type: 'rank-pct' | 'rank-bi'): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const max = maxOf(data);
  const unit = type === 'rank-pct' ? '%' : ' bi';
  const list = h('div', { className: 'mil-rank' });
  data.forEach((item, index) => {
    const bar = h('span', {
      className: 'mil-rank__bar',
      style: { width: `${Math.round((item.v / max) * 100)}%` }
    });
    list.appendChild(h('div', { className: 'mil-rank__row' },
      h('span', { className: 'mil-rank__pos u-mono' }, String(index + 1).padStart(2, '0')),
      h('span', { className: 'mil-rank__pais' }, item.pais),
      h('span', { className: 'mil-rank__track' }, bar),
      h('span', { className: 'mil-rank__val u-mono u-text-cyan' },
        `${type === 'rank-bi' ? '$' : ''}${item.v}${unit}`)));
  });
  fragment.appendChild(list);
  return fragment;
}

function renderList(data: readonly MilitaryListItem[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const grid = h('div', { className: 'mil-grid' });
  data.forEach((item) => grid.appendChild(
    h('div', { className: 'mil-card' },
      h('div', { className: 'mil-card__name' }, item.nome),
      h('p', { className: 'mil-card__desc' }, item.resumo))));
  fragment.appendChild(grid);
  return fragment;
}

function renderContent(category: MilitaryCategory): DocumentFragment {
  const fragment = document.createDocumentFragment();
  fragment.appendChild(h('h2', { className: 'mil-view__title' }, `${category.icon} ${category.titulo}`));

  if (category.tipo === 'cards') fragment.appendChild(renderCards(category.data));
  else if (category.tipo === 'battlespace') fragment.appendChild(renderBattlespace(category.data));
  else if (category.tipo === 'units') fragment.appendChild(renderUnits(category.data));
  else if (category.tipo === 'levels') fragment.appendChild(renderLevels(category.data));
  else if (category.tipo === 'eras') fragment.appendChild(renderEras(category.data));
  else if (category.tipo === 'rank-pct' || category.tipo === 'rank-bi') {
    fragment.appendChild(renderRanking(category.data, category.tipo));
  } else if (category.tipo === 'list') {
    fragment.appendChild(renderList(category.data));
  }
  return fragment;
}

function renderView(): void {
  const view = viewEl;
  if (!view) return;
  const fallback = MILITAR_CATEGORIAS[0];
  if (!fallback) return;
  empty(view);
  const category = MILITAR_CATEGORIAS.find((item) => item.id === state) ?? fallback;
  view.appendChild(renderContent(category));
  view.appendChild(h('p', { className: 'mil-fontes u-text-muted' }, `⚖ ${MILITAR_FONTES}`));
}

function renderNav(): void {
  const nav = navEl;
  if (!nav) return;
  empty(nav);
  MILITAR_CATEGORIAS.forEach((category) => nav.appendChild(
    h('button', {
      className: cx('mil-nav__item', state === category.id && 'is-active'),
      onclick: (): void => {
        state = category.id;
        storage.set(KEY, state);
        renderNav();
        renderView();
        viewEl?.scrollTo({ top: 0 });
      }
    },
      h('span', { className: 'mil-nav__icon' }, category.icon),
      h('span', null, category.titulo))));
}

export function enciclopediaMilitarPage(): HTMLDivElement {
  state = storage.get<string>(KEY) ?? MILITAR_CATEGORIAS[0]?.id ?? '';
  const page = h('div', { className: 'page-militar-enc' });
  page.appendChild(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
    h('div', { className: 'page-header__crumbs' },
      h('span', null, 'BALUARTE'), h('span', null, '›'),
      h('span', null, 'MILITAR'), h('span', null, '›'), h('span', null, 'ENCICLOPÉDIA')),
    h('h1', { className: 'page-header__title' }, '🎖 Enciclopédia Militar'),
    h('p', { className: 'page-header__description' },
      'Base de conhecimento da Seção Militar — ',
      h('span', { className: 'u-text-cyan' }, `${MILITAR_CATEGORIAS.length} categorias`),
      ': ramos, unidades, doutrina, táticas, gastos (SIPRI) e a evolução tecnológica.')));

  navEl = h('div', { className: 'mil-nav' });
  viewEl = h('div', { className: 'mil-view' });
  page.appendChild(h('div', { className: 'mil-layout' }, navEl, viewEl));
  renderNav();
  renderView();
  return page;
}
