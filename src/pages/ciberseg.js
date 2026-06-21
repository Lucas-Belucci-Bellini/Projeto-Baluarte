/**
 * Página /ciberseg — Enciclopédia de Cibersegurança (Fase 14).
 *
 * Catálogo de ataques + defesas + ferramentas com filtros e ficha.
 */

import '../styles/ciberseg.css';
import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { router } from '../core/router.js';
import { ENTRIES_CS, CATEGORIES_CS, TOTAL_CS } from '../data/ciberseg.js';

const STORAGE_KEY = 'ciberseg:state';

let state = null;
let listEl = null;
let detailEl = null;
let countEl = null;

function loadState() {
  return storage.get(STORAGE_KEY) || {
    activeCat: 'all',
    severity: 'all',
    search: '',
    selectedId: ENTRIES_CS[0].id
  };
}
function persist() { storage.set(STORAGE_KEY, state); }

function severityBadge(s) {
  const map = { 'crítico': 'danger', 'alto': 'magenta', 'médio': 'warning', 'baixo': 'cyan', 'info': 'success' };
  return map[s] || 'muted';
}

function applyFilters() {
  let pool = ENTRIES_CS;
  if (state.activeCat !== 'all') pool = pool.filter((e) => e.cat === state.activeCat);
  if (state.severity !== 'all') pool = pool.filter((e) => e.severity === state.severity);
  if (state.search) {
    const t = normalize(state.search);
    pool = pool.filter((e) =>
      normalize(e.title).includes(t) ||
      normalize(e.summary).includes(t) ||
      (e.tools || []).some((tool) => normalize(tool).includes(t))
    );
  }
  return pool;
}

function renderList() {
  if (!listEl) return;
  empty(listEl);
  const filtered = applyFilters();
  if (countEl) countEl.textContent = `${filtered.length} de ${TOTAL_CS}`;

  if (filtered.length === 0) {
    listEl.appendChild(h('div', { className: 'biblioteca-empty u-text-muted' }, 'Nenhum item'));
    return;
  }

  filtered.forEach((e) => {
    const cat = CATEGORIES_CS.find((c) => c.id === e.cat);
    const isActive = e.id === state.selectedId;
    listEl.appendChild(
      h('div', {
        className: cx('ciberseg-row', isActive && 'is-active'),
        'data-id': e.id,
        onclick: () => {
          state.selectedId = e.id;
          persist();
          document.querySelectorAll('.ciberseg-row').forEach((r) =>
            r.classList.toggle('is-active', r.dataset.id === e.id)
          );
          renderDetail();
        }
      },
        h('div', { className: 'ciberseg-row__icon', style: cat ? `color: ${cat.color}` : '' },
          cat ? cat.icon : '?'),
        h('div', { className: 'ciberseg-row__body' },
          h('div', { className: 'ciberseg-row__title' }, e.title),
          h('div', { className: 'ciberseg-row__cat u-text-muted u-mono' }, cat?.label || e.cat)
        ),
        h('span', { className: `badge badge--${severityBadge(e.severity)}` }, e.severity)
      )
    );
  });
}

function renderDetail() {
  if (!detailEl) return;
  empty(detailEl);
  const e = ENTRIES_CS.find((x) => x.id === state.selectedId);
  if (!e) {
    detailEl.appendChild(h('div', { className: 'biblioteca-empty u-text-muted' }, 'Selecione'));
    return;
  }
  const cat = CATEGORIES_CS.find((c) => c.id === e.cat);

  detailEl.appendChild(
    h('div', { className: 'ciberseg-detail__head' },
      h('div', { className: 'ciberseg-detail__icon', style: `color: ${cat?.color}; border-color: ${cat?.color}` }, cat?.icon),
      h('div', null,
        h('div', { className: 'ciberseg-detail__cat u-text-muted u-mono' }, cat?.label),
        h('h2', { className: 'ciberseg-detail__title' }, e.title)
      ),
      h('span', { className: `badge badge--${severityBadge(e.severity)}` }, e.severity.toUpperCase())
    )
  );

  detailEl.appendChild(
    h('div', { className: 'ciberseg-section' },
      h('div', { className: 'ciberseg-section__title' }, '◆ Descrição'),
      h('p', null, e.summary)
    )
  );

  if (e.tools?.length) {
    detailEl.appendChild(
      h('div', { className: 'ciberseg-section' },
        h('div', { className: 'ciberseg-section__title' }, '⌖ Ferramentas'),
        h('div', { className: 'ciberseg-tools' },
          ...e.tools.map((t) => h('code', { className: 'ciberseg-tool' }, t))
        )
      )
    );
  }

  if (e.counter) {
    detailEl.appendChild(
      h('div', { className: 'ciberseg-section ciberseg-section--counter' },
        h('div', { className: 'ciberseg-section__title' }, '◈ Defesa / mitigação'),
        h('p', null, e.counter)
      )
    );
  }

  detailEl.appendChild(
    h('button', {
      className: 'btn btn--ghost btn--sm',
      style: 'margin-top: 12px',
      onclick: () => router.navigate('/cripto')
    }, '⚿ ir para Lab de Cripto →')
  );
}

export function cibersegPage() {
  state = loadState();
  const fullPage = h('div', { className: 'page-ciberseg' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'CIBERSEG')),
      h('h1', { className: 'page-header__title' }, '⚿ CiberSeg — Ataque & Defesa'),
      h('p', { className: 'page-header__description' },
        h('span', { className: 'u-text-cyan' }, `${TOTAL_CS} entradas`),
        ` em ${CATEGORIES_CS.length} categorias: Recon, Exploit, Malware, Rede, Cripto, Defesa, OPSEC, Forense. `,
        'Cada item documenta vetor, ferramentas e mitigação.'
      )
    )
  );

  /* Filtros */
  const searchInput = h('input', {
    className: 'input input--search',
    type: 'search',
    placeholder: 'Buscar por título, descrição ou ferramenta…',
    value: state.search,
    oninput: debounce((e) => { state.search = e.target.value; persist(); renderList(); }, 120)
  });

  const sevSel = h('select', {
    className: 'input',
    onchange: (e) => { state.severity = e.target.value; persist(); renderList(); }
  },
    h('option', { value: 'all', selected: state.severity === 'all' }, 'Todas severidades'),
    ...['crítico', 'alto', 'médio', 'baixo', 'info'].map((s) =>
      h('option', { value: s, selected: state.severity === s }, s)
    )
  );

  countEl = h('span', { className: 'section-header__count' }, '');

  fullPage.appendChild(
    h('div', { className: 'elites-controls' },
      h('div', { style: { flex: 1, minWidth: '200px' } }, searchInput),
      sevSel,
      countEl
    )
  );

  /* Category chips */
  const cats = [{ id: 'all', label: 'Tudo', icon: '⬡' }, ...CATEGORIES_CS];
  const chipBar = h('div', { className: 'symbols-cats' });
  cats.forEach((c) => {
    chipBar.appendChild(
      h('button', {
        className: cx('symbols-cat', state.activeCat === c.id && 'is-active'),
        'data-c': c.id,
        onclick: () => {
          state.activeCat = c.id;
          persist();
          document.querySelectorAll('.symbols-cat').forEach((b) =>
            b.classList.toggle('is-active', b.dataset.c === c.id)
          );
          renderList();
        }
      },
        h('span', { className: 'symbols-cat__icon' }, c.icon),
        h('span', { className: 'symbols-cat__label' }, c.label)
      )
    );
  });
  fullPage.appendChild(chipBar);

  listEl = h('div', { className: 'ciberseg-list' });
  detailEl = h('div', { className: 'ciberseg-detail' });

  fullPage.appendChild(
    h('div', { className: 'ciberseg-grid' }, listEl, detailEl)
  );

  renderList();
  renderDetail();

  return fullPage;
}
