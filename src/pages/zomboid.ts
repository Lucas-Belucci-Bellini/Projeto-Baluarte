import '../styles/zomboid.css';
import { h } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { buildImmersiveHero } from '../utils/immersive';
import { ZOMBOID_COLLECTION as collection, ZOMBOID_CATEGORIES } from '../data/zomboid-mods.js';

export function zomboidPage(): HTMLDivElement {
  const page = h('div', { className: 'page-zomboid' });
  page.appendChild(buildImmersiveHero({ kicker: 'BALUARTE · MODPACK', title: collection.name.toUpperCase(), sub: `${collection.game.toUpperCase()} · ${collection.total} MODS`, variant: 'reactor', accent2: '#8bc34a', desc: [collection.tagline], hudLeft: '🧟 PROJECT ZOMBOID', hudRight: `${collection.total} MODS` }));
  const box = h('div', { className: 'pz' });
  page.appendChild(box);
  box.appendChild(h('div', { className: 'pz-meta' }, h('span', { className: 'pz-chip' }, '🎮 ', h('strong', null, collection.game)), h('span', { className: 'pz-chip' }, '👤 ', h('strong', null, collection.author)), h('span', { className: 'pz-chip' }, '📦 ', h('strong', null, `${collection.total}`), ' mods')));
  box.appendChild(h('p', { className: 'u-text-secondary' }, collection.desc));
  box.appendChild(h('div', { className: 'pz-actions' }, h('a', { className: 'pz-cta', href: collection.url, target: '_blank', rel: 'noopener' }, '⬈ Abrir a coleção na Steam Workshop'), h('button', { className: 'pz-cta pz-cta--ghost', onclick: (): void => router.navigate('/zomboid-admin') }, '⌘ Administração de servidor')));
  for (const category of ZOMBOID_CATEGORIES) {
    const section = h('section', { className: 'pz-cat' }, h('div', { className: 'pz-cat__head' }, h('span', { className: 'pz-cat__title' }, `${category.icon} ${category.label}`), h('span', { className: 'pz-cat__desc' }, category.desc)));
    const grid = h('div', { className: 'pz-grid' });
    for (const mod of category.mods) grid.appendChild(h('div', { className: 'pz-mod' }, h('div', { className: 'pz-mod__name' }, mod.name), h('div', { className: 'pz-mod__author' }, `por ${mod.author}`)));
    section.appendChild(grid); box.appendChild(section);
  }
  box.appendChild(h('div', { className: 'pz-note' }, 'Estes são ', h('strong', null, 'destaques'), ' da coleção — a lista completa dos ', `${collection.total} mods `, 'fica na ', h('a', { href: collection.url, target: '_blank', rel: 'noopener', className: 'u-text-cyan' }, 'página da Steam'), '. Todos os mods são de seus respectivos autores; esta página é apenas uma vitrine da curadoria do ', h('strong', null, collection.author), '.'));
  return page;
}
