/**
 * Página /modpack — Catálogo de mods Minecraft (Fase 17).
 */

import '../styles/biblioteca.css';
import '../styles/simbolos.css';
import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { MODS, MOD_CATEGORIES, TOTAL_MODS } from '../data/modpack.js';
import { ARMA3_PRESETS, ARMA3_TOTAL_MODS } from '../data/arma3-presets.js';

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

  /* ===== Central de MODPACKS (pedido do operador): todos os jogos numa
   * seção só — Minecraft (catálogo) + Arma 3 (presets), com o placar geral
   * e abas por jogo. Jogos novos = mais uma aba + data file. ===== */
  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
        h('span', null, 'CENTRAL DE MODPACKS')),
      h('h1', { className: 'page-header__title' }, '◧ Central de Modpacks'),
      h('p', { className: 'page-header__description' },
        'Todos os dados dos modpacks, todos os jogos: ',
        h('span', { className: 'u-text-cyan' }, `Minecraft — ${TOTAL_MODS} mods`),
        ` em ${MOD_CATEGORIES.length} categorias · `,
        h('span', { className: 'u-text-cyan' }, `Arma 3 — ${ARMA3_PRESETS.length} presets (${ARMA3_TOTAL_MODS} mods)`),
        ' prontos pra importar no Launcher.'
      )
    )
  );

  /* abas por jogo */
  const mcWrap = h('div', null);
  const a3Wrap = h('div', { style: 'display:none' });
  const abas = h('div', { className: 'symbols-cats', style: { marginBottom: '10px' } });
  const trocarAba = (jogo) => {
    mcWrap.style.display = jogo === 'mc' ? '' : 'none';
    a3Wrap.style.display = jogo === 'a3' ? '' : 'none';
    [...abas.children].forEach((b) => b.classList.toggle('is-active', b.dataset.jogo === jogo));
  };
  abas.append(
    h('button', { className: 'symbols-cat is-active', dataset: { jogo: 'mc' }, onclick: () => trocarAba('mc') },
      h('span', { className: 'symbols-cat__icon' }, '◧'), h('span', { className: 'symbols-cat__label' }, `Minecraft (${TOTAL_MODS})`)),
    h('button', { className: 'symbols-cat', dataset: { jogo: 'a3' }, onclick: () => trocarAba('a3') },
      h('span', { className: 'symbols-cat__icon' }, '🪖'), h('span', { className: 'symbols-cat__label' }, `Arma 3 (${ARMA3_TOTAL_MODS})`)));
  fullPage.appendChild(abas);
  fullPage.appendChild(mcWrap);
  fullPage.appendChild(a3Wrap);

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

  mcWrap.appendChild(
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
          chips.querySelectorAll('.symbols-cat').forEach((b) =>
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
  mcWrap.appendChild(chips);

  listEl = h('div', { className: 'modpack-grid' });
  mcWrap.appendChild(listEl);

  renderList();
  if (/[?&]jogo=arma3/.test(window.location.hash)) trocarAba('a3');

  /* ===== Presets ARMA 3 (uploads do operador) =====
   * Cada card baixa o preset oficial do Arma 3 Launcher (arrastar o arquivo
   * na janela do Launcher importa tudo) e expande a lista de mods com os
   * links do Steam Workshop. */
  a3Wrap.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { margin: '4px 0 12px' } },
      h('h2', { className: 'page-header__title', style: { fontSize: '1.6em' } }, '🪖 Presets Arma 3'),
      h('p', { className: 'page-header__description' },
        h('span', { className: 'u-text-cyan' }, `${ARMA3_PRESETS.length} presets`),
        ' do operador com ',
        h('span', { className: 'u-text-cyan' }, `${ARMA3_TOTAL_MODS} mods`),
        ' no total (CBA, ACE, RHS, CUP…). Baixe o preset e ARRASTE o arquivo na janela do Arma 3 Launcher — ele importa e assina tudo sozinho.')));

  const presetsGrid = h('div', { className: 'modpack-grid' });
  ARMA3_PRESETS.forEach((p) => {
    const lista = h('div', { className: 'a3-mods', style: 'display:none' },
      ...p.mods.map((m) => h('div', { className: 'a3-mod' },
        h('a', { href: m.url, target: '_blank', rel: 'noopener noreferrer' }, m.nome))),
      p.dlcs.length ? h('div', { className: 'a3-mod u-text-muted' }, 'DLCs: ' + p.dlcs.map((d) => d.nome).join(' · ')) : null);
    const toggle = h('button', { className: 'btn', onclick: () => {
      const aberto = lista.style.display !== 'none';
      lista.style.display = aberto ? 'none' : 'block';
      toggle.textContent = aberto ? `▸ ver os ${p.mods.length} mods` : '▾ esconder mods';
    } }, `▸ ver os ${p.mods.length} mods`);
    presetsGrid.appendChild(
      h('div', { className: 'modpack-card' },
        h('div', { className: 'modpack-card__head' },
          h('span', { className: 'badge badge--cyan' }, 'ARMA 3'),
          h('span', { className: 'modpack-card__cat u-text-muted u-mono' }, `${p.mods.length} mods · ${p.dlcs.length} DLCs`)),
        h('div', { className: 'modpack-card__name' }, p.nome),
        h('div', { style: 'display:flex; gap:8px; margin:10px 0; flex-wrap:wrap' },
          h('a', { className: 'btn btn--primary', href: p.arquivo, download: '' }, '⬇ Baixar preset'),
          toggle),
        lista));
  });
  a3Wrap.appendChild(presetsGrid);

  return fullPage;
}
