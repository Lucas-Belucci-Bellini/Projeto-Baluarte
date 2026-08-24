/**
 * /armas-por-pais — catálogo filtrável de sistemas de armas.
 */

import '../styles/militar.css';
import { h } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive';

interface ArmaCatalogo {
  nome: string;
  pais: string;
  bandeira: string;
  tipo: string;
  epoca: string;
  ano: number;
  status: 'Ativo' | 'Legado';
}

const ARMAS: readonly ArmaCatalogo[] = [
  { nome: 'M16/M4', pais: 'EUA', bandeira: '🇺🇸', tipo: 'Infantaria', epoca: 'Moderna', ano: 1964, status: 'Ativo' },
  { nome: 'M1 Abrams', pais: 'EUA', bandeira: '🇺🇸', tipo: 'Blindado', epoca: 'Moderna', ano: 1980, status: 'Ativo' },
  { nome: 'F-22 Raptor', pais: 'EUA', bandeira: '🇺🇸', tipo: 'Aéreo', epoca: 'Moderna', ano: 2005, status: 'Ativo' },
  { nome: 'F-35', pais: 'EUA', bandeira: '🇺🇸', tipo: 'Aéreo', epoca: 'Moderna', ano: 2015, status: 'Ativo' },
  { nome: 'Tomahawk', pais: 'EUA', bandeira: '🇺🇸', tipo: 'Míssil', epoca: 'Moderna', ano: 1983, status: 'Ativo' },
  { nome: 'Classe Nimitz', pais: 'EUA', bandeira: '🇺🇸', tipo: 'Naval', epoca: 'Moderna', ano: 1975, status: 'Ativo' },
  { nome: 'AK-47', pais: 'Rússia', bandeira: '🇷🇺', tipo: 'Infantaria', epoca: 'Guerra Fria', ano: 1949, status: 'Legado' },
  { nome: 'AK-12', pais: 'Rússia', bandeira: '🇷🇺', tipo: 'Infantaria', epoca: 'Moderna', ano: 2018, status: 'Ativo' },
  { nome: 'T-90', pais: 'Rússia', bandeira: '🇷🇺', tipo: 'Blindado', epoca: 'Moderna', ano: 1992, status: 'Ativo' },
  { nome: 'T-14 Armata', pais: 'Rússia', bandeira: '🇷🇺', tipo: 'Blindado', epoca: 'Moderna', ano: 2015, status: 'Ativo' },
  { nome: 'Su-57', pais: 'Rússia', bandeira: '🇷🇺', tipo: 'Aéreo', epoca: 'Moderna', ano: 2020, status: 'Ativo' },
  { nome: 'S-400', pais: 'Rússia', bandeira: '🇷🇺', tipo: 'Míssil', epoca: 'Moderna', ano: 2007, status: 'Ativo' },
  { nome: 'Kinzhal', pais: 'Rússia', bandeira: '🇷🇺', tipo: 'Míssil', epoca: 'Moderna', ano: 2018, status: 'Ativo' },
  { nome: 'QBZ-191', pais: 'China', bandeira: '🇨🇳', tipo: 'Infantaria', epoca: 'Moderna', ano: 2019, status: 'Ativo' },
  { nome: 'Type 99A', pais: 'China', bandeira: '🇨🇳', tipo: 'Blindado', epoca: 'Moderna', ano: 2011, status: 'Ativo' },
  { nome: 'J-20', pais: 'China', bandeira: '🇨🇳', tipo: 'Aéreo', epoca: 'Moderna', ano: 2017, status: 'Ativo' },
  { nome: 'DF-41', pais: 'China', bandeira: '🇨🇳', tipo: 'Míssil', epoca: 'Moderna', ano: 2017, status: 'Ativo' },
  { nome: 'Type 055', pais: 'China', bandeira: '🇨🇳', tipo: 'Naval', epoca: 'Moderna', ano: 2020, status: 'Ativo' },
  { nome: 'Leopard 2', pais: 'Alemanha', bandeira: '🇩🇪', tipo: 'Blindado', epoca: 'Moderna', ano: 1979, status: 'Ativo' },
  { nome: 'HK416', pais: 'Alemanha', bandeira: '🇩🇪', tipo: 'Infantaria', epoca: 'Moderna', ano: 2004, status: 'Ativo' },
  { nome: 'G3', pais: 'Alemanha', bandeira: '🇩🇪', tipo: 'Infantaria', epoca: 'Guerra Fria', ano: 1958, status: 'Legado' },
  { nome: 'Challenger 2', pais: 'Reino Unido', bandeira: '🇬🇧', tipo: 'Blindado', epoca: 'Moderna', ano: 1998, status: 'Ativo' },
  { nome: 'Eurofighter', pais: 'Reino Unido', bandeira: '🇬🇧', tipo: 'Aéreo', epoca: 'Moderna', ano: 2003, status: 'Ativo' },
  { nome: 'Classe Astute', pais: 'Reino Unido', bandeira: '🇬🇧', tipo: 'Naval', epoca: 'Moderna', ano: 2010, status: 'Ativo' },
  { nome: 'Rafale', pais: 'França', bandeira: '🇫🇷', tipo: 'Aéreo', epoca: 'Moderna', ano: 2001, status: 'Ativo' },
  { nome: 'Leclerc', pais: 'França', bandeira: '🇫🇷', tipo: 'Blindado', epoca: 'Moderna', ano: 1992, status: 'Ativo' },
  { nome: 'Exocet', pais: 'França', bandeira: '🇫🇷', tipo: 'Míssil', epoca: 'Guerra Fria', ano: 1979, status: 'Ativo' },
  { nome: 'Merkava IV', pais: 'Israel', bandeira: '🇮🇱', tipo: 'Blindado', epoca: 'Moderna', ano: 2004, status: 'Ativo' },
  { nome: 'Tavor', pais: 'Israel', bandeira: '🇮🇱', tipo: 'Infantaria', epoca: 'Moderna', ano: 2009, status: 'Ativo' },
  { nome: 'Iron Dome', pais: 'Israel', bandeira: '🇮🇱', tipo: 'Míssil', epoca: 'Moderna', ano: 2011, status: 'Ativo' },
  { nome: 'K2 Black Panther', pais: 'Coreia do Sul', bandeira: '🇰🇷', tipo: 'Blindado', epoca: 'Moderna', ano: 2014, status: 'Ativo' },
  { nome: 'K9 Thunder', pais: 'Coreia do Sul', bandeira: '🇰🇷', tipo: 'Artilharia', epoca: 'Moderna', ano: 1999, status: 'Ativo' },
  { nome: 'Type 10', pais: 'Japão', bandeira: '🇯🇵', tipo: 'Blindado', epoca: 'Moderna', ano: 2012, status: 'Ativo' },
  { nome: 'Mitsubishi F-2', pais: 'Japão', bandeira: '🇯🇵', tipo: 'Aéreo', epoca: 'Moderna', ano: 2000, status: 'Ativo' },
  { nome: 'INSAS', pais: 'Índia', bandeira: '🇮🇳', tipo: 'Infantaria', epoca: 'Moderna', ano: 1998, status: 'Ativo' },
  { nome: 'Arjun', pais: 'Índia', bandeira: '🇮🇳', tipo: 'Blindado', epoca: 'Moderna', ano: 2004, status: 'Ativo' },
  { nome: 'BrahMos', pais: 'Índia', bandeira: '🇮🇳', tipo: 'Míssil', epoca: 'Moderna', ano: 2006, status: 'Ativo' },
  { nome: 'Astros II', pais: 'Brasil', bandeira: '🇧🇷', tipo: 'Artilharia', epoca: 'Moderna', ano: 1983, status: 'Ativo' },
  { nome: 'IA-2', pais: 'Brasil', bandeira: '🇧🇷', tipo: 'Infantaria', epoca: 'Moderna', ano: 2020, status: 'Ativo' },
  { nome: 'Classe Tamandaré', pais: 'Brasil', bandeira: '🇧🇷', tipo: 'Naval', epoca: 'Moderna', ano: 2025, status: 'Ativo' }
];

const TIPOS: readonly string[] = ['Todos', 'Infantaria', 'Blindado', 'Aéreo', 'Naval', 'Míssil', 'Artilharia'];
const EPOCAS: readonly string[] = ['Todas', 'Guerra Fria', 'Moderna'];

export function armasPorPaisPage(): HTMLDivElement {
  let activeCountry = 'Todos';
  let activeType = 'Todos';
  let activeEra = 'Todas';
  let search = '';
  const countries: readonly string[] = ['Todos', ...new Set(ARMAS.map((arma) => arma.pais))];
  const grid = h('div', { className: 'apais-grid' });
  const countEl = h('span', { className: 'apais-count' });

  const makeSelect = (
    label: string,
    options: readonly string[],
    onChange: (value: string) => void,
  ): HTMLLabelElement => {
    const select = h('select', {
      className: 'apais-select',
      onchange: (event: Event): void => {
        if (event.target instanceof HTMLSelectElement) onChange(event.target.value);
      }
    }, ...options.map((option) => h('option', { value: option }, option)));
    return h('label', { className: 'apais-filter' }, h('span', null, label), select);
  };

  const render = (): void => {
    const items = ARMAS.filter((arma) =>
      (activeCountry === 'Todos' || arma.pais === activeCountry) &&
      (activeType === 'Todos' || arma.tipo === activeType) &&
      (activeEra === 'Todas' || arma.epoca === activeEra) &&
      arma.nome.toLowerCase().includes(search))
      .slice()
      .sort((left, right) => right.ano - left.ano);

    grid.innerHTML = '';
    countEl.textContent = `${items.length} sistema(s)`;
    if (!items.length) {
      grid.appendChild(h('p', { className: 'arsx-empty' }, 'Nenhuma arma com esses filtros.'));
      return;
    }

    items.forEach((arma) => grid.appendChild(
      h('div', { className: `apais-card apais-card--${arma.tipo.toLowerCase()}` },
        h('div', { className: 'apais-card__flag' }, arma.bandeira),
        h('div', { className: 'apais-card__info' },
          h('div', { className: 'apais-card__nome' }, arma.nome),
          h('div', { className: 'apais-card__pais' }, arma.pais)),
        h('div', { className: 'apais-card__tags' },
          h('span', { className: 'apais-tag apais-tag--tipo' }, arma.tipo),
          h('span', { className: 'apais-tag' }, arma.ano),
          h('span', { className: `apais-tag apais-tag--${arma.status === 'Ativo' ? 'ativo' : 'legado'}` }, arma.status)))));
  };

  const searchEl = h('input', {
    type: 'search',
    placeholder: 'Buscar…',
    className: 'forcas-search',
    oninput: (event: Event): void => {
      if (event.target instanceof HTMLInputElement) {
        search = event.target.value.toLowerCase();
        render();
      }
    }
  });

  render();
  return h('div', { className: 'apais-page page-wrap' },
    buildImmersiveHero({
      kicker: 'BALUARTE · ARMAS POR PAÍS',
      title: 'Armas por País',
      sub: 'CATÁLOGO DE SISTEMAS',
      desc: 'Catálogo interativo de sistemas de armas — filtre por país, tipo e época.',
      hudLeft: '🔫 SISTEMAS DE ARMAS',
      hudRight: 'POR PAÍS'
    }),
    h('div', { className: 'apais-filters' },
      makeSelect('País', countries, (value) => { activeCountry = value; render(); }),
      makeSelect('Tipo', TIPOS, (value) => { activeType = value; render(); }),
      makeSelect('Época', EPOCAS, (value) => { activeEra = value; render(); }),
      searchEl,
      countEl),
    grid);
}
