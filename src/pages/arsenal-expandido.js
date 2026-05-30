/**
 * /arsenal-expandido — Arsenal Militar Expandido
 * Armas por categoria: infantaria, artilharia, blindados, naval, aéreo, mísseis
 */

import { h } from '../utils/helpers.js';

const CATEGORIAS = [
  { id: 'infantaria', label: 'Infantaria', icon: '🔫' },
  { id: 'blindados',  label: 'Blindados',  icon: '🚜' },
  { id: 'artilharia', label: 'Artilharia', icon: '💥' },
  { id: 'aereo',      label: 'Aéreo',      icon: '✈' },
  { id: 'naval',      label: 'Naval',      icon: '🚢' },
  { id: 'misseis',    label: 'Mísseis',    icon: '🚀' },
];

const ARSENAL = {
  infantaria: [
    { nome: 'M4 Carbine', origem: '🇺🇸 EUA', tipo: 'Fuzil de assalto', calibre: '5.56×45mm', alcance: '500 m', ano: 1994, nota: 'Padrão das forças dos EUA, modular' },
    { nome: 'AK-12', origem: '🇷🇺 Rússia', tipo: 'Fuzil de assalto', calibre: '5.45×39mm', alcance: '500 m', ano: 2018, nota: 'Evolução do AK-47, atual exército russo' },
    { nome: 'QBZ-191', origem: '🇨🇳 China', tipo: 'Fuzil de assalto', calibre: '5.8×42mm', alcance: '600 m', ano: 2019, nota: 'Bullpup do EPL chinês' },
    { nome: 'HK416', origem: '🇩🇪 Alemanha', tipo: 'Fuzil de assalto', calibre: '5.56×45mm', alcance: '600 m', ano: 2004, nota: 'Operações especiais, pistão a gás' },
    { nome: 'FN SCAR', origem: '🇧🇪 Bélgica', tipo: 'Fuzil de combate', calibre: '5.56 / 7.62mm', alcance: '600 m', ano: 2009, nota: 'SOCOM, configurável' },
    { nome: 'Barrett M82', origem: '🇺🇸 EUA', tipo: 'Fuzil antimaterial', calibre: '.50 BMG', alcance: '1800 m', ano: 1989, nota: 'Sniper de longo alcance' },
    { nome: 'M249 SAW', origem: '🇧🇪 Bélgica', tipo: 'Metralhadora leve', calibre: '5.56×45mm', alcance: '1000 m', ano: 1984, nota: 'Suporte de esquadra' },
    { nome: 'IMI Tavor', origem: '🇮🇱 Israel', tipo: 'Fuzil bullpup', calibre: '5.56×45mm', alcance: '550 m', ano: 2009, nota: 'Compacto, FDI' },
  ],
  blindados: [
    { nome: 'M1A2 Abrams', origem: '🇺🇸 EUA', tipo: 'Tanque principal (MBT)', calibre: 'Canhão 120mm', alcance: '4000 m', ano: 1992, nota: 'Turbina, blindagem urânio empobrecido' },
    { nome: 'T-14 Armata', origem: '🇷🇺 Rússia', tipo: 'MBT', calibre: '125mm', alcance: '5000 m', ano: 2015, nota: 'Torre não tripulada, cápsula blindada' },
    { nome: 'Leopard 2A7', origem: '🇩🇪 Alemanha', tipo: 'MBT', calibre: '120mm L/55', alcance: '5000 m', ano: 2010, nota: 'Um dos melhores MBT ocidentais' },
    { nome: 'Challenger 2', origem: '🇬🇧 Reino Unido', tipo: 'MBT', calibre: '120mm rifled', alcance: '5000 m', ano: 1998, nota: 'Blindagem Chobham/Dorchester' },
    { nome: 'Type 99A', origem: '🇨🇳 China', tipo: 'MBT', calibre: '125mm', alcance: '5000 m', ano: 2011, nota: 'Sistema laser de autodefesa' },
    { nome: 'Merkava IV', origem: '🇮🇱 Israel', tipo: 'MBT', calibre: '120mm', alcance: '4000 m', ano: 2004, nota: 'Motor frontal, Trophy APS' },
    { nome: 'M2 Bradley', origem: '🇺🇸 EUA', tipo: 'Veículo de combate', calibre: '25mm + TOW', alcance: '3750 m', ano: 1981, nota: 'IFV de transporte de infantaria' },
    { nome: 'BMP-3', origem: '🇷🇺 Rússia', tipo: 'IFV', calibre: '100mm + 30mm', alcance: '4000 m', ano: 1987, nota: 'Anfíbio, armamento triplo' },
  ],
  artilharia: [
    { nome: 'M777 Howitzer', origem: '🇺🇸 EUA', tipo: 'Obus rebocado', calibre: '155mm', alcance: '30 km', ano: 2005, nota: 'Leve (titânio), Excalibur guiado' },
    { nome: 'PzH 2000', origem: '🇩🇪 Alemanha', tipo: 'Obus autopropulsado', calibre: '155mm', alcance: '40 km', ano: 1998, nota: 'Cadência de 10 tiros/min' },
    { nome: 'M142 HIMARS', origem: '🇺🇸 EUA', tipo: 'Lança-foguetes', calibre: '227mm / ATACMS', alcance: '300 km', ano: 2010, nota: 'Mobilidade alta, precisão GPS' },
    { nome: 'BM-30 Smerch', origem: '🇷🇺 Rússia', tipo: 'MLRS', calibre: '300mm', alcance: '90 km', ano: 1989, nota: '12 tubos, saturação de área' },
    { nome: 'Caesar', origem: '🇫🇷 França', tipo: 'Obus sobre caminhão', calibre: '155mm', alcance: '42 km', ano: 2008, nota: 'Shoot-and-scoot' },
    { nome: 'K9 Thunder', origem: '🇰🇷 Coreia do Sul', tipo: 'Obus autopropulsado', calibre: '155mm', alcance: '40 km', ano: 1999, nota: 'Exportado mundialmente' },
  ],
  aereo: [
    { nome: 'F-35 Lightning II', origem: '🇺🇸 EUA', tipo: 'Caça furtivo 5ª ger.', calibre: 'Multifunção', alcance: '2200 km', ano: 2015, nota: 'Stealth, sensor fusion' },
    { nome: 'F-22 Raptor', origem: '🇺🇸 EUA', tipo: 'Caça superioridade aérea', calibre: 'Ar-ar', alcance: '2960 km', ano: 2005, nota: 'Supercruise, supermanobrável' },
    { nome: 'Su-57 Felon', origem: '🇷🇺 Rússia', tipo: 'Caça 5ª ger.', calibre: 'Multifunção', alcance: '3500 km', ano: 2020, nota: 'Stealth russo, thrust vectoring' },
    { nome: 'J-20 Mighty Dragon', origem: '🇨🇳 China', tipo: 'Caça furtivo', calibre: 'Multifunção', alcance: '5500 km', ano: 2017, nota: '5ª geração chinesa' },
    { nome: 'Eurofighter Typhoon', origem: '🇪🇺 Europa', tipo: 'Caça multifunção', calibre: 'Multifunção', alcance: '2900 km', ano: 2003, nota: 'Consórcio UK/DE/IT/ES' },
    { nome: 'Rafale', origem: '🇫🇷 França', tipo: 'Caça multifunção', calibre: 'Multifunção', alcance: '3700 km', ano: 2001, nota: 'Omnirole, embarcado' },
    { nome: 'B-2 Spirit', origem: '🇺🇸 EUA', tipo: 'Bombardeiro furtivo', calibre: 'Nuclear/convencional', alcance: '11000 km', ano: 1997, nota: 'Asa voadora stealth' },
    { nome: 'A-10 Thunderbolt II', origem: '🇺🇸 EUA', tipo: 'Ataque ao solo', calibre: 'GAU-8 30mm', alcance: '1200 km', ano: 1977, nota: 'CAS, anti-blindado' },
  ],
  naval: [
    { nome: 'Porta-aviões Gerald R. Ford', origem: '🇺🇸 EUA', tipo: 'Porta-aviões nuclear', calibre: '75+ aeronaves', alcance: 'Ilimitado', ano: 2017, nota: 'Catapultas EMALS, maior do mundo' },
    { nome: 'Submarino Virginia', origem: '🇺🇸 EUA', tipo: 'Submarino de ataque', calibre: 'Tomahawk/torpedos', alcance: 'Ilimitado', ano: 2004, nota: 'SSN nuclear furtivo' },
    { nome: 'Destroyer Arleigh Burke', origem: '🇺🇸 EUA', tipo: 'Destróier Aegis', calibre: 'VLS 96 células', alcance: 'Global', ano: 1991, nota: 'Defesa antimíssil BMD' },
    { nome: 'Type 055 Renhai', origem: '🇨🇳 China', tipo: 'Cruzador', calibre: 'VLS 112 células', alcance: 'Global', ano: 2020, nota: 'Maior surface combatant chinês' },
    { nome: 'Submarino Borei', origem: '🇷🇺 Rússia', tipo: 'SSBN nuclear', calibre: '16× Bulava SLBM', alcance: 'Ilimitado', ano: 2013, nota: 'Dissuasão nuclear naval' },
    { nome: 'Fragata FREMM', origem: '🇫🇷🇮🇹 FR/IT', tipo: 'Fragata multifunção', calibre: 'Aster/Exocet', alcance: '6000 nm', ano: 2012, nota: 'Antissubmarino e antiaéreo' },
  ],
  misseis: [
    { nome: 'Tomahawk', origem: '🇺🇸 EUA', tipo: 'Míssil de cruzeiro', calibre: 'Subsônico', alcance: '2500 km', ano: 1983, nota: 'Ataque a terra, precisão GPS' },
    { nome: 'Kinzhal', origem: '🇷🇺 Rússia', tipo: 'Míssil hipersônico', calibre: 'Mach 10', alcance: '2000 km', ano: 2018, nota: 'Lançado de ar, manobrável' },
    { nome: 'DF-41', origem: '🇨🇳 China', tipo: 'ICBM', calibre: 'Mach 25', alcance: '15000 km', ano: 2017, nota: 'Intercontinental, MIRV' },
    { nome: 'Patriot PAC-3', origem: '🇺🇸 EUA', tipo: 'Antimíssil/antiaéreo', calibre: 'Hit-to-kill', alcance: '160 km', ano: 2001, nota: 'Defesa contra mísseis balísticos' },
    { nome: 'S-400 Triumf', origem: '🇷🇺 Rússia', tipo: 'SAM longo alcance', calibre: 'Multicamada', alcance: '400 km', ano: 2007, nota: 'Sistema antiaéreo de área' },
    { nome: 'Iron Dome', origem: '🇮🇱 Israel', tipo: 'Defesa de curto alcance', calibre: 'Tamir', alcance: '70 km', ano: 2011, nota: 'Intercepta foguetes e morteiros' },
    { nome: 'Javelin FGM-148', origem: '🇺🇸 EUA', tipo: 'Antitanque portátil', calibre: 'Fire-and-forget', alcance: '4 km', ano: 1996, nota: 'Top-attack, infravermelho' },
    { nome: 'Trident II D5', origem: '🇺🇸 EUA', tipo: 'SLBM nuclear', calibre: 'Mach 24', alcance: '12000 km', ano: 1990, nota: 'Lançado de submarino, MIRV' },
  ],
};

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
      h('p', { className: 'u-text-muted' }, `${total} sistemas de armas em 6 categorias — infantaria, blindados, artilharia, aéreo, naval e mísseis.`)
    ),
    tabBar,
    h('div', { className: 'forcas-controls' }, searchEl),
    grid
  );
}
