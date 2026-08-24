/**
 * Página /videos — Central de Vídeos.
 *
 * Mantém playlists temáticas, busca persistida, marcação de assistidos,
 * embeds YouTube e encaminhamento de vídeos locais para o Media Hub.
 */

import '../styles/biblioteca.css';
import '../styles/videos.css';
import { h, cx, debounce, empty, normalize } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive';
import { storage } from '../core/storage.js';
import { router } from '../core/router.js';
import { PLAYLISTS, TOTAL_VIDEOS, TOTAL_PLAYLISTS, findPlaylist, findVideo } from '../data/videos.js';
import type { VideoItem } from '../data/videos.js';

const STORAGE_KEY = 'videos:state';

interface VideosState {
  activePlaylist: string;
  selectedVideoId?: string;
  search: string;
  watched: string[];
}

let state: VideosState = {
  activePlaylist: PLAYLISTS[0]?.id ?? '',
  selectedVideoId: PLAYLISTS[0]?.videos[0]?.id,
  search: '',
  watched: [],
};
let listEl: HTMLDivElement | null = null;
let playerEl: HTMLDivElement | null = null;
let countEl: HTMLSpanElement | null = null;

function loadState(): VideosState {
  const saved: unknown = storage.get<unknown>(STORAGE_KEY);
  if (saved !== null && typeof saved === 'object' && !Array.isArray(saved)) {
    const record = saved as Record<string, unknown>;
    if (typeof record.activePlaylist === 'string'
      && typeof record.search === 'string'
      && Array.isArray(record.watched)
      && record.watched.every((id): id is string => typeof id === 'string')) {
      return {
        activePlaylist: record.activePlaylist,
        selectedVideoId: typeof record.selectedVideoId === 'string' ? record.selectedVideoId : undefined,
        search: record.search,
        watched: record.watched,
      };
    }
  }
  const first = PLAYLISTS[0];
  return {
    activePlaylist: first?.id ?? '',
    selectedVideoId: first?.videos[0]?.id,
    search: '',
    watched: [],
  };
}

function persist(): void {
  storage.set(STORAGE_KEY, state);
}

function markWatched(id: string): void {
  if (!state.watched.includes(id)) {
    state.watched.push(id);
    persist();
  }
}

function applyFilters(): readonly VideoItem[] {
  const playlist = findPlaylist(state.activePlaylist);
  if (!playlist) return [];
  if (!state.search) return playlist.videos;
  const query = normalize(state.search);
  return playlist.videos.filter((video) => normalize(video.title).includes(query)
    || (video.tags ?? []).some((tag) => normalize(tag).includes(query)));
}

function renderPlaylists(): HTMLDivElement {
  const wrap = h('div', { className: 'videos-playlists' });
  PLAYLISTS.forEach((playlist) => {
    wrap.appendChild(h('button', {
      className: cx('video-playlist', state.activePlaylist === playlist.id && 'is-active'),
      'data-p': playlist.id,
      style: `--p-color: ${playlist.color};`,
      onclick: () => {
        state.activePlaylist = playlist.id;
        state.selectedVideoId = playlist.videos[0]?.id;
        persist();
        document.querySelectorAll('.video-playlist').forEach((button) => {
          if (button instanceof HTMLElement) button.classList.toggle('is-active', button.dataset.p === playlist.id);
        });
        renderList();
        renderPlayer();
      },
    },
    h('span', { className: 'video-playlist__icon', style: `color: ${playlist.color};` }, playlist.icon),
    h('div', null,
      h('div', { className: 'video-playlist__title' }, playlist.title),
      h('div', { className: 'video-playlist__count u-text-muted u-mono' }, `${playlist.videos.length} vídeos`),
    ),
    ));
  });
  return wrap;
}

function renderList(): void {
  if (!listEl) return;
  empty(listEl);
  const playlist = findPlaylist(state.activePlaylist);
  const videos = applyFilters();
  if (countEl) countEl.textContent = `${videos.length} de ${playlist?.videos.length ?? 0}`;
  if (!videos.length) {
    listEl.appendChild(h('div', { className: 'media-empty u-text-muted' }, 'Nenhum vídeo'));
    return;
  }
  videos.forEach((video, index) => {
    const watched = state.watched.includes(video.id);
    const active = video.id === state.selectedVideoId;
    listEl?.appendChild(h('div', {
      className: cx('video-row', active && 'is-active'),
      'data-id': video.id,
      onclick: () => {
        state.selectedVideoId = video.id;
        markWatched(video.id);
        persist();
        document.querySelectorAll('.video-row').forEach((row) => {
          if (row instanceof HTMLElement) row.classList.toggle('is-active', row.dataset.id === video.id);
        });
        renderPlayer();
      },
    },
    h('div', { className: 'video-row__num' }, String(index + 1).padStart(2, '0')),
    h('div', { className: 'video-row__body' },
      h('div', { className: 'video-row__title' }, video.title,
        watched ? h('span', { className: 'video-row__watched', title: 'assistido' }, ' ✓') : false),
      h('div', { className: 'video-row__meta u-text-muted u-mono' },
        video.duration + (video.tags?.length ? ` · ${video.tags.slice(0, 2).join(', ')}` : '')),
    ),
    ));
  });
}

function renderPlayer(): void {
  if (!playerEl) return;
  empty(playerEl);
  const video = findVideo(state.selectedVideoId);
  if (!video) {
    playerEl.appendChild(h('div', { className: 'media-empty u-text-muted' }, 'Selecione um vídeo da playlist'));
    return;
  }

  if (video.source === 'youtube' && video.ytId) {
    playerEl.appendChild(h('iframe', {
      className: 'videos-iframe',
      src: `https://www.youtube-nocookie.com/embed/${video.ytId}?modestbranding=1&rel=0`,
      title: video.title,
      frameborder: '0',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowfullscreen: true,
    }));
  } else if (video.source === 'youtube-playlist' && video.playlistId) {
    playerEl.appendChild(h('iframe', {
      className: 'videos-iframe',
      src: `https://www.youtube.com/embed/videoseries?list=${video.playlistId}&modestbranding=1&rel=0`,
      title: video.title,
      frameborder: '0',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowfullscreen: true,
    }));
  } else {
    playerEl.appendChild(h('div', { className: 'media-empty u-text-muted' },
      'Vídeo local — abra no /media',
      h('button', { className: 'btn btn--ghost btn--sm', style: 'margin-top: 8px', onclick: () => router.navigate('/media') }, 'Ir para /media →'),
    ));
  }

  playerEl.appendChild(h('div', { className: 'videos-info' },
    h('h3', { className: 'videos-info__title' }, video.title),
    h('div', { className: 'videos-info__meta u-text-muted' },
      h('span', null, video.playlistTitle), h('span', null, ' · '), h('span', null, video.duration),
      h('span', null, ' · '), h('span', { className: 'u-text-cyan' }, video.source),
    ),
    video.tags?.length ? h('div', { className: 'videos-info__tags' },
      ...video.tags.map((tag) => h('span', { className: 'chip', style: { fontSize: '10px' } }, tag)),
    ) : false,
  ));
}

export function videosPage(): HTMLDivElement {
  state = loadState();
  const fullPage = h('div', { className: 'page-videos' });
  fullPage.appendChild(buildImmersiveHero({
    kicker: 'BALUARTE · CENTRAL DE VÍDEOS',
    title: 'Central de Vídeos',
    sub: 'YOUTUBE & PLAYLISTS',
    desc: [
      h('span', { className: 'u-text-cyan' }, `${TOTAL_VIDEOS} vídeos`), ' em ',
      h('span', { className: 'u-text-cyan' }, `${TOTAL_PLAYLISTS} playlists`),
      ' temáticas. YouTube embeds + cross-link com Media Hub para arquivos locais.',
    ],
    hudLeft: '▶ VÍDEOS', hudRight: 'YOUTUBE',
  }));
  fullPage.appendChild(renderPlaylists());
  const searchInput = h('input', {
    className: 'input input--search', type: 'search', placeholder: 'Buscar nesta playlist…', value: state.search,
    oninput: debounce((event: Event) => {
      if (event.target instanceof HTMLInputElement) {
        state.search = event.target.value;
        persist();
        renderList();
      }
    }, 120),
  });
  countEl = h('span', { className: 'section-header__count' }, '');
  fullPage.appendChild(h('div', { className: 'elites-controls' },
    h('div', { style: { flex: 1, minWidth: '200px' } }, searchInput), countEl,
  ));
  listEl = h('div', { className: 'videos-list' });
  playerEl = h('div', { className: 'videos-player' });
  fullPage.appendChild(h('div', { className: 'videos-grid' }, listEl, playerEl));
  renderList();
  renderPlayer();
  return fullPage;
}
