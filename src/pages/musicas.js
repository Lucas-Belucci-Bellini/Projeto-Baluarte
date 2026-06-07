/**
 * Página /musicas — Central de Música (v2.0.0).
 *
 * Faixa em destaque em loop infinito + playlist, via embeds do Spotify.
 * O loop usa a IFrame API do Spotify: ao chegar perto do fim, reinicia.
 */

import { h, empty } from '../utils/helpers.js';
import { SOUNDCLOUD_TRACKS } from '../data/soundcloud-tracks.js';

const TRACK_ID = '6Hv4AhlMTDgb6HGTvI0xlH';
const PLAYLIST_ID = '5wVcAsTvq2dQFZcqw3GJWN';

/* Faixas avulsas exibidas na seção "Músicas". Adicione mais IDs aqui. */
const EXTRA_TRACKS = ['4WZYBWngq9ODEqPB05WW7S'];

/* Carrega a IFrame API do Spotify uma única vez e compartilha. */
function ensureSpotifyAPI(cb) {
  if (window.__spotifyAPI) { cb(window.__spotifyAPI); return; }
  window.__spotifyCbs = window.__spotifyCbs || [];
  window.__spotifyCbs.push(cb);
  if (window.__spotifyApiLoading) return;
  window.__spotifyApiLoading = true;
  window.onSpotifyIframeApiReady = (API) => {
    window.__spotifyAPI = API;
    (window.__spotifyCbs || []).forEach((fn) => {
      try { fn(API); } catch {}
    });
    window.__spotifyCbs = [];
  };
  const s = document.createElement('script');
  s.src = 'https://open.spotify.com/embed/iframe-api/v1';
  s.async = true;
  document.head.appendChild(s);
}

/* Embed simples do Spotify (sem controle de loop). */
function plainEmbed(type, id, height) {
  return h('iframe', {
    className: 'musica-embed',
    src: `https://open.spotify.com/embed/${type}/${id}`,
    width: '100%',
    height: String(height),
    allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
    loading: 'lazy'
  });
}

/* ===== SoundCloud — faixas avulsas em loop (issues #167–#171) ===== */

/** Carrega a Widget API do SoundCloud uma única vez. */
function ensureSoundCloudAPI(cb) {
  if (window.SC && window.SC.Widget) { cb(); return; }
  window.__scCbs = window.__scCbs || [];
  window.__scCbs.push(cb);
  if (window.__scLoading) return;
  window.__scLoading = true;
  const s = document.createElement('script');
  s.src = 'https://w.soundcloud.com/player/api.js';
  s.async = true;
  s.onload = () => { (window.__scCbs || []).forEach((fn) => { try { fn(); } catch {} }); window.__scCbs = []; };
  document.head.appendChild(s);
}

/** Lista de faixas do SoundCloud + um player que toca a escolhida em LOOP. */
function soundcloudSection() {
  const wrap = h('div', { className: 'sc-section' });
  const playerHost = h('div', { className: 'sc-player' });
  const nowPlaying = h('div', { className: 'sc-now u-text-muted' },
    'Clique numa faixa: ela toca e recomeça sozinha (loop) até você pausar ou escolher outra.');
  let widget = null;
  let activeEl = null;

  function play(track, el) {
    if (activeEl) activeEl.classList.remove('is-active');
    activeEl = el;
    el.classList.add('is-active');
    nowPlaying.textContent = '♫ Em loop: ' + track.title + ' — ' + track.artist;
    if (!widget) {
      const src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(track.url)
        + '&color=%2300f0ff&auto_play=true&hide_related=true&show_comments=false&show_user=true&visual=false';
      const iframe = h('iframe', {
        className: 'sc-iframe', width: '100%', height: '140',
        allow: 'autoplay', frameborder: 'no', scrolling: 'no', src
      });
      empty(playerHost);
      playerHost.appendChild(iframe);
      ensureSoundCloudAPI(() => {
        try {
          widget = window.SC.Widget(iframe);
          /* loop: ao terminar, volta ao início e toca de novo (issue #171) */
          widget.bind(window.SC.Widget.Events.FINISH, () => {
            try { widget.seekTo(0); widget.play(); } catch {}
          });
        } catch {}
      });
    } else {
      try { widget.load(track.url, { auto_play: true, color: '#00f0ff', hide_related: true, show_comments: false }); } catch {}
    }
  }

  const list = h('div', { className: 'sc-list' });
  SOUNDCLOUD_TRACKS.forEach((t) => {
    const el = h('button', { className: 'sc-track', type: 'button', onclick: () => play(t, el) },
      t.cover
        ? h('img', { className: 'sc-track__cover', src: t.cover, loading: 'lazy', alt: '', referrerpolicy: 'no-referrer' })
        : h('span', { className: 'sc-track__cover sc-track__cover--icon' }, '♪'),
      h('div', { className: 'sc-track__meta' },
        h('div', { className: 'sc-track__title' }, t.title),
        h('div', { className: 'sc-track__artist u-text-muted' }, t.artist)),
      h('span', { className: 'sc-track__play' }, '▶'));
    list.appendChild(el);
  });

  wrap.append(playerHost, nowPlaying, list);
  return wrap;
}

export function musicasPage() {
  const fullPage = h('div', { className: 'page-musicas' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'MÍDIA'), h('span', null, '›'),
        h('span', null, 'MÚSICA')),
      h('h1', { className: 'page-header__title' }, '♪ Central de Música'),
      h('p', { className: 'page-header__description' },
        'A faixa em destaque toca em ',
        h('span', { className: 'u-text-cyan' }, 'loop infinito'),
        ' e logo abaixo está a playlist completa. Tudo via player do ',
        'Spotify — dê play em cada um.')
    )
  );

  /* ===== Faixa em destaque (loop) ===== */
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, '◆ Faixa em Destaque'))
  );

  const trackHost = h('div', { className: 'musica-host' });
  let fellBack = false;
  const fallbackTimer = setTimeout(() => {
    if (!trackHost.firstChild) {
      fellBack = true;
      trackHost.appendChild(plainEmbed('track', TRACK_ID, 152));
    }
  }, 5000);

  ensureSpotifyAPI((API) => {
    if (fellBack) return;
    clearTimeout(fallbackTimer);
    try {
      API.createController(
        trackHost,
        { uri: `spotify:track:${TRACK_ID}`, width: '100%', height: 152 },
        (controller) => {
          let cooldown = false;
          controller.addListener('playback_update', (e) => {
            const d = e && e.data;
            if (!d || !d.duration) return;
            /* posições em ms — reinicia pouco antes do fim = loop infinito */
            if (!cooldown && d.position >= d.duration - 900) {
              cooldown = true;
              try {
                if (typeof controller.restart === 'function') controller.restart();
                else { controller.seek(0); controller.play(); }
              } catch {}
              setTimeout(() => { cooldown = false; }, 2500);
            }
          });
        }
      );
    } catch {
      if (!trackHost.firstChild) trackHost.appendChild(plainEmbed('track', TRACK_ID, 152));
    }
  });

  fullPage.appendChild(trackHost);
  fullPage.appendChild(
    h('p', { className: 'musica-nota u-text-muted' },
      '↻ Em loop: ao chegar ao fim, a faixa recomeça sozinha enquanto você ',
      'estiver nesta aba. Se o player não tocar a faixa inteira, é limite do ',
      'Spotify para quem não está logado.')
  );

  /* ===== SoundCloud — minhas faixas (loop ao clicar) ===== */
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, '♫ SoundCloud — Minhas Faixas'),
      h('span', { className: 'section-header__count' }, String(SOUNDCLOUD_TRACKS.length)))
  );
  fullPage.appendChild(soundcloudSection());

  /* ===== Músicas (faixas avulsas) ===== */
  if (EXTRA_TRACKS.length) {
    fullPage.appendChild(
      h('div', { className: 'section-header' },
        h('h2', { className: 'section-header__title' }, '♫ Músicas'))
    );
    const grid = h('div', { className: 'musica-grid' });
    EXTRA_TRACKS.forEach((id) => grid.appendChild(
      h('div', { className: 'musica-host' }, plainEmbed('track', id, 152))));
    fullPage.appendChild(grid);
  }

  /* ===== Playlist ===== */
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, '◫ Playlist'))
  );
  fullPage.appendChild(
    h('div', { className: 'musica-host' }, plainEmbed('playlist', PLAYLIST_ID, 420))
  );

  return fullPage;
}
