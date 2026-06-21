/**
 * Página /enciclopedia-militar — base de conhecimento militar navegável.
 * Lê o banco de dados src/data/militar-db.js (ramos, unidades, doutrina,
 * gastos SIPRI, eras tecnológicas…) e renderiza por categoria.
 */

import '../styles/enciclopedia-militar.css';
import { h, cx, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { MILITAR_CATEGORIAS, MILITAR_FONTES } from '../data/militar-db.js';

const KEY = 'militar-enc:cat';
let state = null;
let navEl = null;
let viewEl = null;

function maxOf(data) { return data.reduce((m, x) => Math.max(m, x.v || 0), 0) || 1; }

function renderContent(cat) {
  const frag = document.createDocumentFragment();
  frag.appendChild(h('h2', { className: 'mil-view__title' }, `${cat.icon} ${cat.titulo}`));
  const d = cat.data;

  if (cat.tipo === 'cards') {
    const grid = h('div', { className: 'mil-grid' });
    d.forEach((b) => grid.appendChild(
      h('div', { className: 'mil-card' },
        h('div', { className: 'mil-card__head' },
          h('span', { className: 'mil-card__icon' }, b.icon),
          h('span', { className: 'mil-card__name' }, b.nome),
          h('span', { className: 'badge badge--cyan' }, b.dominio)),
        h('p', { className: 'mil-card__desc' }, b.resumo))));
    frag.appendChild(grid);

  } else if (cat.tipo === 'battlespace') {
    const grid = h('div', { className: 'mil-grid' });
    d.forEach((b) => grid.appendChild(
      h('div', { className: 'mil-card' },
        h('div', { className: 'mil-card__name' }, b.nome),
        h('p', { className: 'mil-card__desc' }, b.resumo),
        h('div', { className: 'mil-tags' }, ...b.sub.map((s) => h('span', { className: 'mil-tag' }, s))))));
    frag.appendChild(grid);

  } else if (cat.tipo === 'units') {
    const tbl = h('div', { className: 'mil-table' });
    tbl.appendChild(h('div', { className: 'mil-table__row mil-table__row--head' },
      h('span', null, 'Unidade'), h('span', null, 'Efetivo'), h('span', null, 'Comando'), h('span', { className: 'u-mono' }, 'OTAN')));
    d.forEach((u) => tbl.appendChild(h('div', { className: 'mil-table__row' },
      h('span', null, u.nome), h('span', { className: 'u-text-muted' }, u.efetivo),
      h('span', { className: 'u-text-muted' }, u.comando), h('span', { className: 'u-mono u-text-cyan' }, u.simbolo))));
    frag.appendChild(tbl);

  } else if (cat.tipo === 'levels') {
    const grid = h('div', { className: 'mil-grid' });
    d.forEach((l) => grid.appendChild(h('div', { className: 'mil-card' },
      h('div', { className: 'mil-card__head' },
        h('span', { className: 'mil-card__name' }, l.nome),
        h('span', { className: 'badge badge--magenta' }, l.escopo)),
      h('p', { className: 'mil-card__desc' }, l.resumo))));
    frag.appendChild(grid);

  } else if (cat.tipo === 'eras') {
    const tl = h('div', { className: 'mil-timeline' });
    d.forEach((e) => tl.appendChild(h('div', { className: 'mil-tl__item' },
      h('div', { className: 'mil-tl__dot' }),
      h('div', null, h('div', { className: 'mil-tl__era' }, e.era), h('div', { className: 'mil-tl__marco u-text-muted' }, e.marco)))));
    frag.appendChild(tl);

  } else if (cat.tipo === 'rank-pct' || cat.tipo === 'rank-bi') {
    const max = maxOf(d);
    const unit = cat.tipo === 'rank-pct' ? '%' : ' bi';
    const list = h('div', { className: 'mil-rank' });
    d.forEach((r, i) => {
      const bar = h('span', { className: 'mil-rank__bar', style: { width: Math.round((r.v / max) * 100) + '%' } });
      list.appendChild(h('div', { className: 'mil-rank__row' },
        h('span', { className: 'mil-rank__pos u-mono' }, String(i + 1).padStart(2, '0')),
        h('span', { className: 'mil-rank__pais' }, r.pais),
        h('span', { className: 'mil-rank__track' }, bar),
        h('span', { className: 'mil-rank__val u-mono u-text-cyan' }, (cat.tipo === 'rank-bi' ? '$' : '') + r.v + unit)));
    });
    frag.appendChild(list);

  } else { /* list: { nome, resumo } */
    const grid = h('div', { className: 'mil-grid' });
    d.forEach((it) => grid.appendChild(h('div', { className: 'mil-card' },
      h('div', { className: 'mil-card__name' }, it.nome),
      h('p', { className: 'mil-card__desc' }, it.resumo))));
    frag.appendChild(grid);
  }

  return frag;
}

function renderView() {
  if (!viewEl) return;
  empty(viewEl);
  const cat = MILITAR_CATEGORIAS.find((c) => c.id === state) || MILITAR_CATEGORIAS[0];
  viewEl.appendChild(renderContent(cat));
  viewEl.appendChild(h('p', { className: 'mil-fontes u-text-muted' }, '⚖ ' + MILITAR_FONTES));
}

function renderNav() {
  if (!navEl) return;
  empty(navEl);
  MILITAR_CATEGORIAS.forEach((c) => {
    navEl.appendChild(h('button', {
      className: cx('mil-nav__item', state === c.id && 'is-active'),
      onclick: () => { state = c.id; storage.set(KEY, state); renderNav(); renderView(); viewEl?.scrollTo({ top: 0 }); }
    }, h('span', { className: 'mil-nav__icon' }, c.icon), h('span', null, c.titulo)));
  });
}

export function enciclopediaMilitarPage() {
  state = storage.get(KEY) || MILITAR_CATEGORIAS[0].id;

  const page = h('div', { className: 'page-militar-enc' });
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'MILITAR'), h('span', null, '›'), h('span', null, 'ENCICLOPÉDIA')),
      h('h1', { className: 'page-header__title' }, '🎖 Enciclopédia Militar'),
      h('p', { className: 'page-header__description' },
        'Base de conhecimento da Seção Militar — ',
        h('span', { className: 'u-text-cyan' }, `${MILITAR_CATEGORIAS.length} categorias`),
        ': ramos, unidades, doutrina, táticas, gastos (SIPRI) e a evolução tecnológica.'))
  );

  navEl = h('div', { className: 'mil-nav' });
  viewEl = h('div', { className: 'mil-view' });
  page.appendChild(h('div', { className: 'mil-layout' }, navEl, viewEl));

  renderNav();
  renderView();
  return page;
}
