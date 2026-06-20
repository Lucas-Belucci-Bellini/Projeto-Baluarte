/**
 * Página /dossie — Dossiê das Forças do Baluarte.
 *
 * Renderiza o documento-fonte completo (a nave Infinity Dreadnought,
 * hierarquia, equipes, colossos, arsenal, frotas, Setor Gaia…), a partir
 * de src/data/dossie.json — gerado de um Google Doc e sincronizado a cada
 * 12h (scripts/sync-cronicas.mjs + scripts/gen-dossie-from-doc.mjs).
 *
 * Layout: sumário navegável (esquerda) + leitor da seção (direita).
 * Busca por título ou conteúdo. O JSON é grande: carrega sob demanda.
 */

import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { buildImmersiveHero } from '../utils/immersive.js';
import { storage } from '../core/storage.js';
import dossieUrl from '../data/dossie.json?url';

const STORAGE_KEY = 'dossie:state';

let state = null;
let data = null;
let status = 'loading'; /* loading | ok | error */
let listEl = null;
let viewerEl = null;
let countEl = null;

function loadState() {
  return storage.get(STORAGE_KEY) || { search: '', selectedId: null };
}
function persist() { storage.set(STORAGE_KEY, state); }

async function loadDossie() {
  try {
    const res = await fetch(dossieUrl);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    data = await res.json();
    status = 'ok';
    if (!findSection(state.selectedId) && data.sections[0]) state.selectedId = data.sections[0].id;
  } catch {
    status = 'error';
  }
}

function sections() { return (data && data.sections) || []; }
function findSection(id) { return sections().find((s) => s.id === id) || null; }

function matchesSearch(s, t) {
  if (!t) return true;
  if (normalize(s.title).includes(t)) return true;
  return s.blocks.some((b) => b.v && normalize(b.v).includes(t));
}

/* ===== Sumário ===== */

function renderList() {
  if (!listEl) return;
  empty(listEl);

  if (status === 'loading') {
    listEl.appendChild(h('div', { className: 'dossie-note u-text-muted' }, '⏳ Carregando o dossiê…'));
    return;
  }
  if (status === 'error') {
    listEl.appendChild(h('div', { className: 'dossie-note u-text-danger' },
      '⚠ Não consegui carregar o dossiê. Recarregue a página.'));
    return;
  }

  const t = normalize(state.search);
  const filtered = sections().filter((s) => matchesSearch(s, t));
  if (countEl) countEl.textContent = `${filtered.length} de ${sections().length}`;

  if (!filtered.length) {
    listEl.appendChild(h('div', { className: 'dossie-note u-text-muted' }, 'Nada encontrado.'));
    return;
  }

  filtered.forEach((s) => {
    listEl.appendChild(
      h('button', {
        className: cx('dossie-toc__item', state.selectedId === s.id && 'is-active'),
        onclick: () => {
          state.selectedId = s.id;
          persist();
          renderList();
          renderViewer();
          viewerEl?.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },
        h('span', { className: 'dossie-toc__bullet' }, s.level <= 1 ? '◆' : '▸'),
        h('span', null, s.title))
    );
  });
}

/* ===== Leitor ===== */

function blockNodes(blocks) {
  const frag = document.createDocumentFragment();
  let ul = null;
  const flushUl = () => { if (ul) { frag.appendChild(ul); ul = null; } };

  for (const b of blocks) {
    if (b.t === 'li') {
      if (!ul) ul = h('ul', { className: 'dossie-list' });
      ul.appendChild(h('li', null, b.v));
      continue;
    }
    flushUl();
    if (b.t === 'h') {
      const lvl = Math.min(Math.max(b.level || 3, 2), 4);
      frag.appendChild(h('div', { className: `dossie-h dossie-h--${lvl}` }, b.v));
    } else if (b.t === 'hr') {
      frag.appendChild(h('div', { className: 'dossie-hr' }));
    } else {
      frag.appendChild(h('p', { className: 'dossie-p' }, b.v));
    }
  }
  flushUl();
  return frag;
}

function renderViewer() {
  if (!viewerEl) return;
  empty(viewerEl);

  if (status !== 'ok') {
    viewerEl.appendChild(h('div', { className: 'dossie-note u-text-muted' },
      status === 'loading' ? 'Carregando…' : 'Dossiê indisponível.'));
    return;
  }

  const s = findSection(state.selectedId) || sections()[0];
  if (!s) return;

  viewerEl.appendChild(h('div', { className: 'dossie-viewer__head' },
    h('h2', { className: 'dossie-title' }, s.title)));
  viewerEl.appendChild(blockNodes(s.blocks));
}

/* ===== Página ===== */

export function dossiePage(args) {
  state = loadState();
  data = null;
  status = 'loading';

  const fullPage = h('div', { className: 'page-dossie' });

  fullPage.appendChild(buildImmersiveHero({
    kicker: 'BALUARTE · DOSSIÊ DAS FORÇAS',
    title: 'Dossiê das Forças',
    sub: 'INFINITY DREADNOUGHT',
    desc: [
      'Documento-fonte completo — a nave ',
      h('span', { className: 'u-text-cyan' }, 'Infinity Dreadnought'),
      ', hierarquia de comando, equipes, colossos, arsenal e frotas. ',
      'Sincronizado dos Google Docs a cada 12h.'
    ],
    ctas: [
      { label: '◆ Elites', variant: 'primary', onClick: () => router.navigate('/elites') },
      { label: '⌖ Arsenal', onClick: () => router.navigate('/arsenal') }
    ],
    hudLeft: '▣ DOCUMENTO-FONTE',
    hudRight: 'SYNC · 12H',
    query: args && args.query
  }));

  const searchInput = h('input', {
    className: 'input input--search', type: 'search',
    placeholder: 'Buscar no dossiê (seção ou conteúdo)…',
    value: state.search,
    oninput: debounce((e) => { state.search = e.target.value; persist(); renderList(); }, 140)
  });
  countEl = h('span', { className: 'section-header__count' }, '');
  fullPage.appendChild(
    h('div', { className: 'dossie-controls' },
      h('div', { style: { flex: '1', minWidth: '200px' } }, searchInput),
      countEl)
  );

  listEl = h('div', { className: 'dossie-toc' });
  viewerEl = h('div', { className: 'dossie-viewer' });
  fullPage.appendChild(h('div', { className: 'dossie-main' }, listEl, viewerEl));

  renderList();
  renderViewer();
  loadDossie().then(() => { renderList(); renderViewer(); });

  return fullPage;
}
