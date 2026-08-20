/**
 * Página /filmes — Cinema do Baluarte.
 *
 * Mantém catálogo, busca, player modal via Google Drive e fechamento seguro
 * quando o operador clica fora do palco ou sai da rota.
 */

import '../styles/filmes.css';
import { h, cx, normalize, debounce, empty } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive';
import { FILMES, FILMES_TOTAL, filmeEmbedUrl } from '../data/filmes.js';
import type { Filme } from '../data/filmes.js';

let modalEl: HTMLDivElement | null = null;

function closeModal(): void {
  modalEl?.remove();
  modalEl = null;
}

function openPlayer(filme: Filme): void {
  closeModal();
  const frame = h('iframe', {
    className: 'filmes-player__frame',
    src: filmeEmbedUrl(filme.id),
    allow: 'autoplay; fullscreen',
    allowfullscreen: true,
  });
  const dialog = h('div', { className: 'filmes-player' },
    h('div', { className: 'filmes-player__bar' },
      h('span', { className: 'filmes-player__title' }, filme.titulo),
      h('button', { className: 'filmes-player__close', 'aria-label': 'Fechar', onclick: closeModal }, '✕'),
    ),
    h('div', { className: 'filmes-player__stage' }, frame),
    h('p', { className: 'filmes-player__hint u-text-muted' },
      'Não carregou? O arquivo precisa estar compartilhado como ',
      '"qualquer pessoa com o link" no Google Drive.',
    ),
  );
  modalEl = h('div', {
    className: 'filmes-overlay',
    onclick: (event: Event) => {
      if (event.target === modalEl) closeModal();
    },
  }, dialog);
  document.body.appendChild(modalEl);
}

export function filmesPage(): HTMLDivElement {
  const fullPage = h('div', { className: 'page-filmes' });
  let query = '';
  fullPage.appendChild(buildImmersiveHero({
    kicker: 'BALUARTE · MÍDIA · CINEMA',
    title: 'Cinema do Baluarte',
    sub: 'ACERVO DE FILMES',
    desc: [
      h('span', { className: 'u-text-cyan' }, `${FILMES_TOTAL} filmes`),
      ' no acervo. Clique num cartaz para abrir o player. Os vídeos são transmitidos direto do Google Drive.',
    ],
    hudLeft: '▤ CINEMA',
    hudRight: 'PLAYER',
  }));

  const searchInput = h('input', {
    className: 'input',
    type: 'search',
    placeholder: 'Buscar filme…',
    style: { marginBottom: '16px', width: '100%' },
    oninput: debounce((event: Event) => {
      if (event.target instanceof HTMLInputElement) {
        query = event.target.value;
        renderGrid();
      }
    }, 160),
  });
  fullPage.appendChild(searchInput);
  const grid = h('div', { className: 'filmes-grid' });
  const emptyMessage = h('div', { className: 'u-text-muted', style: { padding: '32px', textAlign: 'center' } }, 'Nenhum filme encontrado.');
  fullPage.appendChild(grid);
  fullPage.appendChild(emptyMessage);

  function filmeCard(filme: Filme): HTMLElement {
    return h('article', { className: 'filme-card', onclick: () => openPlayer(filme) },
      h('div', { className: 'filme-card__poster' },
        h('span', { className: 'filme-card__glyph' }, '▶'),
        h('span', { className: 'filme-card__genero' }, filme.genero || 'Filme'),
      ),
      h('div', { className: 'filme-card__body' },
        h('h3', { className: 'filme-card__titulo' }, filme.titulo),
        h('div', { className: 'filme-card__meta u-text-muted' }, filme.ano ? String(filme.ano) : 'Acervo'),
        h('p', { className: 'filme-card__sinopse' }, filme.sinopse),
      ),
    );
  }

  function renderGrid(): void {
    empty(grid);
    const normalizedQuery = normalize(query);
    const list = FILMES.filter((filme) => !normalizedQuery
      || normalize(`${filme.titulo} ${filme.genero} ${filme.sinopse}`).includes(normalizedQuery));
    list.forEach((filme) => grid.appendChild(filmeCard(filme)));
    emptyMessage.style.display = list.length ? 'none' : 'block';
  }

  renderGrid();
  const onHash = (): void => {
    if (!location.hash.startsWith('#/filmes')) {
      closeModal();
      window.removeEventListener('hashchange', onHash);
    }
  };
  window.addEventListener('hashchange', onHash);
  return fullPage;
}
