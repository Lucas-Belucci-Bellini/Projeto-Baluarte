import '../styles/biblioteca.css';
import '../styles/dossie.css';
import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { router } from '../core/router.js';
import type { RouteArgs } from '../core/router.js';
import { buildImmersiveHero } from '../utils/immersive.js';
import { storage } from '../core/storage.js';
import dossieUrl from '../data/dossie.json?url';

const STORAGE_KEY = 'dossie:state';

type DossieStatus = 'loading' | 'ok' | 'error';

type DossieBlock =
  | { readonly t: 'h'; readonly level?: number; readonly v: string }
  | { readonly t: 'li'; readonly v: string }
  | { readonly t: 'hr'; readonly v?: string }
  | { readonly t?: string; readonly v: string };

interface DossieSection {
  readonly id: string;
  readonly title: string;
  readonly level: number;
  readonly blocks: readonly DossieBlock[];
}

interface DossieData {
  readonly sections: readonly DossieSection[];
}

interface DossieState {
  search: string;
  selectedId: string | null;
}

let state: DossieState = { search: '', selectedId: null };
let data: DossieData | null = null;
let status: DossieStatus = 'loading';
let listEl: HTMLDivElement | null = null;
let viewerEl: HTMLDivElement | null = null;
let countEl: HTMLSpanElement | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function parseBlock(value: unknown): DossieBlock | null {
  if (!isRecord(value) || !isString(value.v)) return null;
  if (value.t === 'h') {
    return {
      t: 'h',
      level: typeof value.level === 'number' ? value.level : undefined,
      v: value.v,
    };
  }
  if (value.t === 'li') return { t: 'li', v: value.v };
  if (value.t === 'hr') return { t: 'hr', v: value.v };
  return { t: typeof value.t === 'string' ? value.t : undefined, v: value.v };
}

function parseDossie(value: unknown): DossieData | null {
  if (!isRecord(value) || !Array.isArray(value.sections)) return null;
  const sections: DossieSection[] = [];
  for (const rawSection of value.sections) {
    if (!isRecord(rawSection) || !isString(rawSection.id) || !isString(rawSection.title)) continue;
    if (!Array.isArray(rawSection.blocks)) continue;
    const blocks = rawSection.blocks.map(parseBlock).filter((block): block is DossieBlock => block !== null);
    sections.push({
      id: rawSection.id,
      title: rawSection.title,
      level: typeof rawSection.level === 'number' ? rawSection.level : 2,
      blocks,
    });
  }
  return sections.length ? { sections } : null;
}

function loadState(): DossieState {
  const saved: unknown = storage.get(STORAGE_KEY);
  if (!isRecord(saved)) return { search: '', selectedId: null };
  return {
    search: isString(saved.search) ? saved.search : '',
    selectedId: isString(saved.selectedId) ? saved.selectedId : null,
  };
}

function persist(): void {
  storage.set(STORAGE_KEY, state);
}

async function loadDossie(): Promise<void> {
  try {
    const response = await fetch(dossieUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const parsed: unknown = await response.json();
    const nextData = parseDossie(parsed);
    if (!nextData) throw new Error('formato de dossiê inválido');
    data = nextData;
    status = 'ok';
    if (!findSection(state.selectedId) && data.sections[0]) {
      state.selectedId = data.sections[0].id;
    }
  } catch {
    status = 'error';
  }
}

function sections(): readonly DossieSection[] {
  return data?.sections ?? [];
}

function findSection(id: string | null): DossieSection | null {
  return sections().find((section) => section.id === id) ?? null;
}

function matchesSearch(section: DossieSection, term: string): boolean {
  if (!term) return true;
  if (normalize(section.title).includes(term)) return true;
  return section.blocks.some((block) => normalize(block.v).includes(term));
}

function renderList(): void {
  if (!listEl) return;
  empty(listEl);

  if (status === 'loading') {
    listEl.appendChild(h('div', { className: 'dossie-note u-text-muted' }, 'Carregando o dossiê…'));
    return;
  }
  if (status === 'error') {
    listEl.appendChild(h('div', { className: 'dossie-note u-text-danger' }, 'Não consegui carregar o dossiê. Recarregue a página.'));
    return;
  }

  const term = normalize(state.search);
  const filtered = sections().filter((section) => matchesSearch(section, term));
  if (countEl) countEl.textContent = `${filtered.length} de ${sections().length}`;

  if (!filtered.length) {
    listEl.appendChild(h('div', { className: 'dossie-note u-text-muted' }, 'Nada encontrado.'));
    return;
  }

  filtered.forEach((section) => {
    listEl?.appendChild(
      h('button', {
        className: cx('dossie-toc__item', state.selectedId === section.id && 'is-active'),
        onclick: () => {
          state.selectedId = section.id;
          persist();
          renderList();
          renderViewer();
          viewerEl?.scrollTo({ top: 0, behavior: 'smooth' });
        },
      },
        h('span', { className: 'dossie-toc__bullet' }, section.level <= 1 ? '◆' : '▸'),
        h('span', null, section.title),
      ),
    );
  });
}

function blockNodes(blocks: readonly DossieBlock[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  let list: HTMLUListElement | null = null;

  const flushList = (): void => {
    if (list) {
      fragment.appendChild(list);
      list = null;
    }
  };

  for (const block of blocks) {
    if (block.t === 'li') {
      if (!list) list = h('ul', { className: 'dossie-list' });
      list.appendChild(h('li', null, block.v));
      continue;
    }
    flushList();
    if (block.t === 'h') {
      const rawLevel = 'level' in block && typeof block.level === 'number' ? block.level : 3;
      const level = Math.min(Math.max(rawLevel, 2), 4);
      fragment.appendChild(h('div', { className: `dossie-h dossie-h--${level}` }, block.v));
    } else if (block.t === 'hr') {
      fragment.appendChild(h('div', { className: 'dossie-hr' }));
    } else {
      fragment.appendChild(h('p', { className: 'dossie-p' }, block.v));
    }
  }
  flushList();
  return fragment;
}

function renderViewer(): void {
  if (!viewerEl) return;
  empty(viewerEl);

  if (status !== 'ok') {
    viewerEl.appendChild(h('div', { className: 'dossie-note u-text-muted' }, status === 'loading' ? 'Carregando…' : 'Dossiê indisponível.'));
    return;
  }

  const section = findSection(state.selectedId) ?? sections()[0];
  if (!section) return;
  viewerEl.appendChild(h('div', { className: 'dossie-viewer__head' }, h('h2', { className: 'dossie-title' }, section.title)));
  viewerEl.appendChild(blockNodes(section.blocks));
}

export function dossiePage(args: RouteArgs): HTMLDivElement {
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
      'Sincronizado dos Google Docs a cada 12h.',
    ],
    ctas: [
      { label: '◆ Elites', variant: 'primary', onClick: () => router.navigate('/elites') },
      { label: '⌖ Arsenal', onClick: () => router.navigate('/arsenal') },
    ],
    hudLeft: '▣ DOCUMENTO-FONTE',
    hudRight: 'SYNC · 12H',
    query: args.query,
  }));

  const searchInput = h('input', {
    className: 'input input--search',
    type: 'search',
    placeholder: 'Buscar no dossiê (seção ou conteúdo)…',
    value: state.search,
    oninput: debounce((event: Event): void => {
      if (!(event.target instanceof HTMLInputElement)) return;
      state.search = event.target.value;
      persist();
      renderList();
    }, 140),
  });
  countEl = h('span', { className: 'section-header__count' }, '');
  fullPage.appendChild(h('div', { className: 'dossie-controls' }, h('div', { style: { flex: '1', minWidth: '200px' } }, searchInput), countEl));

  listEl = h('div', { className: 'dossie-toc' });
  viewerEl = h('div', { className: 'dossie-viewer' });
  fullPage.appendChild(h('div', { className: 'dossie-main' }, listEl, viewerEl));

  renderList();
  renderViewer();
  void loadDossie().then(() => {
    renderList();
    renderViewer();
  });

  return fullPage;
}
