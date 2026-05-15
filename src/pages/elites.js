/**
 * Página /elites — 26 equipes ALFA-ZULU (Fase 13).
 *
 * - Grid de cards de equipes
 * - Filtros por status e especialidade
 * - Busca textual
 * - Painel de ficha detalhada
 */

import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { router } from '../core/router.js';
import { EQUIPES, STATUS_OPTIONS, SPECIALTIES, TOTAL_EQUIPES, ACTIVE_COUNT, findEquipe, statusInfo } from '../data/elites.js';
import { findArc } from '../data/cronicas.js';

const STORAGE_KEY = 'elites:state';

let state = null;
let gridEl = null;
let detailEl = null;
let countEl = null;

function loadState() {
  return storage.get(STORAGE_KEY) || {
    activeStatus: 'all',
    activeSpec: 'all',
    search: '',
    selectedCode: 'ALFA'
  };
}
function persist() { storage.set(STORAGE_KEY, state); }

function applyFilters() {
  let pool = EQUIPES;
  if (state.activeStatus !== 'all') pool = pool.filter((e) => e.status === state.activeStatus);
  if (state.activeSpec !== 'all') pool = pool.filter((e) => e.specialty === state.activeSpec);
  if (state.search) {
    const t = normalize(state.search);
    pool = pool.filter((e) =>
      normalize(e.code).includes(t) ||
      normalize(e.name).includes(t) ||
      normalize(e.specialty).includes(t) ||
      normalize(e.leader).includes(t) ||
      normalize(e.motto).includes(t) ||
      normalize(e.description).includes(t)
    );
  }
  return pool;
}

function renderGrid() {
  if (!gridEl) return;
  empty(gridEl);
  const filtered = applyFilters();
  if (countEl) countEl.textContent = `${filtered.length} de ${TOTAL_EQUIPES}`;

  if (filtered.length === 0) {
    gridEl.appendChild(
      h('div', { className: 'elites-empty u-text-muted' },
        h('div', { style: { fontSize: '48px' } }, '◇'),
        h('div', null, 'Nenhuma equipe corresponde aos filtros')
      )
    );
    return;
  }

  filtered.forEach((e) => {
    const sInfo = statusInfo(e.status);
    const isActive = e.code === state.selectedCode;
    const card = h('div', {
      className: cx('elite-card', isActive && 'is-active'),
      'data-c': e.code,
      style: `--elite-color: ${e.color};`,
      onclick: () => {
        state.selectedCode = e.code;
        persist();
        document.querySelectorAll('.elite-card').forEach((c) =>
          c.classList.toggle('is-active', c.dataset.c === e.code)
        );
        renderDetail();
      }
    },
      h('div', { className: 'elite-card__head' },
        h('div', { className: 'elite-card__cover', style: `color: ${e.color}; border-color: ${e.color};` }, e.cover),
        h('div', { className: 'elite-card__title' },
          h('div', { className: 'elite-card__code' }, e.code),
          h('div', { className: 'elite-card__name' }, e.name)
        ),
        h('span', { className: `badge badge--${sInfo.color}` }, sInfo.label)
      ),
      h('div', { className: 'elite-card__spec' }, e.specialty),
      h('div', { className: 'elite-card__motto' }, '"', e.motto, '"'),
      h('div', { className: 'elite-card__meta' },
        h('span', null, `${e.members} membro${e.members > 1 ? 's' : ''}`),
        h('span', null, '· '),
        h('span', null, `formada ${e.formed}`)
      )
    );
    gridEl.appendChild(card);
  });
}

function renderDetail() {
  if (!detailEl) return;
  empty(detailEl);
  const e = findEquipe(state.selectedCode);
  if (!e) {
    detailEl.appendChild(
      h('div', { className: 'elites-empty u-text-muted' }, 'Selecione uma equipe')
    );
    return;
  }
  const sInfo = statusInfo(e.status);

  detailEl.appendChild(
    h('div', { className: 'elite-detail__head', style: `--elite-color: ${e.color};` },
      h('div', { className: 'elite-detail__cover' }, e.cover),
      h('div', { className: 'elite-detail__title' },
        h('div', { className: 'elite-detail__code' }, e.code),
        h('h2', { className: 'elite-detail__name' }, e.name),
        h('div', { className: 'elite-detail__spec' }, e.specialty)
      ),
      h('span', { className: `badge badge--${sInfo.color}` }, sInfo.label.toUpperCase())
    )
  );

  detailEl.appendChild(
    h('div', { className: 'elite-detail__motto' }, '"', e.motto, '"')
  );

  detailEl.appendChild(
    h('div', { className: 'elite-detail__stats' },
      h('div', { className: 'elite-stat' },
        h('span', { className: 'elite-stat__label' }, 'Líder'),
        h('span', { className: 'elite-stat__value' }, e.leader)
      ),
      h('div', { className: 'elite-stat' },
        h('span', { className: 'elite-stat__label' }, 'Membros'),
        h('span', { className: 'elite-stat__value' }, e.members)
      ),
      h('div', { className: 'elite-stat' },
        h('span', { className: 'elite-stat__label' }, 'Formada em'),
        h('span', { className: 'elite-stat__value' }, e.formed)
      ),
      h('div', { className: 'elite-stat elite-stat--wide' },
        h('span', { className: 'elite-stat__label' }, 'Base'),
        h('span', { className: 'elite-stat__value' }, e.base)
      )
    )
  );

  detailEl.appendChild(
    h('div', { className: 'elite-detail__section' },
      h('div', { className: 'elite-detail__section-title' }, '◆ Descrição'),
      h('p', null, e.description)
    )
  );

  detailEl.appendChild(
    h('div', { className: 'elite-detail__section' },
      h('div', { className: 'elite-detail__section-title' }, '⌖ Equipamento típico'),
      h('ul', { className: 'elite-detail__list' },
        ...e.equipment.map((it) => h('li', null, it))
      )
    )
  );

  detailEl.appendChild(
    h('div', { className: 'elite-detail__section' },
      h('div', { className: 'elite-detail__section-title' }, '◫ Operações notáveis'),
      h('ul', { className: 'elite-detail__list' },
        ...e.notableOps.map((op) => h('li', null, op))
      )
    )
  );

  if (e.arc) {
    const targetArc = findArc(e.arc);
    detailEl.appendChild(
      h('button', {
        className: 'btn btn--primary btn--sm',
        style: 'margin-top: 12px',
        onclick: () => {
          /* Pré-seleciona o arco na Biblioteca antes de navegar */
          const bibState = storage.get('biblioteca:state') || {};
          bibState.selectedArc = e.arc;
          if (targetArc?.chapters?.[0]) {
            bibState.selectedChapter = targetArc.chapters[0].id;
          }
          storage.set('biblioteca:state', bibState);
          router.navigate('/biblioteca');
        }
      }, `◫ Ler ${targetArc ? targetArc.title : 'arco'} na Biblioteca →`)
    );
  }
}

export function elitesPage() {
  state = loadState();

  const fullPage = h('div', { className: 'page-elites' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'ELITES')
      ),
      h('h1', { className: 'page-header__title' }, '◆ Elites do Baluarte'),
      h('p', { className: 'page-header__description' },
        h('span', { className: 'u-text-cyan' }, `${TOTAL_EQUIPES} equipes`),
        ' catalogadas (ALFA → ZULU), ',
        h('span', { className: 'u-text-cyan' }, `${ACTIVE_COUNT} operacionais`),
        '. Filtre por status, especialidade ou busque por nome/líder/lema.'
      )
    )
  );

  /* Filtros */
  const searchInput = h('input', {
    className: 'input input--search',
    type: 'search',
    placeholder: 'Buscar por código, nome, especialidade, líder, lema…',
    value: state.search,
    oninput: debounce((e) => {
      state.search = e.target.value;
      persist();
      renderGrid();
    }, 120)
  });

  const statusSel = h('select', {
    className: 'input',
    onchange: (e) => { state.activeStatus = e.target.value; persist(); renderGrid(); }
  },
    h('option', { value: 'all', selected: state.activeStatus === 'all' }, 'Todos status'),
    ...STATUS_OPTIONS.map((s) =>
      h('option', { value: s.id, selected: state.activeStatus === s.id }, s.label)
    )
  );

  const specSel = h('select', {
    className: 'input',
    onchange: (e) => { state.activeSpec = e.target.value; persist(); renderGrid(); }
  },
    h('option', { value: 'all', selected: state.activeSpec === 'all' }, 'Todas especialidades'),
    ...SPECIALTIES.map((sp) =>
      h('option', { value: sp, selected: state.activeSpec === sp }, sp)
    )
  );

  countEl = h('span', { className: 'section-header__count' }, '');

  fullPage.appendChild(
    h('div', { className: 'elites-controls' },
      h('div', { style: { flex: 1, minWidth: '200px' } }, searchInput),
      statusSel,
      specSel,
      countEl
    )
  );

  gridEl = h('div', { className: 'elites-grid' });
  detailEl = h('div', { className: 'elite-detail' });

  fullPage.appendChild(
    h('div', { className: 'elites-main' }, gridEl, detailEl)
  );

  renderGrid();
  renderDetail();

  return fullPage;
}
