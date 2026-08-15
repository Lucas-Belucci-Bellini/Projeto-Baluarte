import '../styles/militar.css';
import { h } from '../utils/helpers.js';
import arsenalData from '../data/arsenal-expandido.json';

type CategoryId = keyof typeof arsenalData.arsenal;
const CATEGORIAS = arsenalData.categorias;
const ARSENAL = arsenalData.arsenal;

export function arsenalExpandidoPage(): HTMLDivElement {
  const firstCategory = CATEGORIAS[0];
  const initialCategory: CategoryId = firstCategory?.id as CategoryId;
  let activeCat: CategoryId = initialCategory;
  let search = '';
  const tabBar = h('div', { className: 'arsx-tabs' });
  const tabBtns: Partial<Record<CategoryId, HTMLButtonElement>> = {};
  const grid = h('div', { className: 'arsx-grid' });
  const searchEl = h('input', { type: 'search', placeholder: '🔍 Buscar arma…', className: 'forcas-search', oninput: (event: Event): void => { if (event.target instanceof HTMLInputElement) { search = event.target.value.toLowerCase(); render(); } } });
  function render(): void {
    grid.innerHTML = '';
    const items = ARSENAL[activeCat].filter((weapon) => weapon.nome.toLowerCase().includes(search) || weapon.origem.toLowerCase().includes(search) || weapon.tipo.toLowerCase().includes(search));
    if (!items.length) { grid.appendChild(h('p', { className: 'arsx-empty' }, 'Nenhuma arma encontrada.')); return; }
    items.forEach((weapon) => grid.appendChild(h('div', { className: 'arsx-card' }, h('div', { className: 'arsx-card__head' }, h('span', { className: 'arsx-card__name' }, weapon.nome), h('span', { className: 'arsx-card__year' }, weapon.ano)), h('div', { className: 'arsx-card__origem' }, weapon.origem), h('div', { className: 'arsx-card__type' }, weapon.tipo), h('div', { className: 'arsx-specs' }, h('div', { className: 'arsx-spec' }, h('span', null, 'Calibre/Arma'), h('strong', null, weapon.calibre)), h('div', { className: 'arsx-spec' }, h('span', null, 'Alcance'), h('strong', null, weapon.alcance))), h('p', { className: 'arsx-card__nota' }, weapon.nota))));
  }
  CATEGORIAS.forEach((category) => {
    const categoryId = category.id as CategoryId;
    const button = h('button', { className: `arsx-tab${categoryId === activeCat ? ' is-active' : ''}`, onclick: (): void => { tabBtns[activeCat]?.classList.remove('is-active'); activeCat = categoryId; tabBtns[categoryId]?.classList.add('is-active'); render(); } }, `${category.icon} ${category.label}`);
    tabBtns[categoryId] = button; tabBar.appendChild(button);
  });
  render();
  const total = Object.values(ARSENAL).reduce((sum, weapons) => sum + weapons.length, 0);
  return h('div', { className: 'arsx-page page-wrap' }, h('div', { className: 'page-hero' }, h('h1', null, '⚔ Arsenal Expandido'), h('p', { className: 'u-text-muted' }, `${total} sistemas de armas em ${CATEGORIAS.length} categorias — infantaria, blindados, artilharia, aéreo, naval, mísseis e drones.`)), tabBar, h('div', { className: 'forcas-controls' }, searchEl), grid);
}
