/**
 * Página /modpack — Catálogo de mods Minecraft (Fase 17).
 */

import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { MODS, MOD_CATEGORIES, TOTAL_MODS } from '../data/modpack.js';

const STORAGE_KEY = 'modpack:state';
let state = null;
let listEl = null;
let countEl = null;

function loadState() {
  return storage.get(STORAGE_KEY) || { cat: 'all', tier: 'all', search: '' };
}
function persist() { storage.set(STORAGE_KEY, state); }

function applyFilters() {
  let pool = MODS;
  if (state.cat !== 'all') pool = pool.filter((m) => m.cat === state.cat);
  if (state.tier !== 'all') pool = pool.filter((m) => m.tier === state.tier);
  if (state.search) {
    const t = normalize(state.search);
    pool = pool.filter((m) =>
      normalize(m.name).includes(t) ||
      normalize(m.author).includes(t) ||
      normalize(m.desc).includes(t)
    );
  }
  return pool;
}

function tierColor(t) {
  return { S: 'magenta', A: 'cyan', B: 'success', C: 'muted' }[t] || 'muted';
}

function renderList() {
  if (!listEl) return;
  empty(listEl);
  const filtered = applyFilters();
  if (countEl) countEl.textContent = `${filtered.length} de ${TOTAL_MODS}`;

  if (!filtered.length) {
    listEl.appendChild(h('div', { className: 'media-empty u-text-muted' }, 'Nenhum mod encontrado'));
    return;
  }

  filtered.forEach((m) => {
    const cat = MOD_CATEGORIES.find((c) => c.id === m.cat);
    listEl.appendChild(
      h('div', { className: 'modpack-card', style: cat ? `--c-color: ${cat.color};` : '' },
        h('div', { className: 'modpack-card__head' },
          h('span', { className: `badge badge--${tierColor(m.tier)}` }, 'TIER ' + m.tier),
          h('span', { className: 'modpack-card__cat u-text-muted u-mono' }, cat?.label || m.cat)
        ),
        h('div', { className: 'modpack-card__name' }, m.name),
        h('div', { className: 'modpack-card__author u-text-muted u-mono' }, 'by ' + m.author),
        h('p', { className: 'modpack-card__desc' }, m.desc)
      )
    );
  });
}

export function modpackPage() {
  state = loadState();
  const fullPage = h('div', { className: 'page-modpack' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
        h('span', null, 'MODPACK MINECRAFT')),
      h('h1', { className: 'page-header__title' }, '◧ Modpack Minecraft'),
      h('p', { className: 'page-header__description' },
        h('span', { className: 'u-text-cyan' }, `${TOTAL_MODS} mods`),
        ' catalogados em ',
        h('span', { className: 'u-text-cyan' }, `${MOD_CATEGORIES.length} categorias`),
        ' (Tech, Magia, Exploração, Combate, Construção, Storage, World Gen, Performance, Utility). Tier S/A/B/C por popularidade.'
      )
    )
  );

  /* Controls */
  const searchInput = h('input', {
    className: 'input input--search',
    type: 'search',
    placeholder: 'Buscar mod por nome, autor ou descrição…',
    value: state.search,
    oninput: debounce((e) => { state.search = e.target.value; persist(); renderList(); }, 120)
  });

  const tierSel = h('select', {
    className: 'input',
    onchange: (e) => { state.tier = e.target.value; persist(); renderList(); }
  },
    h('option', { value: 'all', selected: state.tier === 'all' }, 'Todos os tiers'),
    h('option', { value: 'S', selected: state.tier === 'S' }, 'S · essencial'),
    h('option', { value: 'A', selected: state.tier === 'A' }, 'A · muito recomendado'),
    h('option', { value: 'B', selected: state.tier === 'B' }, 'B · situacional'),
    h('option', { value: 'C', selected: state.tier === 'C' }, 'C · niche')
  );

  countEl = h('span', { className: 'section-header__count' }, '');

  fullPage.appendChild(
    h('div', { className: 'elites-controls' },
      h('div', { style: { flex: 1, minWidth: '200px' } }, searchInput),
      tierSel,
      countEl
    )
  );

  /* Category chips */
  const chips = h('div', { className: 'symbols-cats' });
  const cats = [{ id: 'all', label: 'Tudo', icon: '⬡', color: '#93a4bf' }, ...MOD_CATEGORIES];
  cats.forEach((c) => {
    chips.appendChild(
      h('button', {
        className: cx('symbols-cat', state.cat === c.id && 'is-active'),
        onclick: () => {
          state.cat = c.id;
          persist();
          document.querySelectorAll('.symbols-cat').forEach((b) =>
            b.classList.toggle('is-active', b.textContent.trim().startsWith(c.label))
          );
          renderList();
        }
      },
        c.icon && h('span', { className: 'symbols-cat__icon' }, c.icon),
        h('span', { className: 'symbols-cat__label' }, c.label)
      )
    );
  });
  fullPage.appendChild(chips);

  listEl = h('div', { className: 'modpack-grid' });
  fullPage.appendChild(listEl);

  renderList();
  return fullPage;
}
