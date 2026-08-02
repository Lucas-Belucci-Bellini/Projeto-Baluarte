/**
 * Página /biblioteca — Crônicas da Baluarte.
 *
 * Leitor da saga canônica "Onde os Deuses Sangram" (24 arcos, mais de
 * mil capítulos) somada aos arcos de cenário do universo. A saga é um
 * arquivo grande: carrega sob demanda (loadSaga) quando a página abre.
 *
 * Recursos: capítulos navegáveis (prev/next), retomar leitura,
 * favoritos, busca, filtro por universo, tema dark/sépia, fonte.
 */

import '../styles/biblioteca.css';
import '../styles/graficos.css';
import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { router } from '../core/router.js';
import { buildImmersiveHero } from '../utils/immersive.js';
import { ARCS, UNIVERSES, loadSaga } from '../data/cronicas.js';

const STORAGE_KEY = 'biblioteca:state';
const SAGA_UNIVERSE = 'Onde os Deuses Sangram';

let state = null;
let listEl = null;
let viewerEl = null;
let searchInput = null;
let univSelect = null;
let sagaCountEl = null;

let sagaArcos = [];
let sagaStatus = 'loading'; /* loading | ok | error */
let keyNavBound = false;

/** Saga (carregada) + arcos de cenário (síncronos). */
function allArcs() {
  return [...sagaArcos, ...ARCS];
}
function findArc(id) {
  return allArcs().find((a) => a.id === id) || null;
}

function loadState() {
  const saved = storage.get(STORAGE_KEY);
  if (saved) return saved;
  return {
    search: '',
    universe: 'all',
    onlyBookmarked: false,
    selectedArc: null,
    selectedChapter: null,
    fontSize: 16,
    theme: 'dark', /* dark | sepia */
    bookmarks: [],
    progress: {} /* arcId → { lastChapter, lastVisit } */
  };
}
function persist() { storage.set(STORAGE_KEY, state); }

/* ===== Filtros ===== */

function applyFilters() {
  let pool = allArcs();
  if (state.universe !== 'all') {
    pool = pool.filter((a) => a.universe === state.universe);
  }
  if (state.onlyBookmarked) {
    pool = pool.filter((a) => state.bookmarks.includes(a.id));
  }
  if (state.search) {
    const t = normalize(state.search);
    pool = pool.filter((a) =>
      normalize(a.title).includes(t) ||
      normalize(a.code).includes(t) ||
      normalize(a.synopsis).includes(t) ||
      a.tags.some((tag) => normalize(tag).includes(t))
    );
  }
  return pool;
}

/* ===== Lista de arcos ===== */

function statusBanner() {
  if (sagaStatus === 'loading') {
    return h('div', { className: 'biblioteca-resume' },
      h('div', { className: 'biblioteca-resume__label' }, '⏳ Carregando a saga'),
      h('div', { className: 'biblioteca-resume__chap' },
        'Onde os Deuses Sangram — 24 arcos. Pode levar um instante.')
    );
  }
  return h('div', { className: 'biblioteca-resume' },
    h('div', { className: 'biblioteca-resume__label u-text-danger' }, '⚠ A saga não carregou'),
    h('div', { className: 'biblioteca-resume__chap' },
      'Verifique a conexão e recarregue. Os arcos de cenário seguem disponíveis abaixo.')
  );
}

function renderList() {
  if (!listEl) return;
  empty(listEl);

  if (sagaStatus !== 'ok') {
    listEl.appendChild(statusBanner());
  }

  const filtered = applyFilters();

  if (filtered.length === 0) {
    listEl.appendChild(
      h('div', { className: 'biblioteca-empty u-text-muted' },
        h('div', { style: { fontSize: '48px' } }, '◫'),
        h('div', null, 'Nenhum arco encontrado')
      )
    );
    return;
  }

  /* Retomar leitura */
  const last = findArc(state.selectedArc);
  if (last && state.progress[state.selectedArc]) {
    const progress = state.progress[state.selectedArc];
    const chapter = last.chapters.find((c) => c.id === progress.lastChapter);
    if (chapter) {
      listEl.appendChild(
        h('div', { className: 'biblioteca-resume' },
          h('div', { className: 'biblioteca-resume__label' }, '▶ Retomar leitura'),
          h('div', { className: 'biblioteca-resume__arc' }, last.code + ' — ' + last.title),
          h('div', { className: 'biblioteca-resume__chap' }, chapter.title),
          h('button', {
            className: 'btn btn--primary btn--sm',
            onclick: () => openChapter(last.id, chapter.id)
          }, '▶ Continuar')
        )
      );
    }
  }

  filtered.forEach((arc) => {
    const isActive = arc.id === state.selectedArc;
    const isBookmarked = state.bookmarks.includes(arc.id);
    const lastProgress = state.progress[arc.id];

    const card = h('div', {
      className: cx('arc-card', isActive && 'is-active'),
      'data-id': arc.id,
      onclick: () => {
        state.selectedArc = arc.id;
        state.selectedChapter = arc.chapters[0] && arc.chapters[0].id;
        persist();
        document.querySelectorAll('.arc-card').forEach((c) =>
          c.classList.toggle('is-active', c.dataset.id === arc.id)
        );
        renderViewer();
      }
    },
      h('div', { className: 'arc-card__cover' }, arc.cover),
      h('div', { className: 'arc-card__body' },
        h('div', { className: 'arc-card__head' },
          h('span', { className: cx('arc-card__code', arc.canonical && 'arc-card__code--saga') }, arc.code),
          h('span', { className: 'arc-card__univ' }, arc.universe),
          arc.canonical && h('span', { className: 'arc-card__canon' }, '◆ FAN FIC'),
          isBookmarked && h('span', { className: 'arc-card__bookmark' }, '★')
        ),
        h('div', { className: 'arc-card__title' }, arc.title),
        h('div', { className: 'arc-card__synopsis' }, arc.synopsis),
        h('div', { className: 'arc-card__meta' },
          h('span', null, `${arc.chapters.length} cap.`),
          lastProgress && h('span', { className: 'u-text-cyan' }, '· progredindo')
        )
      )
    );
    listEl.appendChild(card);
  });
}

/* ===== Viewer ===== */

function openChapter(arcId, chapterId) {
  state.selectedArc = arcId;
  state.selectedChapter = chapterId;
  state.progress[arcId] = { lastChapter: chapterId, lastVisit: Date.now() };
  persist();
  renderViewer();
  document.querySelectorAll('.arc-card').forEach((c) =>
    c.classList.toggle('is-active', c.dataset.id === arcId)
  );
  /* leitura: começa o capítulo do topo */
  document.querySelector('.main__inner')?.scrollTo({ top: 0, behavior: 'smooth' });
}

/** Capítulo anterior/seguinte; cruza para o arco vizinho no fim/início de um
 *  arco, para leitura contínua da saga. dir = +1 (próximo) | -1 (anterior). */
function gotoAdjacentChapter(dir) {
  const arc = findArc(state.selectedArc);
  if (!arc) return;
  const idx = arc.chapters.findIndex((c) => c.id === state.selectedChapter);
  const target = idx + dir;
  if (target >= 0 && target < arc.chapters.length) {
    openChapter(arc.id, arc.chapters[target].id);
    return;
  }
  const arcs = allArcs();
  const aIdx = arcs.findIndex((a) => a.id === arc.id);
  const adjArc = arcs[aIdx + dir];
  if (adjArc && adjArc.chapters.length) {
    const ch = dir > 0 ? adjArc.chapters[0] : adjArc.chapters[adjArc.chapters.length - 1];
    openChapter(adjArc.id, ch.id);
    renderList();
  }
}

function renderViewer() {
  if (!viewerEl) return;
  empty(viewerEl);

  const arc = findArc(state.selectedArc);
  if (!arc) {
    viewerEl.appendChild(
      h('div', { className: 'biblioteca-empty u-text-muted' },
        h('div', { style: { fontSize: '64px' } }, '◫'),
        h('div', null, sagaStatus === 'loading'
          ? 'Carregando a saga das Crônicas…'
          : 'Selecione um arco para começar a ler.')
      )
    );
    return;
  }

  let chapter = arc.chapters.find((c) => c.id === state.selectedChapter) || arc.chapters[0];
  if (!chapter) {
    viewerEl.appendChild(
      h('div', { className: 'biblioteca-empty u-text-muted' }, 'Este arco ainda não tem capítulos.')
    );
    return;
  }

  /* Marca progress */
  state.progress[arc.id] = { lastChapter: chapter.id, lastVisit: Date.now() };
  persist();

  /* Toolbar */
  const isBookmarked = state.bookmarks.includes(arc.id);
  const tools = h('div', { className: 'viewer-tools' },
    h('button', {
      className: cx('btn btn--ghost btn--sm', isBookmarked && 'is-on'),
      onclick: () => {
        if (isBookmarked) {
          state.bookmarks = state.bookmarks.filter((b) => b !== arc.id);
          toast('Removido dos favoritos', { type: 'info' });
        } else {
          state.bookmarks.push(arc.id);
          toast('Adicionado aos favoritos', { type: 'success' });
        }
        persist();
        renderList();
        renderViewer();
      }
    }, isBookmarked ? '★ favorito' : '☆ favoritar'),
    h('button', {
      className: cx('btn btn--ghost btn--sm', state.theme === 'sepia' && 'is-on'),
      onclick: () => {
        state.theme = state.theme === 'sepia' ? 'dark' : 'sepia';
        persist();
        renderViewer();
      }
    }, state.theme === 'sepia' ? '◐ tema sépia' : '◑ tema dark'),
    h('div', { className: 'viewer-tools__fontsize' },
      h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'A'),
      h('input', {
        type: 'range', min: '13', max: '22', step: '1', value: state.fontSize,
        'aria-label': 'Tamanho da letra na leitura',
        oninput: (e) => {
          state.fontSize = parseInt(e.target.value, 10);
          persist();
          const body = document.querySelector('.chapter-body');
          if (body) body.style.fontSize = state.fontSize + 'px';
        }
      }),
      h('span', { className: 'u-text-muted', style: { fontSize: '17px' } }, 'A')
    )
  );

  /* Header do arco */
  const header = h('div', { className: 'viewer-header' },
    h('div', { className: 'viewer-header__cover' }, arc.cover),
    h('div', null,
      h('div', { className: 'viewer-header__code' },
        arc.code + ' · ' + arc.universe
      ),
      h('h2', { className: 'viewer-header__title' }, arc.title),
      h('p', { className: 'viewer-header__synopsis' }, arc.synopsis),
      h('div', { className: 'viewer-header__tags' },
        ...arc.tags.map((t) => h('span', { className: 'chip', style: { fontSize: '10px' } }, t))
      )
    )
  );

  /* Lista de capítulos (com busca quando há muitos) */
  const chaptersList = h('div', { className: 'viewer-chapters' });
  arc.chapters.forEach((c) => {
    chaptersList.appendChild(
      h('button', {
        className: cx('viewer-chapter-tab', c.id === chapter.id && 'is-active'),
        'data-search': normalize(c.title),
        onclick: () => openChapter(arc.id, c.id)
      }, c.title.replace(/^Capítulo [\dIVX]+ [—-] /, ''))
    );
  });

  const chaptersWrap = h('div', { className: 'viewer-chapters-wrap' });
  if (arc.chapters.length > 10) {
    const counter = h('span', { className: 'viewer-chapters__count u-text-muted' }, `${arc.chapters.length} capítulos`);
    chaptersWrap.appendChild(
      h('div', { className: 'viewer-chapters__bar' },
        h('input', {
          className: 'input viewer-chapters__search',
          type: 'search',
          placeholder: 'Buscar capítulo (número ou título)…',
          oninput: (e) => {
            const term = normalize(e.target.value);
            let shown = 0;
            chaptersList.querySelectorAll('.viewer-chapter-tab').forEach((btn) => {
              const match = !term || btn.dataset.search.includes(term);
              btn.style.display = match ? '' : 'none';
              if (match) shown++;
            });
            counter.textContent = term ? `${shown} de ${arc.chapters.length}` : `${arc.chapters.length} capítulos`;
          }
        }),
        counter
      )
    );
  }
  chaptersWrap.appendChild(chaptersList);

  /* Conteúdo do capítulo */
  const body = h('div', {
    className: cx('chapter-body', state.theme === 'sepia' && 'is-sepia'),
    style: { fontSize: state.fontSize + 'px' }
  });
  body.appendChild(h('h3', { className: 'chapter-body__title' }, chapter.title));
  if (Array.isArray(chapter.blocks)) {
    /* Capítulo estruturado (fan fic): blocos de subtítulo (h) e prosa (p). */
    chapter.blocks.forEach((b) => {
      if (b && b.t === 'h') {
        body.appendChild(h('h4', { className: 'chapter-body__sub' }, b.v));
      } else if (b && b.v) {
        body.appendChild(h('p', null, b.v));
      }
    });
  } else {
    /* Texto simples: cada parágrafo separado por linha em branco. */
    chapter.content.split(/\n\n+/).forEach((p) => {
      body.appendChild(h('p', null, p.trim()));
    });
  }

  /* Navegação prev/next */
  const idx = arc.chapters.findIndex((c) => c.id === chapter.id);
  const allA = allArcs();
  const aIdx = allA.findIndex((a) => a.id === arc.id);
  const atStart = idx <= 0 && aIdx <= 0;
  const atEnd = idx >= arc.chapters.length - 1 && aIdx >= allA.length - 1;
  const nav = h('div', { className: 'viewer-nav' },
    h('button', {
      className: 'btn btn--ghost btn--sm',
      disabled: atStart,
      title: 'Capítulo anterior (←)',
      onclick: () => gotoAdjacentChapter(-1)
    }, '← anterior'),
    h('span', { className: 'u-text-muted u-mono' }, `${idx + 1} / ${arc.chapters.length}`),
    h('button', {
      className: 'btn btn--ghost btn--sm',
      disabled: atEnd,
      title: 'Próximo capítulo (→)',
      onclick: () => gotoAdjacentChapter(1)
    }, 'próximo →')
  );

  viewerEl.appendChild(tools);
  viewerEl.appendChild(header);
  viewerEl.appendChild(chaptersWrap);
  viewerEl.appendChild(body);
  viewerEl.appendChild(nav);
}

/* ===== Page builder ===== */

export function bibliotecaPage(args) {
  state = loadState();
  sagaArcos = [];
  sagaStatus = 'loading';

  /* Navegação por teclado (← →) entre capítulos — vinculada uma única vez;
   * só age quando a Biblioteca está montada e o foco não está num campo. */
  if (!keyNavBound) {
    keyNavBound = true;
    window.addEventListener('keydown', (e) => {
      if (!viewerEl || !document.body.contains(viewerEl)) return;
      if (!state || !state.selectedChapter) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); gotoAdjacentChapter(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); gotoAdjacentChapter(1); }
    });
  }

  const fullPage = h('div', { className: 'page-biblioteca' });

  sagaCountEl = h('span', { className: 'u-text-cyan' }, 'carregando capítulos…');

  fullPage.appendChild(buildImmersiveHero({
    kicker: 'BALUARTE · BIBLIOTECA',
    title: 'Crônicas da Baluarte',
    sub: 'ONDE OS DEUSES SANGRAM',
    accent2: '#9d7bff',
    variant: 'helix',
    desc: [
      'A saga canônica ',
      h('span', { className: 'u-text-cyan' }, '"Onde os Deuses Sangram"'),
      ' — ',
      h('span', { className: 'u-text-cyan' }, '24 arcos'),
      ' (', sagaCountEl, '), somada aos arcos de cenário do universo. ',
      'Retomar leitura, favoritar, tema dark/sépia e fonte ajustáveis.'
    ],
    ctas: [
      { label: '✦ Explorar universos', variant: 'primary', onClick: () => router.navigate('/universo') }
    ],
    hudLeft: '◫ ARQUIVO NARRATIVO',
    hudRight: '24 ARCOS',
    sceneKey: 'biblioteca',
    query: args && args.query
  }));

  /* Controles */
  searchInput = h('input', {
    className: 'input input--search',
    type: 'search',
    placeholder: 'Buscar por título, código, sinopse, tag…',
    value: state.search,
    spellcheck: 'false',
    oninput: debounce((e) => {
      state.search = e.target.value;
      persist();
      renderList();
    }, 120)
  });

  univSelect = h('select', {
    className: 'input',
    'aria-label': 'Filtrar por universo',
    onchange: (e) => {
      state.universe = e.target.value;
      persist();
      renderList();
    }
  },
    h('option', { value: 'all', selected: state.universe === 'all' }, 'Todos universos'),
    h('option', {
      value: SAGA_UNIVERSE, selected: state.universe === SAGA_UNIVERSE
    }, 'Onde os Deuses Sangram (saga)'),
    ...UNIVERSES.map((u) =>
      h('option', { value: u, selected: state.universe === u }, u)
    )
  );

  const bookmarkToggle = h('label', { className: 'graficos-toggle' },
    h('input', {
      type: 'checkbox', checked: state.onlyBookmarked,
      onchange: (e) => {
        state.onlyBookmarked = e.target.checked;
        persist();
        renderList();
      }
    }),
    h('span', null, '★ só favoritos')
  );

  fullPage.appendChild(
    h('div', { className: 'biblioteca-controls' },
      h('div', { style: { flex: 1, minWidth: '200px' } }, searchInput),
      univSelect,
      bookmarkToggle
    )
  );

  listEl = h('div', { className: 'arc-list' });
  viewerEl = h('div', { className: 'arc-viewer' });

  fullPage.appendChild(
    h('div', { className: 'biblioteca-grid' }, listEl, viewerEl)
  );

  renderList();
  renderViewer();

  /* Carrega a saga completa sob demanda (arquivo grande, fora do bundle). */
  loadSaga()
    .then(({ arcos }) => {
      sagaArcos = arcos;
      sagaStatus = 'ok';
      const totalCh = arcos.reduce((s, a) => s + a.chapters.length, 0);
      if (sagaCountEl) sagaCountEl.textContent = totalCh + ' capítulos';
      if (!findArc(state.selectedArc) && sagaArcos[0]) {
        state.selectedArc = sagaArcos[0].id;
        state.selectedChapter = sagaArcos[0].chapters[0] && sagaArcos[0].chapters[0].id;
      }
      renderList();
      renderViewer();
    })
    .catch((err) => {
      console.error('[biblioteca] falha ao carregar a saga:', err);
      sagaStatus = 'error';
      if (sagaCountEl) sagaCountEl.textContent = 'capítulos indisponíveis';
      renderList();
    });

  return fullPage;
}
