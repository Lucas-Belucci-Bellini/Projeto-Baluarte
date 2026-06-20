/**
 * /poder-militar — Rankings de Poder Militar
 * GFP Index, capacidade nuclear, poder aéreo, naval, terrestre
 */

import { h } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive.js';

const RANKINGS = [
  {
    pais: 'EUA', bandeira: '🇺🇸', gfp: 0.0699, posicao: 1,
    nuclear: true, ogivas: 5550,
    avioes: 13300, navios: 484, tanques: 5500, soldados: 1328000,
    tags: ['OTAN', 'P5', 'NATO líder']
  },
  {
    pais: 'Rússia', bandeira: '🇷🇺', gfp: 0.0702, posicao: 2,
    nuclear: true, ogivas: 6257,
    avioes: 4255, navios: 603, tanques: 12420, soldados: 900000,
    tags: ['P5', 'SCO', 'CSTO']
  },
  {
    pais: 'China', bandeira: '🇨🇳', gfp: 0.0706, posicao: 3,
    nuclear: true, ogivas: 500,
    avioes: 3304, navios: 730, tanques: 5000, soldados: 2035000,
    tags: ['P5', 'SCO', 'Maior exército']
  },
  {
    pais: 'Índia', bandeira: '🇮🇳', gfp: 0.1023, posicao: 4,
    nuclear: true, ogivas: 164,
    avioes: 2182, navios: 293, tanques: 4614, soldados: 1455000,
    tags: ['Nuclear', 'SCO', 'BRICS']
  },
  {
    pais: 'Coreia do Sul', bandeira: '🇰🇷', gfp: 0.1231, posicao: 5,
    nuclear: false, ogivas: 0,
    avioes: 1643, navios: 234, tanques: 2130, soldados: 555000,
    tags: ['US-aliado', 'OTAN parceiro']
  },
  {
    pais: 'Reino Unido', bandeira: '🇬🇧', gfp: 0.1382, posicao: 6,
    nuclear: true, ogivas: 225,
    avioes: 733, navios: 64, tanques: 227, soldados: 153290,
    tags: ['P5', 'OTAN', 'Five Eyes']
  },
  {
    pais: 'Japão', bandeira: '🇯🇵', gfp: 0.1601, posicao: 7,
    nuclear: false, ogivas: 0,
    avioes: 1449, navios: 155, tanques: 1004, soldados: 247154,
    tags: ['US-aliado', 'Quad']
  },
  {
    pais: 'Turquia', bandeira: '🇹🇷', gfp: 0.1697, posicao: 8,
    nuclear: false, ogivas: 0,
    avioes: 1067, navios: 194, tanques: 2627, soldados: 355200,
    tags: ['OTAN', '2º maior exército NATO']
  },
  {
    pais: 'França', bandeira: '🇫🇷', gfp: 0.1848, posicao: 9,
    nuclear: true, ogivas: 290,
    avioes: 1055, navios: 180, tanques: 406, soldados: 208350,
    tags: ['P5', 'OTAN', 'Porta-aviões nuclear']
  },
  {
    pais: 'Brasil', bandeira: '🇧🇷', gfp: 0.1787, posicao: 10,
    nuclear: false, ogivas: 0,
    avioes: 714, navios: 110, tanques: 469, soldados: 366500,
    tags: ['BRICS', 'Maior da América do Sul']
  },
  {
    pais: 'Paquistão', bandeira: '🇵🇰', gfp: 0.1711, posicao: 11,
    nuclear: true, ogivas: 170,
    avioes: 1372, navios: 114, tanques: 2627, soldados: 654000,
    tags: ['Nuclear', 'SCO']
  },
  {
    pais: 'Itália', bandeira: '🇮🇹', gfp: 0.1973, posicao: 12,
    nuclear: false, ogivas: 0,
    avioes: 905, navios: 130, tanques: 200, soldados: 174500,
    tags: ['OTAN', 'G7']
  },
  {
    pais: 'Egito', bandeira: '🇪🇬', gfp: 0.2283, posicao: 13,
    nuclear: false, ogivas: 0,
    avioes: 1062, navios: 321, tanques: 4295, soldados: 438500,
    tags: ['Maior da África', 'US-aliado']
  },
  {
    pais: 'Israel', bandeira: '🇮🇱', gfp: 0.2596, posicao: 14,
    nuclear: true, ogivas: 90,
    avioes: 612, navios: 67, tanques: 2200, soldados: 169500,
    tags: ['Nuclear (não declarado)', 'US-aliado']
  },
  {
    pais: 'Alemanha', bandeira: '🇩🇪', gfp: 0.2221, posicao: 15,
    nuclear: false, ogivas: 0,
    avioes: 708, navios: 81, tanques: 266, soldados: 183638,
    tags: ['OTAN', 'G7', 'Rearme 2024']
  },
];

const CATEGORIAS = [
  { key: 'gfp',      label: 'GFP Score',       fmt: r => r.gfp.toFixed(4),                           note: 'menor = mais poderoso' },
  { key: 'avioes',   label: 'Poder Aéreo',      fmt: r => r.avioes.toLocaleString('pt-BR') + ' av.',  note: 'aeronaves totais' },
  { key: 'navios',   label: 'Poder Naval',      fmt: r => r.navios.toLocaleString('pt-BR') + ' nav.', note: 'embarcações' },
  { key: 'tanques',  label: 'Poder Terrestre',  fmt: r => r.tanques.toLocaleString('pt-BR') + ' tk.', note: 'tanques de batalha' },
  { key: 'soldados', label: 'Efetivos',         fmt: r => (r.soldados / 1000).toFixed(0) + 'K',       note: 'pessoal ativo' },
];

export function poderMilitarPage() {
  let activeCategory = 'gfp';

  const catBar = h('div', { className: 'poder-cats' });
  const catBtns = {};
  const rankingArea = h('div', { className: 'poder-ranking' });

  function renderRanking() {
    rankingArea.innerHTML = '';
    const cat = CATEGORIAS.find(c => c.key === activeCategory);
    const sorted = [...RANKINGS].sort((a, b) => {
      if (activeCategory === 'gfp') return a[activeCategory] - b[activeCategory];
      return b[activeCategory] - a[activeCategory];
    });
    const max = Math.max(...sorted.map(r => activeCategory === 'gfp' ? 1 - r.gfp : r[activeCategory]));

    sorted.forEach((r, i) => {
      const val = activeCategory === 'gfp' ? r.gfp : r[activeCategory];
      const barPct = activeCategory === 'gfp'
        ? ((1 - r.gfp) / (1 - Math.min(...RANKINGS.map(x => x.gfp))) * 100).toFixed(0)
        : (val / max * 100).toFixed(0);

      rankingArea.appendChild(
        h('div', { className: `poder-card${i < 3 ? ` poder-card--top${i + 1}` : ''}` },
          h('div', { className: 'poder-card__rank' }, `#${i + 1}`),
          h('div', { className: 'poder-card__flag' }, r.bandeira),
          h('div', { className: 'poder-card__info' },
            h('div', { className: 'poder-card__name' }, r.pais),
            h('div', { className: 'poder-card__tags' },
              ...r.tags.map(t => h('span', { className: 'poder-tag' }, t)),
              r.nuclear && h('span', { className: 'poder-tag poder-tag--nuclear' }, '☢ Nuclear')
            ),
            h('div', { className: 'poder-bar-wrap' },
              h('div', { className: 'poder-bar', style: `width:${barPct}%` })
            )
          ),
          h('div', { className: 'poder-card__val' }, cat.fmt(r))
        )
      );
    });
  }

  for (const cat of CATEGORIAS) {
    const btn = h('button', {
      className: `poder-cat-btn${cat.key === activeCategory ? ' is-active' : ''}`,
      onclick: () => {
        catBtns[activeCategory].classList.remove('is-active');
        activeCategory = cat.key;
        catBtns[cat.key].classList.add('is-active');
        renderRanking();
      }
    }, `${cat.label} `, h('small', null, `(${cat.note})`));
    catBtns[cat.key] = btn;
    catBar.appendChild(btn);
  }

  renderRanking();

  /* Resumo nuclear */
  const nuclearCount = RANKINGS.filter(r => r.nuclear).length;
  const totalOgivas = RANKINGS.reduce((s, r) => s + r.ogivas, 0);

  const nukeBox = h('div', { className: 'poder-nuke-box' },
    h('div', { className: 'poder-nuke-title' }, '☢ Arsenal Nuclear Mundial'),
    h('div', { className: 'poder-nuke-grid' },
      ...RANKINGS.filter(r => r.nuclear).map(r =>
        h('div', { className: 'poder-nuke-item' },
          h('span', null, r.bandeira),
          h('strong', null, r.pais),
          h('span', { className: 'poder-nuke-val' }, `~${r.ogivas.toLocaleString()} ogivas`)
        )
      )
    ),
    h('p', { className: 'poder-nuke-total' },
      `${nuclearCount} estados nucleares · ~${totalOgivas.toLocaleString()} ogivas no total (estimativa FAS 2024)`
    )
  );

  return h('div', { className: 'poder-page page-wrap' },
    buildImmersiveHero({
      kicker: 'BALUARTE · PODER MILITAR',
      title: 'Poder Militar',
      sub: 'GFP INDEX 2024',
      desc: 'GFP Index 2024 · Poder aéreo, naval, terrestre e efetivos por país.',
      hudLeft: '🏅 RANKINGS GLOBAIS', hudRight: 'GFP 2024'
    }),
    nukeBox,
    h('div', { className: 'poder-section' },
      h('h2', { className: 'poder-section-title' }, 'Ranking por Categoria'),
      catBar,
      rankingArea
    )
  );
}
