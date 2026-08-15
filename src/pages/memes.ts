/**
 * Página /memes — Arquivo de Memes 2016.
 *
 * Mantém o catálogo curado, estatísticas, busca e filtros por categoria.
 */

import '../styles/memes.css';
import { h, cx, normalize, debounce, empty } from '../utils/helpers.js';
import { MEMES_2016, MEME_CATEGORIES } from '../data/memes.js';
import type { Meme2016 } from '../data/memes.js';

const TIER_LABEL: Record<string, string> = {
  lendario: 'LENDÁRIO',
  classico: 'CLÁSSICO',
  viral: 'VIRAL',
};

export function memesPage(): HTMLDivElement {
  const fullPage = h('div', { className: 'page-memes' });
  let activeCategory = 'todos';
  let query = '';

  fullPage.appendChild(h('div', {
    className: 'page-header anim-fade-in', style: { marginBottom: '12px' },
  },
  h('div', { className: 'page-header__crumbs' },
    h('span', null, 'BALUARTE'), h('span', null, '›'),
    h('span', null, 'MÍDIA'), h('span', null, '›'), h('span', null, 'ARQUIVO DE MEMES'),
  ),
  h('h1', { className: 'page-header__title' }, '◫ Arquivo de Memes — 2016'),
  h('p', { className: 'page-header__description' },
    'Lembrança dos velhos tempos. ', h('span', { className: 'u-text-cyan' }, `${MEMES_2016.length} memes`),
    ' que dominaram a internet em ', h('span', { className: 'u-text-magenta' }, '2016'),
    ' — o ano em que rir online virou esporte coletivo. Origem, contexto e a frase que ficou.',
  ),
  ));

  const legendaryCount = MEMES_2016.filter((meme) => meme.tier === 'lendario').length;
  fullPage.appendChild(h('div', { className: 'memes-stats' },
    h('div', { className: 'memes-stat' },
      h('div', { className: 'memes-stat__value' }, String(MEMES_2016.length)),
      h('div', { className: 'memes-stat__label' }, 'Memes catalogados'),
    ),
    h('div', { className: 'memes-stat' },
      h('div', { className: 'memes-stat__value' }, String(legendaryCount)),
      h('div', { className: 'memes-stat__label' }, 'Tier lendário'),
    ),
    h('div', { className: 'memes-stat' },
      h('div', { className: 'memes-stat__value' }, '2016'),
      h('div', { className: 'memes-stat__label' }, 'Ano de ouro'),
    ),
    h('div', { className: 'memes-stat' },
      h('div', { className: 'memes-stat__value' }, String(MEME_CATEGORIES.length - 1)),
      h('div', { className: 'memes-stat__label' }, 'Categorias'),
    ),
  ));

  const searchInput = h('input', {
    className: 'input memes-search',
    type: 'search',
    placeholder: 'Buscar meme, frase ou origem…',
    oninput: debounce((event: Event) => {
      if (event.target instanceof HTMLInputElement) {
        query = event.target.value;
        renderGrid();
      }
    }, 160),
  });
  const filterBar = h('div', { className: 'memes-filters' });
  MEME_CATEGORIES.forEach((category) => {
    filterBar.appendChild(h('button', {
      className: cx('memes-filter', category.id === activeCategory && 'is-active'),
      'data-cat': category.id,
      onclick: () => {
        activeCategory = category.id;
        document.querySelectorAll('.memes-filter').forEach((button) => {
          if (button instanceof HTMLElement) button.classList.toggle('is-active', button.dataset.cat === category.id);
        });
        renderGrid();
      },
    }, category.label));
  });
  fullPage.appendChild(h('div', { className: 'memes-toolbar' }, searchInput, filterBar));

  const grid = h('div', { className: 'memes-grid' });
  const emptyMessage = h('div', { className: 'memes-empty u-text-muted' }, 'Nenhum meme encontrado nesse filtro.');
  fullPage.appendChild(grid);
  fullPage.appendChild(emptyMessage);

  function memeCard(meme: Meme2016): HTMLElement {
    const categoryLabel = MEME_CATEGORIES.find((category) => category.id === meme.categoria)?.label ?? meme.categoria;
    return h('article', { className: cx('meme-card', `meme-card--${meme.tier}`) },
      h('div', { className: 'meme-card__head' },
        h('span', { className: 'meme-card__glyph' }, meme.glyph),
        h('div', { className: 'meme-card__head-text' },
          h('h3', { className: 'meme-card__name' }, meme.nome),
          h('div', { className: 'meme-card__meta' },
            h('span', { className: 'meme-card__when' }, meme.quando),
            h('span', { className: 'meme-card__cat' }, categoryLabel),
          ),
        ),
        h('span', { className: cx('meme-card__tier', `meme-card__tier--${meme.tier}`) }, TIER_LABEL[meme.tier] || meme.tier),
      ),
      h('div', { className: 'meme-card__quote' }, `“${meme.frase}”`),
      h('p', { className: 'meme-card__origin' },
        h('span', { className: 'meme-card__origin-label' }, 'ORIGEM  '), meme.origem,
      ),
      h('p', { className: 'meme-card__desc' }, meme.descricao),
    );
  }

  function renderGrid(): void {
    empty(grid);
    const normalizedQuery = normalize(query);
    const list = MEMES_2016.filter((meme) => {
      if (activeCategory !== 'todos' && meme.categoria !== activeCategory) return false;
      if (!normalizedQuery) return true;
      return normalize(`${meme.nome} ${meme.frase} ${meme.origem} ${meme.descricao}`).includes(normalizedQuery);
    });
    list.forEach((meme) => grid.appendChild(memeCard(meme)));
    emptyMessage.style.display = list.length ? 'none' : 'block';
  }

  renderGrid();
  return fullPage;
}
