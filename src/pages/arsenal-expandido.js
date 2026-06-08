/**
 * /arsenal-expandido — Arsenal Militar Expandido
 * Armas por categoria — dados no banco src/data/arsenal-expandido-db.js
 * (infantaria, blindados, artilharia, aéreo, naval, mísseis e drones).
 */

import { h } from '../utils/helpers.js';
import { ARSX_CATEGORIAS as CATEGORIAS, ARSX_ARSENAL as ARSENAL } from '../data/arsenal-expandido-db.js';

export function arsenalExpandidoPage() {
  let activeCat = 'infantaria';
  let search = '';

  const tabBar = h('div', { className: 'arsx-tabs' });
  const tabBtns = {};
  const grid = h('div', { className: 'arsx-grid' });
  const searchEl = h('input', {
    type: 'search', placeholder: '🔍 Buscar arma…', className: 'forcas-search',
    oninput: e => { search = e.target.value.toLowerCase(); render(); }
  });

  function render() {
    grid.innerHTML = '';
    const items = ARSENAL[activeCat].filter(w =>
      w.nome.toLowerCase().includes(search) ||
      w.origem.toLowerCase().includes(search) ||
      w.tipo.toLowerCase().includes(search)
    );
    if (!items.length) {
      grid.appendChild(h('p', { className: 'arsx-empty' }, 'Nenhuma arma encontrada.'));
      return;
    }
    for (const w of items) {
      grid.appendChild(
        h('div', { className: 'arsx-card' },
          h('div', { className: 'arsx-card__head' },
            h('span', { className: 'arsx-card__name' }, w.nome),
            h('span', { className: 'arsx-card__year' }, w.ano)
          ),
          h('div', { className: 'arsx-card__origem' }, w.origem),
          h('div', { className: 'arsx-card__type' }, w.tipo),
          h('div', { className: 'arsx-specs' },
            h('div', { className: 'arsx-spec' }, h('span', null, 'Calibre/Arma'), h('strong', null, w.calibre)),
            h('div', { className: 'arsx-spec' }, h('span', null, 'Alcance'), h('strong', null, w.alcance))
          ),
          h('p', { className: 'arsx-card__nota' }, w.nota)
        )
      );
    }
  }

  for (const cat of CATEGORIAS) {
    const btn = h('button', {
      className: `arsx-tab${cat.id === activeCat ? ' is-active' : ''}`,
      onclick: () => {
        tabBtns[activeCat].classList.remove('is-active');
        activeCat = cat.id;
        tabBtns[cat.id].classList.add('is-active');
        render();
      }
    }, `${cat.icon} ${cat.label}`);
    tabBtns[cat.id] = btn;
    tabBar.appendChild(btn);
  }

  render();

  const total = Object.values(ARSENAL).reduce((s, a) => s + a.length, 0);

  return h('div', { className: 'arsx-page page-wrap' },
    h('div', { className: 'page-hero' },
      h('h1', null, '⚔ Arsenal Expandido'),
      h('p', { className: 'u-text-muted' }, `${total} sistemas de armas em ${CATEGORIAS.length} categorias — infantaria, blindados, artilharia, aéreo, naval, mísseis e drones.`)
    ),
    tabBar,
    h('div', { className: 'forcas-controls' }, searchEl),
    grid
  );
}
