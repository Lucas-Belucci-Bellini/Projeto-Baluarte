/**
 * /zomboid — vitrine da coleção "alfa" de Project Zomboid (Spartan Gamer BR).
 *
 * Modpack militar tático (159 mods) reunido pelo operador na Steam Workshop,
 * espelhado aqui no Baluarte: metadados + destaques por frente + link direto
 * pra coleção. Data-driven (`src/data/zomboid-mods.js`).
 */

import '../styles/zomboid.css';
import { h } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { buildImmersiveHero } from '../utils/immersive.js';
import { ZOMBOID_COLLECTION as C, ZOMBOID_CATEGORIES } from '../data/zomboid-mods.js';

export function zomboidPage() {
  const page = h('div', { className: 'page-zomboid' });

  page.appendChild(buildImmersiveHero({
    kicker: 'BALUARTE · MODPACK',
    title: C.name.toUpperCase(),
    sub: `${C.game.toUpperCase()} · ${C.total} MODS`,
    variant: 'reactor',
    accent2: '#8bc34a',
    desc: [C.tagline],
    hudLeft: '🧟 PROJECT ZOMBOID',
    hudRight: `${C.total} MODS`
  }));

  const box = h('div', { className: 'pz' });
  page.appendChild(box);

  box.appendChild(h('div', { className: 'pz-meta' },
    h('span', { className: 'pz-chip' }, '🎮 ', h('strong', null, C.game)),
    h('span', { className: 'pz-chip' }, '👤 ', h('strong', null, C.author)),
    h('span', { className: 'pz-chip' }, '📦 ', h('strong', null, `${C.total}`), ' mods')
  ));

  box.appendChild(h('p', { className: 'u-text-secondary' }, C.desc));

  box.appendChild(h('div', { className: 'pz-actions' },
    h('a', {
      className: 'pz-cta', href: C.url, target: '_blank', rel: 'noopener'
    }, '⬈ Abrir a coleção na Steam Workshop'),
    h('button', {
      className: 'pz-cta pz-cta--ghost', onclick: () => router.navigate('/zomboid-admin')
    }, '⌘ Administração de servidor')));

  /* destaques por frente */
  for (const cat of ZOMBOID_CATEGORIES) {
    const sec = h('section', { className: 'pz-cat' },
      h('div', { className: 'pz-cat__head' },
        h('span', { className: 'pz-cat__title' }, `${cat.icon} ${cat.label}`),
        h('span', { className: 'pz-cat__desc' }, cat.desc)));
    const grid = h('div', { className: 'pz-grid' });
    for (const m of cat.mods) {
      grid.appendChild(h('div', { className: 'pz-mod' },
        h('div', { className: 'pz-mod__name' }, m.name),
        h('div', { className: 'pz-mod__author' }, `por ${m.author}`)));
    }
    sec.appendChild(grid);
    box.appendChild(sec);
  }

  box.appendChild(h('div', { className: 'pz-note' },
    'Estes são ', h('strong', null, 'destaques'), ' da coleção — a lista completa dos ',
    `${C.total} mods `, 'fica na ',
    h('a', { href: C.url, target: '_blank', rel: 'noopener', className: 'u-text-cyan' }, 'página da Steam'),
    '. Todos os mods são de seus respectivos autores; esta página é apenas uma vitrine da curadoria do ',
    h('strong', null, C.author), '.'));

  return page;
}
