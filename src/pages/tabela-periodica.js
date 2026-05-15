/**
 * Página /tabela-periodica — 118 elementos (Fase 17).
 */

import { h, cx, debounce, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { ELEMENTS, CATEGORIES_PT, TOTAL_ELEMENTS, findElement, electronConfig } from '../data/periodic.js';

const STORAGE_KEY = 'periodic:state';
let state = null;
let tableEl = null;
let detailEl = null;

function loadState() {
  return storage.get(STORAGE_KEY) || { selected: 1, filter: 'all' };
}
function persist() { storage.set(STORAGE_KEY, state); }

function gridPosition(e) {
  /* Define coluna e linha do grid 18x10 (incluindo 2 linhas para L/A) */
  if (e.group === 'L') return { col: e.z - 57 + 3, row: 9 };
  if (e.group === 'A') return { col: e.z - 89 + 3, row: 10 };
  return { col: e.group, row: e.period };
}

function renderTable() {
  if (!tableEl) return;
  empty(tableEl);

  /* Placeholders para gaps */
  for (let r = 1; r <= 10; r++) {
    for (let c = 1; c <= 18; c++) {
      const empty_cell = h('div', { className: 'periodic-cell periodic-cell--gap', style: `grid-row: ${r}; grid-column: ${c};` });
      tableEl.appendChild(empty_cell);
    }
  }

  ELEMENTS.forEach((e) => {
    const pos = gridPosition(e);
    const cat = CATEGORIES_PT[e.category] || CATEGORIES_PT.unknown;
    const isActive = e.z === state.selected;
    const dim = state.filter !== 'all' && state.filter !== e.category;
    const cell = h('button', {
      className: cx('periodic-cell', isActive && 'is-active', dim && 'is-dim'),
      style: `grid-row: ${pos.row}; grid-column: ${pos.col}; --el-color: ${cat.color};`,
      'data-z': e.z,
      title: `${e.name} (${e.symbol}) · Z=${e.z}`,
      onclick: () => {
        state.selected = e.z;
        persist();
        document.querySelectorAll('.periodic-cell').forEach((c) =>
          c.classList.toggle('is-active', c.dataset?.z === String(e.z))
        );
        renderDetail();
      }
    },
      h('div', { className: 'periodic-cell__z' }, e.z),
      h('div', { className: 'periodic-cell__sym' }, e.symbol),
      h('div', { className: 'periodic-cell__mass u-mono' }, e.mass.toString().slice(0, 5))
    );
    tableEl.appendChild(cell);
  });

  /* Marcadores L e A na coluna 3 das linhas 6 e 7 */
  const markerL = h('div', { className: 'periodic-cell periodic-cell--marker', style: 'grid-row: 6; grid-column: 3;' },
    h('div', { className: 'periodic-cell__sym' }, '57-71'));
  const markerA = h('div', { className: 'periodic-cell periodic-cell--marker', style: 'grid-row: 7; grid-column: 3;' },
    h('div', { className: 'periodic-cell__sym' }, '89-103'));
  tableEl.appendChild(markerL);
  tableEl.appendChild(markerA);
}

function renderDetail() {
  if (!detailEl) return;
  empty(detailEl);
  const e = findElement(state.selected);
  if (!e) return;
  const cat = CATEGORIES_PT[e.category];

  detailEl.appendChild(
    h('div', { className: 'pt-detail__head', style: `--el-color: ${cat.color};` },
      h('div', { className: 'pt-detail__symbol' }, e.symbol),
      h('div', null,
        h('div', { className: 'pt-detail__z u-mono u-text-muted' }, 'Z = ' + e.z),
        h('h2', { className: 'pt-detail__name' }, e.name),
        h('div', { className: 'pt-detail__cat' }, cat.label)
      )
    )
  );

  detailEl.appendChild(
    h('div', { className: 'pt-detail__stats' },
      h('div', { className: 'pt-stat' },
        h('span', { className: 'pt-stat__label' }, 'Massa atômica'),
        h('span', { className: 'pt-stat__value' }, e.mass + ' u')
      ),
      h('div', { className: 'pt-stat' },
        h('span', { className: 'pt-stat__label' }, 'Período'),
        h('span', { className: 'pt-stat__value' }, e.period)
      ),
      h('div', { className: 'pt-stat' },
        h('span', { className: 'pt-stat__label' }, 'Grupo'),
        h('span', { className: 'pt-stat__value' }, e.group)
      ),
      h('div', { className: 'pt-stat pt-stat--wide' },
        h('span', { className: 'pt-stat__label' }, 'Configuração eletrônica'),
        h('span', { className: 'pt-stat__value u-mono', style: 'font-size: 12px' }, electronConfig(e.z))
      )
    )
  );
}

export function tabelaPeriodicaPage() {
  state = loadState();
  const fullPage = h('div', { className: 'page-pt' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
        h('span', null, 'TABELA PERIÓDICA')),
      h('h1', { className: 'page-header__title' }, '⚛ Tabela Periódica'),
      h('p', { className: 'page-header__description' },
        h('span', { className: 'u-text-cyan' }, `${TOTAL_ELEMENTS} elementos`),
        ' com massa, configuração eletrônica e categoria. Filtre por categoria, clique pra ver detalhes.'
      )
    )
  );

  /* Filter chips */
  const chips = h('div', { className: 'pt-filters' });
  [{ id: 'all', label: 'Todos', color: '#93a4bf' }, ...Object.entries(CATEGORIES_PT).map(([id, v]) => ({ id, ...v }))].forEach((c) => {
    chips.appendChild(
      h('button', {
        className: cx('pt-filter', state.filter === c.id && 'is-active'),
        style: `--f-color: ${c.color};`,
        onclick: () => {
          state.filter = c.id;
          persist();
          document.querySelectorAll('.pt-filter').forEach((b) =>
            b.classList.toggle('is-active', b.textContent.trim() === c.label)
          );
          renderTable();
        }
      }, c.label)
    );
  });
  fullPage.appendChild(chips);

  tableEl = h('div', { className: 'pt-table' });
  detailEl = h('div', { className: 'pt-detail' });

  fullPage.appendChild(tableEl);
  fullPage.appendChild(detailEl);

  renderTable();
  renderDetail();

  return fullPage;
}
