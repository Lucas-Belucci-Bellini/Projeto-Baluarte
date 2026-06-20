/**
 * Página /videos — Central de Vídeos (Fase 16).
 *
 * Playlists temáticas com YouTube embeds + suporte a arquivos locais
 * via Media Hub (cross-link).
 */

import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive.js';
import { storage } from '../core/storage.js';
import { router } from '../core/router.js';
import { PLAYLISTS, TOTAL_VIDEOS, TOTAL_PLAYLISTS, findPlaylist, findVideo } from '../data/videos.js';

const STORAGE_KEY = 'videos:state';

let state = null;
let listEl = null;
let playerEl = null;
let countEl = null;

function loadState() {
  return storage.get(STORAGE_KEY) || {
    activePlaylist: PLAYLISTS[0].id,
    selectedVideoId: PLAYLISTS[0].videos[0]?.id,
    search: '',
    watched: []   /* ids dos vídeos marcados como assistidos */
  };
}
function persist() { storage.set(STORAGE_KEY, state); }

function markWatched(id) {
  if (!state.watched.includes(id)) {
    state.watched.push(id);
    persist();
  }
}

function applyFilters() {
  const playlist = findPlaylist(state.activePlaylist);
  if (!playlist) return [];
  let videos = playlist.videos;
  if (state.search) {
    const t = normalize(state.search);
    videos = videos.filter((v) =>
      normalize(v.title).includes(t) ||
      (v.tags || []).some((tag) => normalize(tag).includes(t))
    );
  }
  return videos;
}

/* ===== Render ===== */

function renderPlaylists() {
  const wrap = h('div', { className: 'videos-playlists' });
  PLAYLISTS.forEach((p) => {
    wrap.appendChild(
      h('button', {
        className: cx('video-playlist', state.activePlaylist === p.id && 'is-active'),
        'data-p': p.id,
        style: `--p-color: ${p.color};`,
        onclick: () => {
          state.activePlaylist = p.id;
          state.selectedVideoId = p.videos[0]?.id;
          persist();
          document.querySelectorAll('.video-playlist').forEach((b) =>
            b.classList.toggle('is-active', b.dataset.p === p.id)
          );
          renderList();
          renderPlayer();
        }
      },
        h('span', { className: 'video-playlist__icon', style: `color: ${p.color};` }, p.icon),
        h('div', null,
          h('div', { className: 'video-playlist__title' }, p.title),
          h('div', { className: 'video-playlist__count u-text-muted u-mono' }, `${p.videos.length} vídeos`)
        )
      )
    );
  });
  return wrap;
}

function renderList() {
  if (!listEl) return;
  empty(listEl);
  const playlist = findPlaylist(state.activePlaylist);
  const videos = applyFilters();
  if (countEl) countEl.textContent = `${videos.length} de ${playlist.videos.length}`;

  if (!videos.length) {
    listEl.appendChild(h('div', { className: 'media-empty u-text-muted' }, 'Nenhum vídeo'));
    return;
  }

  videos.forEach((v, i) => {
    const isWatched = state.watched.includes(v.id);
    const isActive = v.id === state.selectedVideoId;
    listEl.appendChild(
      h('div', {
        className: cx('video-row', isActive && 'is-active'),
        'data-id': v.id,
        onclick: () => {
          state.selectedVideoId = v.id;
          markWatched(v.id);
          persist();
          document.querySelectorAll('.video-row').forEach((r) =>
            r.classList.toggle('is-active', r.dataset.id === v.id)
          );
          renderPlayer();
        }
      },
        h('div', { className: 'video-row__num' }, String(i + 1).padStart(2, '0')),
        h('div', { className: 'video-row__body' },
          h('div', { className: 'video-row__title' },
            v.title,
            isWatched && h('span', { className: 'video-row__watched', title: 'assistido' }, ' ✓')
          ),
          h('div', { className: 'video-row__meta u-text-muted u-mono' },
            v.duration + (v.tags?.length ? ' · ' + v.tags.slice(0, 2).join(', ') : '')
          )
        )
      )
    );
  });
}

function renderPlayer() {
  if (!playerEl) return;
  empty(playerEl);
  const v = findVideo(state.selectedVideoId);
  if (!v) {
    playerEl.appendChild(
      h('div', { className: 'media-empty u-text-muted' }, 'Selecione um vídeo da playlist')
    );
    return;
  }

  /* YouTube embed */
  if (v.source === 'youtube' && v.ytId) {
    const iframe = h('iframe', {
      className: 'videos-iframe',
      src: `https://www.youtube-nocookie.com/embed/${v.ytId}?modestbranding=1&rel=0`,
      title: v.title,
      frameborder: '0',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowfullscreen: true
    });
    playerEl.appendChild(iframe);
  } else if (v.source === 'youtube-playlist' && v.playlistId) {
    playerEl.appendChild(h('iframe', {
      className: 'videos-iframe',
      src: `https://www.youtube.com/embed/videoseries?list=${v.playlistId}&modestbranding=1&rel=0`,
      title: v.title,
      frameborder: '0',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowfullscreen: true
    }));
  } else {
    playerEl.appendChild(
      h('div', { className: 'media-empty u-text-muted' },
        'Vídeo local — abra no /media',
        h('button', {
          className: 'btn btn--ghost btn--sm',
          style: 'margin-top: 8px',
          onclick: () => router.navigate('/media')
        }, 'Ir para /media →')
      )
    );
  }

  /* Header info */
  playerEl.appendChild(
    h('div', { className: 'videos-info' },
      h('h3', { className: 'videos-info__title' }, v.title),
      h('div', { className: 'videos-info__meta u-text-muted' },
        h('span', null, v.playlistTitle),
        h('span', null, ' · '),
        h('span', null, v.duration),
        h('span', null, ' · '),
        h('span', { className: 'u-text-cyan' }, v.source)
      ),
      v.tags?.length && h('div', { className: 'videos-info__tags' },
        ...v.tags.map((t) => h('span', { className: 'chip', style: { fontSize: '10px' } }, t))
      )
    )
  );
}

export function videosPage() {
  state = loadState();

  const fullPage = h('div', { className: 'page-videos' });

  fullPage.appendChild(
    buildImmersiveHero({
      kicker: 'BALUARTE · CENTRAL DE VÍDEOS',
      title: 'Central de Vídeos',
      sub: 'YOUTUBE & PLAYLISTS',
      desc: [
        h('span', { className: 'u-text-cyan' }, `${TOTAL_VIDEOS} vídeos`),
        ' em ',
        h('span', { className: 'u-text-cyan' }, `${TOTAL_PLAYLISTS} playlists`),
        ' temáticas. YouTube embeds + cross-link com Media Hub para arquivos locais.'
      ],
      hudLeft: '▶ VÍDEOS', hudRight: 'YOUTUBE'
    })
  );

  fullPage.appendChild(renderPlaylists());

  /* Search + count */
  const searchInput = h('input', {
    className: 'input input--search',
    type: 'search',
    placeholder: 'Buscar nesta playlist…',
    value: state.search,
    oninput: debounce((e) => { state.search = e.target.value; persist(); renderList(); }, 120)
  });
  countEl = h('span', { className: 'section-header__count' }, '');

  fullPage.appendChild(
    h('div', { className: 'elites-controls' },
      h('div', { style: { flex: 1, minWidth: '200px' } }, searchInput),
      countEl
    )
  );

  listEl = h('div', { className: 'videos-list' });
  playerEl = h('div', { className: 'videos-player' });

  fullPage.appendChild(
    h('div', { className: 'videos-grid' }, listEl, playerEl)
  );

  renderList();
  renderPlayer();

  return fullPage;
}
