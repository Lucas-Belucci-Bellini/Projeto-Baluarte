/**
 * Página /biblioteca — Crônicas da Baluarte (Fase 12).
 *
 * Layout (desktop):
 *   ┌─ filtro/busca ─────────────────────────────┐
 *   ├─ lista de arcos (left) ┃ viewer (right) ──┤
 *   └─────────────────────────────────────────────┘
 *
 * Recursos:
 *   - 24 arcos catalogados
 *   - Capítulos navegáveis com prev/next
 *   - Retomar leitura (último arco + capítulo lido)
 *   - Marcadores (favoritos)
 *   - Busca por título/tag/universo
 *   - Tema light/dark do viewer
 *   - Tamanho de fonte ajustável
 */

import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { ARCS, UNIVERSES, findArc, findChapter } from '../data/cronicas.js';

const STORAGE_KEY = 'biblioteca:state';

let state = null;
let listEl = null;
let viewerEl = null;
let searchInput = null;
let univSelect = null;

function loadState() {
  return storage.get(STORAGE_KEY) || {
    search: '',
    universe: 'all',
    onlyBookmarked: false,
    selectedArc: ARCS[0].id,
    selectedChapter: ARCS[0].chapters[0]?.id,
    fontSize: 16,
    theme: 'dark', /* dark | sepia */
    bookmarks: [],
    progress: {} /* arcId → { lastChapter, lastVisit } */
  };
}
function persist() { storage.set(STORAGE_KEY, state); }

/* ===== Filtros ===== */

function applyFilters() {
  let pool = ARCS;
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

function renderList() {
  if (!listEl) return;
  empty(listEl);

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

  /* Continue reading banner */
  const lastArcId = state.selectedArc;
  const last = findArc(lastArcId);
  if (last && state.progress[lastArcId]) {
    const progress = state.progress[lastArcId];
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
        state.selectedChapter = arc.chapters[0]?.id;
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
}

function renderViewer() {
  if (!viewerEl) return;
  empty(viewerEl);

  const arc = findArc(state.selectedArc);
  if (!arc) {
    viewerEl.appendChild(
      h('div', { className: 'biblioteca-empty u-text-muted' },
        h('div', { style: { fontSize: '64px' } }, '◫'),
        h('div', null, 'Selecione um arco para começar a ler.')
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

  /* Lista de capítulos */
  const chaptersList = h('div', { className: 'viewer-chapters' });
  arc.chapters.forEach((c) => {
    chaptersList.appendChild(
      h('button', {
        className: cx('viewer-chapter-tab', c.id === chapter.id && 'is-active'),
        onclick: () => openChapter(arc.id, c.id)
      }, c.title.replace(/^Capítulo [\dIVX]+ [—-] /, ''))
    );
  });

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
  const nav = h('div', { className: 'viewer-nav' },
    h('button', {
      className: 'btn btn--ghost btn--sm',
      disabled: idx === 0,
      onclick: () => idx > 0 && openChapter(arc.id, arc.chapters[idx - 1].id)
    }, '← anterior'),
    h('span', { className: 'u-text-muted u-mono' }, `${idx + 1} / ${arc.chapters.length}`),
    h('button', {
      className: 'btn btn--ghost btn--sm',
      disabled: idx === arc.chapters.length - 1,
      onclick: () => idx < arc.chapters.length - 1 && openChapter(arc.id, arc.chapters[idx + 1].id)
    }, 'próximo →')
  );

  viewerEl.appendChild(tools);
  viewerEl.appendChild(header);
  viewerEl.appendChild(chaptersList);
  viewerEl.appendChild(body);
  viewerEl.appendChild(nav);
}

/* ===== Page builder ===== */

export function bibliotecaPage() {
  state = loadState();

  const fullPage = h('div', { className: 'page-biblioteca' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'BIBLIOTECA')
      ),
      h('h1', { className: 'page-header__title' }, '◫ Biblioteca — Crônicas da Baluarte'),
      h('p', { className: 'page-header__description' },
        'A fan fic ',
        h('span', { className: 'u-text-cyan' }, '"Onde os Deuses Sangram"'),
        ' — uma saga de ',
        h('span', { className: 'u-text-cyan' }, '24 arcos e mais de 200 capítulos'),
        '. O Vault é integrado ao site aos poucos, a cada versão: abaixo estão ',
        'os arcos já trazidos e os arcos de cenário do universo. ',
        'Retomar leitura, favoritar, tema dark/sépia, fonte ajustável.'
      )
    )
  );

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
    onchange: (e) => {
      state.universe = e.target.value;
      persist();
      renderList();
    }
  },
    h('option', { value: 'all', selected: state.universe === 'all' }, 'Todos universos'),
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

  return fullPage;
}
