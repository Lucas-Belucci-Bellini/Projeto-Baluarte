/**
 * Página /universo — Hub de Universos (Fase 16).
 *
 * Universos catalogados: lore, personagens, conexões, link para arcos.
 */

import '../styles/universo.css';
import { h, cx, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { router } from '../core/router.js';
import { buildImmersiveHero } from '../utils/immersive.js';
import { UNIVERSOS, TOTAL_UNIVERSOS, findUniverso } from '../data/universos.js';
import { findArc } from '../data/cronicas.js';

const STORAGE_KEY = 'universo:state';

let state = null;
let cardsEl = null;
let detailEl = null;

function loadState() {
  return storage.get(STORAGE_KEY) || { selected: 'baluarte' };
}
function persist() { storage.set(STORAGE_KEY, state); }

function renderCards() {
  const wrap = h('div', { className: 'univ-cards' });
  UNIVERSOS.forEach((u) => {
    wrap.appendChild(
      h('button', {
        className: cx('univ-card', state.selected === u.id && 'is-active'),
        'data-u': u.id,
        style: `--u-color: ${u.color};`,
        onclick: () => {
          state.selected = u.id;
          persist();
          document.querySelectorAll('.univ-card').forEach((b) =>
            b.classList.toggle('is-active', b.dataset.u === u.id)
          );
          renderDetail();
        }
      },
        h('div', { className: 'univ-card__icon', style: `color: ${u.color};` }, u.icon),
        h('div', { className: 'univ-card__name' }, u.name),
        h('div', { className: 'univ-card__type u-mono' }, u.type === 'core' ? 'CORE' : 'CROSSOVER')
      )
    );
  });
  return wrap;
}

function openArc(arcId) {
  const arc = findArc(arcId);
  if (!arc) {
    router.navigate('/biblioteca');
    return;
  }
  const bibState = storage.get('biblioteca:state') || {};
  bibState.selectedArc = arcId;
  bibState.selectedChapter = arc.chapters[0]?.id;
  storage.set('biblioteca:state', bibState);
  router.navigate('/biblioteca');
}

function renderDetail() {
  if (!detailEl) return;
  empty(detailEl);
  const u = findUniverso(state.selected);
  if (!u) return;

  /* Header */
  detailEl.appendChild(
    h('div', { className: 'univ-detail__head', style: `--u-color: ${u.color};` },
      h('div', { className: 'univ-detail__icon', style: `color: ${u.color}; border-color: ${u.color};` }, u.icon),
      h('div', null,
        h('div', { className: 'univ-detail__type u-mono' },
          u.type === 'core' ? '◆ CORE BALUARTE' : '✦ CROSSOVER'),
        h('h2', { className: 'univ-detail__name' }, u.name),
        h('p', { className: 'univ-detail__tagline' }, u.tagline)
      )
    )
  );

  /* Summary */
  detailEl.appendChild(
    h('div', { className: 'univ-detail__summary' },
      h('p', null, u.summary)
    )
  );

  /* Grid de info */
  function section(title, items, color) {
    if (!items || !items.length) return null;
    return h('div', { className: 'univ-section', style: color ? `--s-color: ${color};` : '' },
      h('div', { className: 'univ-section__title' }, title),
      h('ul', { className: 'univ-list' },
        ...items.map((it) => h('li', null, it))
      )
    );
  }

  const grid = h('div', { className: 'univ-grid' });
  const sections = [
    section('◈ Pontos-chave', u.keyFacts, '#00f0ff'),
    section('◆ Facções', u.factions, '#00ff88'),
    section('⚠ Ameaças', u.threats, '#ff3355'),
    section('▶ Mídia / Referência', u.media, '#ff00aa')
  ].filter(Boolean);
  sections.forEach((s) => grid.appendChild(s));
  detailEl.appendChild(grid);

  /* Arcos linkados */
  if (u.arcs?.length) {
    const arcsWrap = h('div', { className: 'univ-arcs' },
      h('div', { className: 'univ-arcs__title' }, '◫ Arcos das Crônicas relacionados')
    );
    u.arcs.forEach((arcId) => {
      const arc = findArc(arcId);
      if (!arc) return;
      arcsWrap.appendChild(
        h('button', {
          className: 'univ-arc-link',
          onclick: () => openArc(arcId)
        },
          h('span', { className: 'univ-arc-link__code u-mono u-text-cyan' }, arc.code),
          h('span', { className: 'univ-arc-link__title' }, arc.title),
          h('span', { className: 'univ-arc-link__arrow' }, '→')
        )
      );
    });
    detailEl.appendChild(arcsWrap);
  }
}

export function universoPage(args) {
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
    query: args && args.query
  }));

  cardsEl = renderCards();
  detailEl = h('div', { className: 'univ-detail' });

  fullPage.appendChild(cardsEl);
  fullPage.appendChild(detailEl);

  renderDetail();

  return fullPage;
}
