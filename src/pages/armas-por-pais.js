/**
 * /armas-por-pais — Catálogo de Armas por País
 * Filtros interativos: país, tipo, época
 */

import { h } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive.js';

const ARMAS = [
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
  { nome: 'Classe Tamandaré', pais: 'Brasil', bandeira: '🇧🇷', tipo: 'Naval', epoca: 'Moderna', ano: 2025, status: 'Ativo' },
];

const TIPOS = ['Todos', 'Infantaria', 'Blindado', 'Aéreo', 'Naval', 'Míssil', 'Artilharia'];
const EPOCAS = ['Todas', 'Guerra Fria', 'Moderna'];

export function armasPorPaisPage() {
  let fPais = 'Todos';
  let fTipo = 'Todos';
  let fEpoca = 'Todas';
  let search = '';

  const paises = ['Todos', ...new Set(ARMAS.map(a => a.pais))];

  const grid = h('div', { className: 'apais-grid' });
  const countEl = h('span', { className: 'apais-count' });

  function makeSelect(label, opts, onChange) {
    const sel = h('select', { className: 'apais-select', onchange: e => onChange(e.target.value) },
      ...opts.map(o => h('option', { value: o }, o))
    );
    return h('label', { className: 'apais-filter' }, h('span', null, label), sel);
  }

  function render() {
    const items = ARMAS.filter(a =>
      (fPais === 'Todos' || a.pais === fPais) &&
      (fTipo === 'Todos' || a.tipo === fTipo) &&
      (fEpoca === 'Todas' || a.epoca === fEpoca) &&
      a.nome.toLowerCase().includes(search)
    ).sort((a, b) => b.ano - a.ano);

    grid.innerHTML = '';
    countEl.textContent = `${items.length} sistema(s)`;
    if (!items.length) { grid.appendChild(h('p', { className: 'arsx-empty' }, 'Nenhuma arma com esses filtros.')); return; }

    for (const a of items) {
      grid.appendChild(
        h('div', { className: `apais-card apais-card--${a.tipo.toLowerCase()}` },
          h('div', { className: 'apais-card__flag' }, a.bandeira),
          h('div', { className: 'apais-card__info' },
            h('div', { className: 'apais-card__nome' }, a.nome),
            h('div', { className: 'apais-card__pais' }, a.pais)
          ),
          h('div', { className: 'apais-card__tags' },
            h('span', { className: 'apais-tag apais-tag--tipo' }, a.tipo),
            h('span', { className: 'apais-tag' }, a.ano),
            h('span', { className: `apais-tag apais-tag--${a.status === 'Ativo' ? 'ativo' : 'legado'}` }, a.status)
          )
        )
      );
    }
  }

  const searchEl = h('input', {
    type: 'search', placeholder: '🔍 Buscar...', className: 'forcas-search',
    oninput: e => { search = e.target.value.toLowerCase(); render(); }
  });

  render();

  return h('div', { className: 'apais-page page-wrap' },
    buildImmersiveHero({
      kicker: 'BALUARTE · ARMAS POR PAÍS',
      title: 'Armas por País',
      sub: 'CATÁLOGO DE SISTEMAS',
      desc: 'Catálogo interativo de sistemas de armas — filtre por país, tipo e época.',
      hudLeft: '🔫 SISTEMAS DE ARMAS', hudRight: 'POR PAÍS'
    }),
    h('div', { className: 'apais-filters' },
      makeSelect('País', paises, v => { fPais = v; render(); }),
      makeSelect('Tipo', TIPOS, v => { fTipo = v; render(); }),
      makeSelect('Época', EPOCAS, v => { fEpoca = v; render(); }),
      searchEl,
      countEl
    ),
    grid
  );
}
