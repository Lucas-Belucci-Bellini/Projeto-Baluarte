/**
 * Página /memes — Arquivo de Memes 2016 (v2.0.0).
 *
 * "Lembrança dos velhos tempos" — catálogo curado dos memes que
 * dominaram a internet em 2016. Filtro por categoria + busca.
 */

import { h, cx, normalize, debounce, empty } from '../utils/helpers.js';
import { MEMES_2016, MEME_CATEGORIES } from '../data/memes.js';

const TIER_LABEL = {
  lendario: 'LENDÁRIO',
  classico: 'CLÁSSICO',
  viral: 'VIRAL'
};

export function memesPage() {
  const fullPage = h('div', { className: 'page-memes' });

  let activeCat = 'todos';
  let query = '';

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'MÍDIA'), h('span', null, '›'),
        h('span', null, 'ARQUIVO DE MEMES')
      ),
      h('h1', { className: 'page-header__title' }, '◫ Arquivo de Memes — 2016'),
      h('p', { className: 'page-header__description' },
        'Lembrança dos velhos tempos. ',
        h('span', { className: 'u-text-cyan' }, `${MEMES_2016.length} memes`),
        ' que dominaram a internet em ',
        h('span', { className: 'u-text-magenta' }, '2016'),
        ' — o ano em que rir online virou esporte coletivo. Origem, contexto e a frase que ficou.'
      )
    )
  );

  /* ===== Faixa de estatísticas ===== */
  const lendarios = MEMES_2016.filter((m) => m.tier === 'lendario').length;
  fullPage.appendChild(
    h('div', { className: 'memes-stats' },
      h('div', { className: 'memes-stat' },
        h('div', { className: 'memes-stat__value' }, String(MEMES_2016.length)),
        h('div', { className: 'memes-stat__label' }, 'Memes catalogados')),
      h('div', { className: 'memes-stat' },
        h('div', { className: 'memes-stat__value' }, String(lendarios)),
        h('div', { className: 'memes-stat__label' }, 'Tier lendário')),
      h('div', { className: 'memes-stat' },
        h('div', { className: 'memes-stat__value' }, '2016'),
        h('div', { className: 'memes-stat__label' }, 'Ano de ouro')),
      h('div', { className: 'memes-stat' },
        h('div', { className: 'memes-stat__value' }, String(MEME_CATEGORIES.length - 1)),
        h('div', { className: 'memes-stat__label' }, 'Categorias'))
    )
  );

  /* ===== Controles ===== */
  const searchInput = h('input', {
    className: 'input memes-search',
    type: 'search',
    placeholder: 'Buscar meme, frase ou origem…',
    oninput: debounce((e) => { query = e.target.value; renderGrid(); }, 160)
  });

  const filterBar = h('div', { className: 'memes-filters' });
  MEME_CATEGORIES.forEach((cat) => {
    filterBar.appendChild(
      h('button', {
        className: cx('memes-filter', cat.id === activeCat && 'is-active'),
        'data-cat': cat.id,
        onclick: () => {
          activeCat = cat.id;
          document.querySelectorAll('.memes-filter').forEach((b) =>
            b.classList.toggle('is-active', b.dataset.cat === cat.id));
          renderGrid();
        }
      }, cat.label)
    );
  });

  fullPage.appendChild(
    h('div', { className: 'memes-toolbar' }, searchInput, filterBar)
  );

  /* ===== Grade ===== */
  const grid = h('div', { className: 'memes-grid' });
  const emptyMsg = h('div', { className: 'memes-empty u-text-muted' },
    'Nenhum meme encontrado nesse filtro.');
  fullPage.appendChild(grid);
  fullPage.appendChild(emptyMsg);

  function memeCard(m) {
    const catLabel = (MEME_CATEGORIES.find((c) => c.id === m.categoria) || {}).label || m.categoria;
    return h('article', { className: cx('meme-card', `meme-card--${m.tier}`) },
      h('div', { className: 'meme-card__head' },
        h('span', { className: 'meme-card__glyph' }, m.glyph),
        h('div', { className: 'meme-card__head-text' },
          h('h3', { className: 'meme-card__name' }, m.nome),
          h('div', { className: 'meme-card__meta' },
            h('span', { className: 'meme-card__when' }, m.quando),
            h('span', { className: 'meme-card__cat' }, catLabel))
        ),
        h('span', { className: cx('meme-card__tier', `meme-card__tier--${m.tier}`) },
          TIER_LABEL[m.tier] || m.tier)
      ),
      h('div', { className: 'meme-card__quote' }, `“${m.frase}”`),
      h('p', { className: 'meme-card__origin' },
        h('span', { className: 'meme-card__origin-label' }, 'ORIGEM  '),
        m.origem),
      h('p', { className: 'meme-card__desc' }, m.descricao)
    );
  }

  function renderGrid() {
    empty(grid);
    const q = normalize(query);
    const list = MEMES_2016.filter((m) => {
      if (activeCat !== 'todos' && m.categoria !== activeCat) return false;
      if (!q) return true;
      return normalize(`${m.nome} ${m.frase} ${m.origem} ${m.descricao}`).includes(q);
    });
    list.forEach((m) => grid.appendChild(memeCard(m)));
    emptyMsg.style.display = list.length ? 'none' : 'block';
  }

  renderGrid();
  return fullPage;
}
