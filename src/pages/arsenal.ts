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

import '../styles/biblioteca.css';
import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { buildImmersiveHero } from '../utils/immersive.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast';
import {
  ARSENAL, CATEGORIES, EQUIPES, DOUTRINAS, TOTAL, search as searchArsenal
} from '../data/arsenal.js';
import type { ArsenalCategory, ArsenalWeapon } from '../data/arsenal.js';

const STORAGE_KEY = 'arsenal:state';
type MainView = 'catalog' | 'doutrinas';
interface ArsenalState {
  activeCat: string;
  activeEquipe: string;
  activeTier: string;
  search: string;
  selectedId: string;
}
interface WikipediaResponse {
  query?: { pages?: Record<string, { thumbnail?: { source?: string } }> };
}

let state: ArsenalState = {
  activeCat: 'all', activeEquipe: 'all', activeTier: 'all', search: '', selectedId: 'pistolas-1'
};
let resultsEl: HTMLDivElement | null = null;
let countEl: HTMLSpanElement | null = null;
let detailEl: HTMLDivElement | null = null;
let mainView: MainView = 'catalog';
let mainEl: HTMLDivElement | null = null;

function loadState(): ArsenalState {
  return storage.get(STORAGE_KEY) || {
    activeCat: 'all',
    activeEquipe: 'all',
    activeTier: 'all',
    search: '',
    selectedId: 'pistolas-1'
  };
}
function persist(): void { storage.set(STORAGE_KEY, state); }

/* ===== Helpers ===== */

function tierColor(tier: string): string {
  return ({ S: 'magenta', A: 'cyan', B: 'success', C: 'muted' } as Record<string, string>)[tier] || 'muted';
}

function fmt(v: unknown): string {
  if (v == null || v === '') return '—';
  return typeof v === 'number' ? v.toLocaleString('pt-BR') : String(v);
}

/* ===== Imagens via Wikipedia REST (grátis, CORS, sem chave) ===== */
const _imgCache = new Map<string, string | null>(); /* título -> url | null */

/** Busca a melhor página por texto e devolve a miniatura (pageimages). */
async function wikiSearchImage(lang: string, query: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query', format: 'json', origin: '*',
    prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '500',
    generator: 'search', gsrsearch: query, gsrlimit: '1', gsrnamespace: '0'
  });
  const r = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`, { signal: AbortSignal.timeout(6000) });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json() as WikipediaResponse;
  const pages = j?.query?.pages;
  if (!pages) return null;
  for (const k of Object.keys(pages)) {
    const src = pages[k]?.thumbnail?.source;
    if (src) return src;
  }
  return null;
}

/** Retorna a URL de uma imagem do item, tentando EN depois PT. */
async function fetchWeaponImage(w: ArsenalWeapon): Promise<string | null> {
  const query: string = w.wiki ?? w.name;
  if (_imgCache.has(query)) return _imgCache.get(query) ?? null;
  let src = null;
  for (const lang of ['en', 'pt']) {
    try { src = await wikiSearchImage(lang, query); if (src) break; } catch { /* tenta próximo */ }
  }
  _imgCache.set(query, src);
  return src;
}

/* ===== Filtros ===== */

function renderCategoryChips(): HTMLDivElement {
  const wrap = h('div', { className: 'arsenal-cats' });
  const all: Array<Pick<ArsenalCategory, 'id' | 'label' | 'icon'> & { color?: string; count: number }> = [
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
          document.querySelectorAll<HTMLElement>('.arsenal-cat').forEach((b) =>
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

function renderEquipeFilter(): HTMLSelectElement {
  const sel = h('select', {
    className: 'input',
    onchange: (e: Event) => {
      const target = e.currentTarget as HTMLSelectElement;
      state.activeEquipe = target.value;
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

function renderTierFilter(): HTMLSelectElement {
  const sel = h('select', {
    className: 'input',
    onchange: (e: Event) => {
      const target = e.currentTarget as HTMLSelectElement;
      state.activeTier = target.value;
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

function applyFilters(): ArsenalWeapon[] {
  let pool: ArsenalWeapon[] = [...ARSENAL];
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

function refresh(): void {
  const list = resultsEl;
  if (!list) return;
  const filtered = applyFilters();
  if (countEl) countEl.textContent = `${filtered.length} de ${TOTAL}`;
  empty(list);
  if (filtered.length === 0) {
    list.appendChild(
      h('div', { className: 'arsenal-empty u-text-muted' },
        h('div', { style: { fontSize: '48px', marginBottom: '8px' } }, '∅'),
        h('div', null, 'Nenhuma arma corresponde aos filtros')
      )
    );
    renderDetail(null);
    return;
  }
  filtered.forEach((w) => list.appendChild(renderRow(w)));
  /* Mantém seleção se ainda existe, senão seleciona o primeiro */
  if (!filtered.find((w) => w.id === state.selectedId)) {
    state.selectedId = filtered[0].id;
    persist();
  }
  renderDetail(ARSENAL.find((w) => w.id === state.selectedId) ?? null);
}

function renderRow(w: ArsenalWeapon): HTMLDivElement {
  const cat = CATEGORIES.find((c) => c.id === w.category);
  const isActive = w.id === state.selectedId;
  return h('div', {
    className: cx('arsenal-row', isActive && 'is-active'),
    'data-id': w.id,
    onclick: () => {
      state.selectedId = w.id;
      persist();
      document.querySelectorAll<HTMLElement>('.arsenal-row').forEach((r) =>
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

function renderDetail(w: ArsenalWeapon | null): void {
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

  /* Imagem do item (Wikipedia) — carrega assíncrono, oculta se não houver. */
  const imgWrap = h('div', { className: 'arsenal-detail__media is-loading' },
    h('span', { className: 'arsenal-detail__media-hint u-text-muted' }, '⟳ buscando imagem…'));
  detailEl.appendChild(imgWrap);
  const reqId = w.id;
  fetchWeaponImage(w).then((src) => {
    /* Evita aplicar imagem se o usuário já trocou de seleção. */
    if (state.selectedId !== reqId || !imgWrap.isConnected) return;
    empty(imgWrap);
    imgWrap.classList.remove('is-loading');
    if (src) {
      const img = h('img', {
        className: 'arsenal-detail__img', src, alt: w.name, loading: 'lazy',
        onerror: () => { imgWrap.style.display = 'none'; }
      });
      imgWrap.appendChild(img);
      imgWrap.appendChild(h('span', { className: 'arsenal-detail__credit u-text-muted' }, 'fonte: Wikipedia'));
    } else {
      imgWrap.style.display = 'none';
    }
  });

  /* Itens com `specs` próprias (aeronaves, naval, etc.) usam essa ficha;
     o armamento clássico mantém o grid padrão calibre/alcance/peso. */
  const stats: Array<readonly [string, unknown]> = Array.isArray(w.specs) && w.specs.length
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

function renderDoutrinas(): HTMLDivElement {
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

function renderMainView(): void {
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
      oninput: debounce((e: Event) => {
        const target = e.currentTarget as HTMLInputElement;
        state.search = target.value;
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

interface ArsenalPageArgs { query?: Readonly<Record<string, string>> | null }

export function arsenalPage(args: ArsenalPageArgs = {}): HTMLDivElement {
  state = loadState();

  const fullPage = h('div', { className: 'page-arsenal' });

  fullPage.appendChild(buildImmersiveHero({
    kicker: 'BALUARTE · ARSENAL',
    title: 'Arsenal',
    sub: 'CATÁLOGO MILITAR COMPLETO',
    variant: 'scope',
    desc: [
      h('span', { className: 'u-text-cyan' }, `${TOTAL} entradas`),
      ' — armas leves, artilharia, defesa aérea, aeronaves, frota naval, ',
      'drones e veículos em ',
      h('span', { className: 'u-text-cyan' }, `${CATEGORIES.length} categorias`),
      ', mais ',
      h('span', { className: 'u-text-cyan' }, `${DOUTRINAS.length} doutrinas`),
      ' táticas. Filtre por categoria, equipe (ALFA-SIERRA) e tier.'
    ],
    ctas: [
      { label: '◆ Elites', variant: 'primary', onClick: () => router.navigate('/elites') },
      { label: '▣ Dossiê das Forças', onClick: () => router.navigate('/dossie') }
    ],
    hudLeft: '⌖ CATÁLOGO · ARMADO',
    hudRight: `${TOTAL} ENTRADAS`,
    sceneKey: 'arsenal',
    query: args.query ?? null
  }));

  /* Tabs catalog/doutrinas */
  const tabs = h('div', { className: 'arsenal-tabs' });
  (['catalog', 'doutrinas'] as const).forEach((id) => {
    tabs.appendChild(
      h('button', {
        className: cx('arsenal-tab', mainView === id && 'is-active'),
        onclick: () => {
          mainView = id;
          document.querySelectorAll<HTMLElement>('.arsenal-tab').forEach((b) =>
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
