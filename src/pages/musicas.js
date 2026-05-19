/**
 * Página /musicas — Central de Música (v2.0.0).
 *
 * Faixa em destaque em loop infinito + playlist, via embeds do Spotify.
 * O loop usa a IFrame API do Spotify: ao chegar perto do fim, reinicia.
 */

import { h } from '../utils/helpers.js';

const TRACK_ID = '6Hv4AhlMTDgb6HGTvI0xlH';
const PLAYLIST_ID = '5wVcAsTvq2dQFZcqw3GJWN';

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
