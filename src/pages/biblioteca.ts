import '../styles/biblioteca.css';
import '../styles/graficos.css';
import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast';
import { router } from '../core/router.js';
import type { RouteArgs } from '../core/router.js';
import { buildImmersiveHero } from '../utils/immersive.js';
import { ARCS, UNIVERSES, loadSaga } from '../data/cronicas.js';
import type { CronicaArc, CronicaChapter } from '../data/cronicas.js';

const STORAGE_KEY = 'biblioteca:state';
const SAGA_UNIVERSE = 'Onde os Deuses Sangram';

type SagaStatus = 'loading' | 'ok' | 'error';
type ReaderTheme = 'dark' | 'sepia';

interface ReadingProgress {
  readonly lastChapter: string;
  readonly lastVisit: number;
}

interface BibliotecaState {
  search: string;
  universe: string;
  onlyBookmarked: boolean;
  selectedArc: string | null;
  selectedChapter: string | null;
  fontSize: number;
  theme: ReaderTheme;
  bookmarks: string[];
  progress: Record<string, ReadingProgress>;
}

let state: BibliotecaState = {
  search: '', universe: 'all', onlyBookmarked: false, selectedArc: null, selectedChapter: null,
  fontSize: 16, theme: 'dark', bookmarks: [], progress: {},
};
let listEl: HTMLDivElement | null = null;
let viewerEl: HTMLDivElement | null = null;
let searchInput: HTMLInputElement | null = null;
let univSelect: HTMLSelectElement | null = null;
let sagaCountEl: HTMLSpanElement | null = null;
let sagaArcos: readonly CronicaArc[] = [];
let sagaStatus: SagaStatus = 'loading';
let keyNavBound = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isTheme(value: unknown): value is ReaderTheme {
  return value === 'dark' || value === 'sepia';
}

function loadState(): BibliotecaState {
  const saved: unknown = storage.get(STORAGE_KEY);
  if (!isRecord(saved)) return { ...state, bookmarks: [], progress: {} };
  const rawProgress = isRecord(saved.progress) ? saved.progress : {};
  const progress: Record<string, ReadingProgress> = {};
  Object.entries(rawProgress).forEach(([arcId, value]) => {
    if (!isRecord(value) || typeof value.lastChapter !== 'string' || typeof value.lastVisit !== 'number') return;
    progress[arcId] = { lastChapter: value.lastChapter, lastVisit: value.lastVisit };
  });
  return {
    search: typeof saved.search === 'string' ? saved.search : '',
    universe: typeof saved.universe === 'string' ? saved.universe : 'all',
    onlyBookmarked: saved.onlyBookmarked === true,
    selectedArc: typeof saved.selectedArc === 'string' ? saved.selectedArc : null,
    selectedChapter: typeof saved.selectedChapter === 'string' ? saved.selectedChapter : null,
    fontSize: typeof saved.fontSize === 'number' && Number.isFinite(saved.fontSize) ? saved.fontSize : 16,
    theme: isTheme(saved.theme) ? saved.theme : 'dark',
    bookmarks: Array.isArray(saved.bookmarks) ? saved.bookmarks.filter((item): item is string => typeof item === 'string') : [],
    progress,
  };
}

function persist(): void {
  storage.set(STORAGE_KEY, state);
}

function allArcs(): readonly CronicaArc[] {
  return [...sagaArcos, ...ARCS];
}

function findArc(id: string | null): CronicaArc | null {
  return allArcs().find((arc) => arc.id === id) ?? null;
}

function applyFilters(): readonly CronicaArc[] {
  let pool = [...allArcs()];
  if (state.universe !== 'all') pool = pool.filter((arc) => arc.universe === state.universe);
  if (state.onlyBookmarked) pool = pool.filter((arc) => state.bookmarks.includes(arc.id));
  if (state.search) {
    const term = normalize(state.search);
    pool = pool.filter((arc) => normalize(arc.title).includes(term)
      || normalize(arc.code).includes(term)
      || normalize(arc.synopsis).includes(term)
      || arc.tags.some((tag) => normalize(tag).includes(term)));
  }
  return pool;
}

function statusBanner(): HTMLDivElement {
  if (sagaStatus === 'loading') {
    return h('div', { className: 'biblioteca-resume' },
      h('div', { className: 'biblioteca-resume__label' }, 'Carregando a saga'),
      h('div', { className: 'biblioteca-resume__chap' }, 'Onde os Deuses Sangram — 24 arcos. Pode levar um instante.'));
  }
  return h('div', { className: 'biblioteca-resume' },
    h('div', { className: 'biblioteca-resume__label u-text-danger' }, 'A saga não carregou'),
    h('div', { className: 'biblioteca-resume__chap' }, 'Verifique a conexão e recarregue. Os arcos de cenário seguem disponíveis abaixo.'));
}

function openChapter(arcId: string, chapterId: string): void {
  state.selectedArc = arcId;
  state.selectedChapter = chapterId;
  state.progress[arcId] = { lastChapter: chapterId, lastVisit: Date.now() };
  persist();
  renderViewer();
  document.querySelectorAll<HTMLElement>('.arc-card').forEach((card) => card.classList.toggle('is-active', card.dataset.id === arcId));
  document.querySelector<HTMLElement>('.main__inner')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function gotoAdjacentChapter(direction: -1 | 1): void {
  const arc = findArc(state.selectedArc);
  if (!arc) return;
  const index = arc.chapters.findIndex((chapter) => chapter.id === state.selectedChapter);
  const target = index + direction;
  if (target >= 0 && target < arc.chapters.length) {
    openChapter(arc.id, arc.chapters[target].id);
    return;
  }
  const arcs = allArcs();
  const arcIndex = arcs.findIndex((candidate) => candidate.id === arc.id);
  const adjacentArc = arcs[arcIndex + direction];
  if (adjacentArc?.chapters.length) {
    const chapter = direction > 0 ? adjacentArc.chapters[0] : adjacentArc.chapters[adjacentArc.chapters.length - 1];
    openChapter(adjacentArc.id, chapter.id);
    renderList();
  }
}

function renderList(): void {
  if (!listEl) return;
  empty(listEl);
  if (sagaStatus !== 'ok') listEl.appendChild(statusBanner());
  const filtered = applyFilters();
  if (!filtered.length) {
    listEl.appendChild(h('div', { className: 'biblioteca-empty u-text-muted' }, h('div', { style: { fontSize: '48px' } }, '◫'), h('div', null, 'Nenhum arco encontrado')));
    return;
  }

  const last = findArc(state.selectedArc);
  const lastProgress = state.selectedArc ? state.progress[state.selectedArc] : undefined;
  if (last && lastProgress) {
    const chapter = last.chapters.find((candidate) => candidate.id === lastProgress.lastChapter);
    if (chapter) listEl.appendChild(h('div', { className: 'biblioteca-resume' },
      h('div', { className: 'biblioteca-resume__label' }, 'Retomar leitura'),
      h('div', { className: 'biblioteca-resume__arc' }, `${last.code} — ${last.title}`),
      h('div', { className: 'biblioteca-resume__chap' }, chapter.title),
      h('button', { className: 'btn btn--primary btn--sm', onclick: (): void => openChapter(last.id, chapter.id) }, 'Continuar')));
  }

  filtered.forEach((arc) => {
    const isActive = arc.id === state.selectedArc;
    const isBookmarked = state.bookmarks.includes(arc.id);
    const progress = state.progress[arc.id];
    listEl?.appendChild(h('div', {
      className: cx('arc-card', isActive && 'is-active'),
      'data-id': arc.id,
      onclick: (): void => {
        state.selectedArc = arc.id;
        state.selectedChapter = arc.chapters[0]?.id ?? null;
        persist();
        document.querySelectorAll<HTMLElement>('.arc-card').forEach((card) => card.classList.toggle('is-active', card.dataset.id === arc.id));
        renderViewer();
      },
    },
      h('div', { className: 'arc-card__cover' }, arc.cover),
      h('div', { className: 'arc-card__body' },
        h('div', { className: 'arc-card__head' },
          h('span', { className: cx('arc-card__code', arc.canonical && 'arc-card__code--saga') }, arc.code),
          h('span', { className: 'arc-card__univ' }, arc.universe),
          arc.canonical && h('span', { className: 'arc-card__canon' }, '◆ FAN FIC'),
          isBookmarked && h('span', { className: 'arc-card__bookmark' }, '★')),
        h('div', { className: 'arc-card__title' }, arc.title),
        h('div', { className: 'arc-card__synopsis' }, arc.synopsis),
        h('div', { className: 'arc-card__meta' }, h('span', null, `${arc.chapters.length} cap.`), progress && h('span', { className: 'u-text-cyan' }, '· progredindo')))));
  });
}

function renderViewer(): void {
  if (!viewerEl) return;
  empty(viewerEl);
  const arc = findArc(state.selectedArc);
  if (!arc) {
    viewerEl.appendChild(h('div', { className: 'biblioteca-empty u-text-muted' }, h('div', { style: { fontSize: '64px' } }, '◫'), h('div', null, sagaStatus === 'loading' ? 'Carregando a saga das Crônicas…' : 'Selecione um arco para começar a ler.')));
    return;
  }
  const chapter: CronicaChapter | undefined = arc.chapters.find((candidate) => candidate.id === state.selectedChapter) ?? arc.chapters[0];
  if (!chapter) {
    viewerEl.appendChild(h('div', { className: 'biblioteca-empty u-text-muted' }, 'Este arco ainda não tem capítulos.'));
    return;
  }
  state.progress[arc.id] = { lastChapter: chapter.id, lastVisit: Date.now() };
  persist();
  const isBookmarked = state.bookmarks.includes(arc.id);
  const tools = h('div', { className: 'viewer-tools' },
    h('button', { className: cx('btn btn--ghost btn--sm', isBookmarked && 'is-on'), onclick: (): void => {
      if (isBookmarked) { state.bookmarks = state.bookmarks.filter((bookmark) => bookmark !== arc.id); toast('Removido dos favoritos', { type: 'info' }); }
      else { state.bookmarks.push(arc.id); toast('Adicionado aos favoritos', { type: 'success' }); }
      persist(); renderList(); renderViewer();
    } }, isBookmarked ? '★ favorito' : '☆ favoritar'),
    h('button', { className: cx('btn btn--ghost btn--sm', state.theme === 'sepia' && 'is-on'), onclick: (): void => { state.theme = state.theme === 'sepia' ? 'dark' : 'sepia'; persist(); renderViewer(); } }, state.theme === 'sepia' ? '◐ tema sépia' : '◑ tema dark'),
    h('div', { className: 'viewer-tools__fontsize' },
      h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'A'),
      h('input', { type: 'range', min: '13', max: '22', step: '1', value: state.fontSize, 'aria-label': 'Tamanho da letra na leitura', oninput: (event: Event): void => {
        if (!(event.target instanceof HTMLInputElement)) return;
        state.fontSize = Number.parseInt(event.target.value, 10); persist();
        const body = document.querySelector<HTMLElement>('.chapter-body'); if (body) body.style.fontSize = `${state.fontSize}px`;
      } }),
      h('span', { className: 'u-text-muted', style: { fontSize: '17px' } }, 'A')));

  const header = h('div', { className: 'viewer-header' },
    h('div', { className: 'viewer-header__cover' }, arc.cover),
    h('div', null,
      h('div', { className: 'viewer-header__code' }, `${arc.code} · ${arc.universe}`),
      h('h2', { className: 'viewer-header__title' }, arc.title),
      h('p', { className: 'viewer-header__synopsis' }, arc.synopsis),
      h('div', { className: 'viewer-header__tags' }, ...arc.tags.map((tag) => h('span', { className: 'chip', style: { fontSize: '10px' } }, tag)))));

  const chaptersList = h('div', { className: 'viewer-chapters' });
  arc.chapters.forEach((candidate) => chaptersList.appendChild(h('button', {
    className: cx('viewer-chapter-tab', candidate.id === chapter.id && 'is-active'),
    'data-search': normalize(candidate.title),
    onclick: (): void => openChapter(arc.id, candidate.id),
  }, candidate.title.replace(/^Capítulo [\dIVX]+ [—-] /, ''))));
  const chaptersWrap = h('div', { className: 'viewer-chapters-wrap' });
  if (arc.chapters.length > 10) {
    const counter = h('span', { className: 'viewer-chapters__count u-text-muted' }, `${arc.chapters.length} capítulos`);
    chaptersWrap.appendChild(h('div', { className: 'viewer-chapters__bar' }, h('input', {
      className: 'input viewer-chapters__search', type: 'search', placeholder: 'Buscar capítulo (número ou título)…',
      oninput: (event: Event): void => {
        if (!(event.target instanceof HTMLInputElement)) return;
        const term = normalize(event.target.value); let shown = 0;
        chaptersList.querySelectorAll<HTMLElement>('.viewer-chapter-tab').forEach((button) => {
          const match = !term || (button.dataset.search ?? '').includes(term); button.style.display = match ? '' : 'none'; if (match) shown += 1;
        });
        counter.textContent = term ? `${shown} de ${arc.chapters.length}` : `${arc.chapters.length} capítulos`;
      },
    }), counter));
  }
  chaptersWrap.appendChild(chaptersList);

  const body = h('div', { className: cx('chapter-body', state.theme === 'sepia' && 'is-sepia'), style: { fontSize: `${state.fontSize}px` } });
  body.appendChild(h('h3', { className: 'chapter-body__title' }, chapter.title));
  if (chapter.blocks?.length) chapter.blocks.forEach((block) => {
    if (block.t === 'h' && block.v) body.appendChild(h('h4', { className: 'chapter-body__sub' }, block.v));
    else if (block.v) body.appendChild(h('p', null, block.v));
  });
  else (chapter.content ?? '').split(/\n\n+/).forEach((paragraph) => body.appendChild(h('p', null, paragraph.trim())));

  const index = arc.chapters.findIndex((candidate) => candidate.id === chapter.id);
  const arcs = allArcs(); const arcIndex = arcs.findIndex((candidate) => candidate.id === arc.id);
  const atStart = index <= 0 && arcIndex <= 0; const atEnd = index >= arc.chapters.length - 1 && arcIndex >= arcs.length - 1;
  const nav = h('div', { className: 'viewer-nav' },
    h('button', { className: 'btn btn--ghost btn--sm', disabled: atStart, title: 'Capítulo anterior', onclick: (): void => gotoAdjacentChapter(-1) }, 'anterior'),
    h('span', { className: 'u-text-muted u-mono' }, `${index + 1} / ${arc.chapters.length}`),
    h('button', { className: 'btn btn--ghost btn--sm', disabled: atEnd, title: 'Próximo capítulo', onclick: (): void => gotoAdjacentChapter(1) }, 'próximo'));
  viewerEl.append(tools, header, chaptersWrap, body, nav);
}

export function bibliotecaPage(args: RouteArgs): HTMLDivElement {
  state = loadState(); sagaArcos = []; sagaStatus = 'loading';
  if (!keyNavBound) {
    keyNavBound = true;
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      if (!viewerEl || !document.body.contains(viewerEl) || !state.selectedChapter) return;
      const target = event.target;
      if (!(target instanceof HTMLElement) || target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea' || target.isContentEditable) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); gotoAdjacentChapter(-1); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); gotoAdjacentChapter(1); }
    });
  }
  const fullPage = h('div', { className: 'page-biblioteca' });
  sagaCountEl = h('span', { className: 'u-text-cyan' }, 'carregando capítulos…');
  fullPage.appendChild(buildImmersiveHero({
    kicker: 'BALUARTE · BIBLIOTECA', title: 'Crônicas da Baluarte', sub: 'ONDE OS DEUSES SANGRAM', accent2: '#9d7bff', variant: 'helix',
    desc: ['A saga canônica ', h('span', { className: 'u-text-cyan' }, '"Onde os Deuses Sangram"'), ' — ', h('span', { className: 'u-text-cyan' }, '24 arcos'), ' (', sagaCountEl, '), somada aos arcos de cenário do universo. Retomar leitura, favoritar, tema dark/sépia e fonte ajustáveis.'],
    ctas: [{ label: '✦ Explorar universos', variant: 'primary', onClick: (): void => router.navigate('/universo') }], hudLeft: '◫ ARQUIVO NARRATIVO', hudRight: '24 ARCOS', sceneKey: 'biblioteca', query: args.query,
  }));
  searchInput = h('input', { className: 'input input--search', type: 'search', placeholder: 'Buscar por título, código, sinopse, tag…', value: state.search, spellcheck: 'false', oninput: debounce((event: Event): void => { if (event.target instanceof HTMLInputElement) { state.search = event.target.value; persist(); renderList(); } }, 120) });
  univSelect = h('select', { className: 'input', 'aria-label': 'Filtrar por universo', onchange: (event: Event): void => { if (event.target instanceof HTMLSelectElement) { state.universe = event.target.value; persist(); renderList(); } } },
    h('option', { value: 'all', selected: state.universe === 'all' }, 'Todos universos'), h('option', { value: SAGA_UNIVERSE, selected: state.universe === SAGA_UNIVERSE }, SAGA_UNIVERSE), ...UNIVERSES.map((universe) => h('option', { value: universe, selected: state.universe === universe }, universe)));
  const bookmarkToggle = h('label', { className: 'graficos-toggle' }, h('input', { type: 'checkbox', checked: state.onlyBookmarked, onchange: (event: Event): void => { if (event.target instanceof HTMLInputElement) { state.onlyBookmarked = event.target.checked; persist(); renderList(); } } }), h('span', null, '★ só favoritos'));
  fullPage.appendChild(h('div', { className: 'biblioteca-controls' }, h('div', { style: { flex: 1, minWidth: '200px' } }, searchInput), univSelect, bookmarkToggle));
  listEl = h('div', { className: 'arc-list' }); viewerEl = h('div', { className: 'arc-viewer' }); fullPage.appendChild(h('div', { className: 'biblioteca-grid' }, listEl, viewerEl));
  renderList(); renderViewer();
  void loadSaga().then(({ arcos }) => {
    sagaArcos = arcos; sagaStatus = 'ok';
    const totalChapters = arcos.reduce((total, arc) => total + arc.chapters.length, 0); if (sagaCountEl) sagaCountEl.textContent = `${totalChapters} capítulos`;
    if (!findArc(state.selectedArc) && sagaArcos[0]) { state.selectedArc = sagaArcos[0].id; state.selectedChapter = sagaArcos[0].chapters[0]?.id ?? null; }
    renderList(); renderViewer();
  }).catch((error: unknown) => { console.error('[biblioteca] falha ao carregar a saga:', error); sagaStatus = 'error'; if (sagaCountEl) sagaCountEl.textContent = 'capítulos indisponíveis'; renderList(); });
  return fullPage;
}
