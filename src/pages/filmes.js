/**
 * Página /filmes — Cinema do Baluarte (v2.0.0).
 *
 * Catálogo de filmes do acervo. Cada um abre num player modal que
 * embute o vídeo via Google Drive.
 */

import '../styles/filmes.css';
import { h, cx, normalize, debounce, empty } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive.js';
import { FILMES, FILMES_TOTAL, filmeEmbedUrl } from '../data/filmes.js';

let modalEl = null;

function closeModal() {
  if (modalEl) {
    modalEl.remove();
    modalEl = null;
  }
}

function openPlayer(filme) {
  closeModal();

  const frame = h('iframe', {
    className: 'filmes-player__frame',
    src: filmeEmbedUrl(filme.id),
    allow: 'autoplay; fullscreen',
    allowfullscreen: 'true'
  });

  const dialog = h('div', { className: 'filmes-player' },
    h('div', { className: 'filmes-player__bar' },
      h('span', { className: 'filmes-player__title' }, filme.titulo),
      h('button', {
        className: 'filmes-player__close', 'aria-label': 'Fechar', onclick: closeModal
      }, '✕')
    ),
    h('div', { className: 'filmes-player__stage' }, frame),
    h('p', { className: 'filmes-player__hint u-text-muted' },
      'Não carregou? O arquivo precisa estar compartilhado como ',
      '"qualquer pessoa com o link" no Google Drive.')
  );

  modalEl = h('div', {
    className: 'filmes-overlay',
    onclick: (e) => { if (e.target === modalEl) closeModal(); }
  }, dialog);

  document.body.appendChild(modalEl);
}

export function filmesPage() {
  const fullPage = h('div', { className: 'page-filmes' });
  let query = '';

  fullPage.appendChild(
    buildImmersiveHero({
      kicker: 'BALUARTE · MÍDIA · CINEMA',
      title: 'Cinema do Baluarte',
      sub: 'ACERVO DE FILMES',
      desc: [
        h('span', { className: 'u-text-cyan' }, `${FILMES_TOTAL} filmes`),
        ' no acervo. Clique num cartaz para abrir o player. ',
        'Os vídeos são transmitidos direto do Google Drive.'
      ],
      hudLeft: '▤ CINEMA', hudRight: 'PLAYER'
    })
  );

  const searchInput = h('input', {
    className: 'input',
    type: 'search',
    placeholder: 'Buscar filme…',
    style: { marginBottom: '16px', width: '100%' },
    oninput: debounce((e) => { query = e.target.value; renderGrid(); }, 160)
  });
  fullPage.appendChild(searchInput);

  const grid = h('div', { className: 'filmes-grid' });
  const emptyMsg = h('div', { className: 'u-text-muted', style: { padding: '32px', textAlign: 'center' } },
    'Nenhum filme encontrado.');
  fullPage.appendChild(grid);
  fullPage.appendChild(emptyMsg);

  function filmeCard(f) {
    return h('article', {
      className: 'filme-card',
      onclick: () => openPlayer(f)
    },
      h('div', { className: 'filme-card__poster' },
        h('span', { className: 'filme-card__glyph' }, '▶'),
        h('span', { className: 'filme-card__genero' }, f.genero || 'Filme')
      ),
      h('div', { className: 'filme-card__body' },
        h('h3', { className: 'filme-card__titulo' }, f.titulo),
        h('div', { className: 'filme-card__meta u-text-muted' }, f.ano ? String(f.ano) : 'Acervo'),
        h('p', { className: 'filme-card__sinopse' }, f.sinopse)
      )
    );
  }

  function renderGrid() {
    empty(grid);
    const q = normalize(query);
    const list = FILMES.filter((f) =>
      !q || normalize(`${f.titulo} ${f.genero} ${f.sinopse}`).includes(q)
    );
    list.forEach((f) => grid.appendChild(filmeCard(f)));
    emptyMsg.style.display = list.length ? 'none' : 'block';
  }

  renderGrid();

  /* Fecha o player ao sair da rota */
  const onHash = () => {
    if (!location.hash.startsWith('#/filmes')) {
      closeModal();
      window.removeEventListener('hashchange', onHash);
    }
  };
  window.addEventListener('hashchange', onHash);

  return fullPage;
}
