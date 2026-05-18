/**
 * Página /arsenal — Catálogo de armas, veículos e doutrinas (Fase 11).
 *
 * - Filtro por categoria
 * - Filtro por equipe (ALFA-SIERRA)
 * - Filtro por tier (S/A/B/C)
 * - Busca textual
 * - Painel de detalhes ao clicar
 * - Tab Doutrinas com 6 manuais táticos
 */

import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import {
  ARSENAL, CATEGORIES, EQUIPES, DOUTRINAS, TOTAL, search as searchArsenal
} from '../data/arsenal.js';

const STORAGE_KEY = 'arsenal:state';

let state = null;
let resultsEl = null;
let countEl = null;
let detailEl = null;
let mainView = 'catalog';
let mainEl = null;

function loadState() {
  return storage.get(STORAGE_KEY) || {
    activeCat: 'all',
    activeEquipe: 'all',
    activeTier: 'all',
    search: '',
    selectedId: 'pistolas-1'
  };
}
function persist() { storage.set(STORAGE_KEY, state); }

/* ===== Helpers ===== */

function tierColor(tier) {
  return { S: 'magenta', A: 'cyan', B: 'success', C: 'muted' }[tier] || 'muted';
}

function fmt(v) {
  if (v == null || v === '') return '—';
  return typeof v === 'number' ? v.toLocaleString('pt-BR') : v;
}

/* ===== Filtros ===== */

function renderCategoryChips() {
  const wrap = h('div', { className: 'arsenal-cats' });
  const all = [
    { id: 'all', label: 'Tudo', icon: '⬡', count: ARSENAL.length },
    ...CATEGORIES.map((c) => ({
      ...c,
      count: ARSENAL.filter((w) => w.category === c.id).length
    }))
  ];
  all.forEach((cat) => {
    wrap.appendChild(
      h('button', {
        className: cx('arsenal-cat', state.activeCat === cat.id && 'is-active'),
        'data-c': cat.id,
        style: state.activeCat === cat.id && cat.color ? `--cat-color: ${cat.color};` : '',
        onclick: () => {
          state.activeCat = cat.id;
          persist();
          document.querySelectorAll('.arsenal-cat').forEach((b) =>
            b.classList.toggle('is-active', b.dataset.c === cat.id)
          );
          refresh();
        }
      },
        h('span', { className: 'arsenal-cat__icon' }, cat.icon),
        h('span', { className: 'arsenal-cat__label' }, cat.label),
        h('span', { className: 'arsenal-cat__count' }, cat.count)
      )
    );
  });
  return wrap;
}

function renderEquipeFilter() {
  const sel = h('select', {
    className: 'input',
    onchange: (e) => {
      state.activeEquipe = e.target.value;
      persist();
      refresh();
    }
  },
    h('option', { value: 'all', selected: state.activeEquipe === 'all' }, 'Todas equipes'),
    ...EQUIPES.map((e) =>
      h('option', { value: e, selected: state.activeEquipe === e }, e)
    )
  );
  return sel;
}

function renderTierFilter() {
  const sel = h('select', {
    className: 'input',
    onchange: (e) => {
      state.activeTier = e.target.value;
      persist();
      refresh();
    }
  },
    h('option', { value: 'all', selected: state.activeTier === 'all' }, 'Todos tiers'),
    h('option', { value: 'S', selected: state.activeTier === 'S' }, 'S · Elite'),
    h('option', { value: 'A', selected: state.activeTier === 'A' }, 'A · Operacional'),
    h('option', { value: 'B', selected: state.activeTier === 'B' }, 'B · Secundário'),
    h('option', { value: 'C', selected: state.activeTier === 'C' }, 'C · Acervo')
  );
  return sel;
}

/* ===== Lista ===== */

function applyFilters() {
  let pool = ARSENAL;
  if (state.activeCat !== 'all') pool = pool.filter((w) => w.category === state.activeCat);
  if (state.activeEquipe !== 'all') pool = pool.filter((w) => w.equipe === state.activeEquipe);
  if (state.activeTier !== 'all') pool = pool.filter((w) => w.tier === state.activeTier);
  if (state.search) {
    const term = normalize(state.search);
    pool = pool.filter((w) =>
      normalize(w.name).includes(term) ||
      normalize(w.origin || '').includes(term) ||
      normalize(w.caliber || '').includes(term) ||
      normalize(w.notes || '').includes(term) ||
      normalize(w.equipe || '').includes(term)
    );
  }
  return pool;
}

function refresh() {
  if (!resultsEl) return;
  const filtered = applyFilters();
  if (countEl) countEl.textContent = `${filtered.length} de ${TOTAL}`;
  empty(resultsEl);
  if (filtered.length === 0) {
    resultsEl.appendChild(
      h('div', { className: 'arsenal-empty u-text-muted' },
        h('div', { style: { fontSize: '48px', marginBottom: '8px' } }, '∅'),
        h('div', null, 'Nenhuma arma corresponde aos filtros')
      )
    );
    renderDetail(null);
    return;
  }
  filtered.forEach((w) => resultsEl.appendChild(renderRow(w)));
  /* Mantém seleção se ainda existe, senão seleciona o primeiro */
  if (!filtered.find((w) => w.id === state.selectedId)) {
    state.selectedId = filtered[0].id;
    persist();
  }
  renderDetail(ARSENAL.find((w) => w.id === state.selectedId));
}

function renderRow(w) {
  const cat = CATEGORIES.find((c) => c.id === w.category);
  const isActive = w.id === state.selectedId;
  return h('div', {
    className: cx('arsenal-row', isActive && 'is-active'),
    'data-id': w.id,
    onclick: () => {
      state.selectedId = w.id;
      persist();
      document.querySelectorAll('.arsenal-row').forEach((r) =>
        r.classList.toggle('is-active', r.dataset.id === w.id)
      );
      renderDetail(w);
    }
  },
    h('div', { className: 'arsenal-row__icon', style: cat ? `color: ${cat.color}` : '' },
      cat ? cat.icon : '?'),
    h('div', { className: 'arsenal-row__body' },
      h('div', { className: 'arsenal-row__name' }, w.name),
      h('div', { className: 'arsenal-row__meta' },
        h('span', null, w.origin),
        h('span', null, '· '),
        h('span', null, w.caliber || '—'),
        w.year && h('span', null, ` · ${w.year}`)
      )
    ),
    h('div', { className: 'arsenal-row__side' },
      h('span', { className: `badge badge--${tierColor(w.tier)}` }, w.tier),
      h('span', { className: 'u-text-muted', style: { fontSize: '10px', fontFamily: 'var(--font-mono)' } }, w.equipe || '—')
    )
  );
}

/* ===== Painel de detalhes ===== */

function renderDetail(w) {
  if (!detailEl) return;
  empty(detailEl);
  if (!w) {
    detailEl.appendChild(
      h('div', { className: 'arsenal-detail__empty u-text-muted' },
        h('div', { style: { fontSize: '48px' } }, '⬢'),
        h('div', null, 'Selecione uma arma para ver detalhes')
      )
    );
    return;
  }
  const cat = CATEGORIES.find((c) => c.id === w.category);

  detailEl.appendChild(
    h('div', { className: 'arsenal-detail__head' },
      h('div', { className: 'arsenal-detail__icon', style: cat ? `color: ${cat.color}; border-color: ${cat.color}` : '' },
        cat ? cat.icon : '?'),
      h('div', { className: 'arsenal-detail__title' },
        h('div', { className: 'arsenal-detail__name' }, w.name),
        h('div', { className: 'arsenal-detail__crumbs u-text-muted' },
          cat?.label || w.category,
          w.subcat && ' · ' + w.subcat
        )
      ),
      h('div', { className: 'arsenal-detail__badges' },
        h('span', { className: `badge badge--${tierColor(w.tier)}` }, 'TIER ' + w.tier),
        h('span', { className: 'badge badge--magenta' }, w.equipe || '—')
      )
    )
  );

  /* Itens com `specs` próprias (aeronaves, naval, etc.) usam essa ficha;
     o armamento clássico mantém o grid padrão calibre/alcance/peso. */
  const stats = Array.isArray(w.specs) && w.specs.length
    ? [['Origem', w.origin], ['Ano', w.year], ...w.specs]
    : [
        ['Origem', w.origin],
        ['Ano', w.year],
        ['Calibre', w.caliber],
        ['Alcance efetivo', w.rangeM ? `${fmt(w.rangeM)} m` : '—'],
        ['Peso', w.weightKg ? `${w.weightKg} kg` : '—']
      ];

  detailEl.appendChild(
    h('div', { className: 'arsenal-detail__stats' },
      ...stats.map(([label, val]) =>
        h('div', { className: 'arsenal-stat' },
          h('span', { className: 'arsenal-stat__label' }, label),
          h('span', { className: 'arsenal-stat__value' }, fmt(val))
        )
      )
    )
  );

  detailEl.appendChild(
    h('div', { className: 'arsenal-detail__notes' },
      h('div', { className: 'arsenal-detail__notes-label' }, '◆ Notas operacionais'),
      h('p', null, w.notes || '(sem notas)')
    )
  );

  /* Botões */
  detailEl.appendChild(
    h('div', { className: 'arsenal-detail__actions' },
      h('button', {
        className: 'btn btn--ghost btn--sm',
        onclick: () => {
          const data = JSON.stringify(w, null, 2);
          navigator.clipboard.writeText(data);
          toast(`Ficha de ${w.name} copiada (JSON)`, { type: 'success' });
        }
      }, '⎘ exportar ficha JSON')
    )
  );
}

/* ===== Doutrinas ===== */

function renderDoutrinas() {
  const wrap = h('div', { className: 'doutrinas-grid' });
  DOUTRINAS.forEach((d) => {
    wrap.appendChild(
      h('div', { className: 'doutrina-card' },
        h('h3', { className: 'doutrina-card__title' }, d.title),
        h('p', { className: 'doutrina-card__summary u-text-muted' }, d.summary),
        h('ul', { className: 'doutrina-card__list' },
          ...d.items.map((it) => h('li', null, it))
        )
      )
    );
  });
  return wrap;
}

/* ===== Switch entre tabs ===== */

function renderMainView() {
  if (!mainEl) return;
  empty(mainEl);
  if (mainView === 'catalog') {
    /* Topo: search + filtros */
    const searchInput = h('input', {
      className: 'input input--search',
      type: 'search',
      placeholder: 'Buscar por nome, origem, calibre, equipe…',
      value: state.search,
      spellcheck: 'false',
      autocomplete: 'off',
      oninput: debounce((e) => {
        state.search = e.target.value;
        persist();
        refresh();
      }, 120)
    });

    mainEl.appendChild(h('div', { className: 'tool-search-wrap' }, searchInput));
    mainEl.appendChild(renderCategoryChips());

    const filterRow = h('div', { className: 'arsenal-filter-row' },
      h('label', { className: 'u-text-muted', style: { fontSize: '11px' } },
        'EQUIPE', renderEquipeFilter()),
      h('label', { className: 'u-text-muted', style: { fontSize: '11px' } },
        'TIER', renderTierFilter()),
      h('div', { style: { marginLeft: 'auto' } },
        countEl = h('span', { className: 'section-header__count' }, '')
      )
    );
    mainEl.appendChild(filterRow);

    /* Grid: lista + detalhe */
    resultsEl = h('div', { className: 'arsenal-list' });
    detailEl = h('div', { className: 'arsenal-detail' });
    mainEl.appendChild(
      h('div', { className: 'arsenal-grid' }, resultsEl, detailEl)
    );

    refresh();
  } else {
    /* Doutrinas */
    mainEl.appendChild(renderDoutrinas());
  }
}

/* ===== Page builder ===== */

export function arsenalPage() {
  state = loadState();

  const fullPage = h('div', { className: 'page-arsenal' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'ARSENAL')
      ),
      h('h1', { className: 'page-header__title' }, '⌖ Arsenal'),
      h('p', { className: 'page-header__description' },
        h('span', { className: 'u-text-cyan' }, `${TOTAL} entradas`),
        ' num catálogo militar completo — armas leves, artilharia, defesa aérea, ',
        'aeronaves, frota naval, drones e veículos em ',
        h('span', { className: 'u-text-cyan' }, `${CATEGORIES.length} categorias`),
        ', mais ',
        h('span', { className: 'u-text-cyan' }, `${DOUTRINAS.length} doutrinas`),
        ' táticas. Filtre por categoria, equipe (ALFA-SIERRA) e tier.'
      )
    )
  );

  /* Tabs catalog/doutrinas */
  const tabs = h('div', { className: 'arsenal-tabs' });
  ['catalog', 'doutrinas'].forEach((id) => {
    tabs.appendChild(
      h('button', {
        className: cx('arsenal-tab', mainView === id && 'is-active'),
        onclick: () => {
          mainView = id;
          document.querySelectorAll('.arsenal-tab').forEach((b) =>
            b.classList.toggle('is-active', b.dataset.v === id)
          );
          renderMainView();
        },
        'data-v': id
      }, id === 'catalog' ? '⌖ Catálogo' : '☷ Doutrinas')
    );
  });
  fullPage.appendChild(tabs);

  mainEl = h('div', { className: 'arsenal-main' });
  fullPage.appendChild(mainEl);

  renderMainView();

  return fullPage;
}
