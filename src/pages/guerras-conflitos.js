/**
 * /guerras-conflitos — Guerras & Conflitos
 * Linha do tempo histórica interativa dos grandes conflitos
 */

import { h } from '../utils/helpers.js';

const GUERRAS = [
  { nome: 'Guerras Greco-Persas', periodo: '499–449 a.C.', era: 'Antiga', baixas: '~300 mil', cor: 'ant',
    desc: 'Cidades-estado gregas resistem ao Império Persa. Maratona, Termópilas e Salamina.' },
  { nome: 'Guerras Púnicas', periodo: '264–146 a.C.', era: 'Antiga', baixas: '~1,5 milhão', cor: 'ant',
    desc: 'Roma vs. Cartago pelo controle do Mediterrâneo. Aníbal cruza os Alpes; Cartago é destruída.' },
  { nome: 'Conquistas de Alexandre', periodo: '336–323 a.C.', era: 'Antiga', baixas: '~300 mil', cor: 'ant',
    desc: 'O maior império da Antiguidade, da Grécia à Índia, em uma década.' },
  { nome: 'Invasões Mongóis', periodo: '1206–1368', era: 'Medieval', baixas: '~30–40 milhões', cor: 'med',
    desc: 'O maior império terrestre contíguo da história, de Genghis Khan a Kublai Khan.' },
  { nome: 'Guerra dos Cem Anos', periodo: '1337–1453', era: 'Medieval', baixas: '~3 milhões', cor: 'med',
    desc: 'Inglaterra vs. França. Arco longo, Joana d\'Arc e o fim da cavalaria medieval.' },
  { nome: 'Guerra dos Trinta Anos', periodo: '1618–1648', era: 'Moderna', baixas: '~8 milhões', cor: 'pol',
    desc: 'Conflito religioso e político devastador na Europa Central. Paz de Vestfália.' },
  { nome: 'Guerras Napoleônicas', periodo: '1803–1815', era: 'Moderna', baixas: '~5 milhões', cor: 'pol',
    desc: 'A França revolucionária contra coalizões europeias. Austerlitz, Rússia, Waterloo.' },
  { nome: 'Guerra Civil Americana', periodo: '1861–1865', era: 'Industrial', baixas: '~750 mil', cor: 'ind',
    desc: 'União vs. Confederação. Primeira guerra industrial; fim da escravidão nos EUA.' },
  { nome: 'Primeira Guerra Mundial', periodo: '1914–1918', era: 'Mundial', baixas: '~20 milhões', cor: 'ww',
    desc: 'Guerra de trincheiras, gás, tanques e aviões. Colapso de quatro impérios.' },
  { nome: 'Segunda Guerra Mundial', periodo: '1939–1945', era: 'Mundial', baixas: '~70–85 milhões', cor: 'ww',
    desc: 'O conflito mais mortal da história. Blitzkrieg, Holocausto, bombas atômicas.' },
  { nome: 'Guerra da Coreia', periodo: '1950–1953', era: 'Guerra Fria', baixas: '~3 milhões', cor: 'gf',
    desc: 'Primeiro grande conflito da Guerra Fria. Divisão permanente da península.' },
  { nome: 'Guerra do Vietnã', periodo: '1955–1975', era: 'Guerra Fria', baixas: '~3 milhões', cor: 'gf',
    desc: 'EUA contra o Vietnã do Norte comunista. Guerrilha, napalm, derrota americana.' },
  { nome: 'Guerra do Golfo', periodo: '1990–1991', era: 'Contemporânea', baixas: '~25–50 mil', cor: 'cont',
    desc: 'Coalizão expulsa o Iraque do Kuwait. Guerra de precisão transmitida ao vivo.' },
  { nome: 'Guerra ao Terror', periodo: '2001–2021', era: 'Contemporânea', baixas: '~900 mil', cor: 'cont',
    desc: 'Afeganistão e Iraque após o 11 de Setembro. Insurgência e guerra assimétrica.' },
  { nome: 'Guerra Rússia-Ucrânia', periodo: '2022–presente', era: 'Contemporânea', baixas: 'Em curso', cor: 'cont',
    desc: 'Maior guerra convencional na Europa desde 1945. Drones, artilharia e trincheiras modernas.' },
];

export function guerrasConflitosPage() {
  const eras = ['Todas', ...new Set(GUERRAS.map(g => g.era))];
  let fEra = 'Todas';

  const timeline = h('div', { className: 'guerra-timeline' });

  function render() {
    timeline.innerHTML = '';
    const items = GUERRAS.filter(g => fEra === 'Todas' || g.era === fEra);
    for (const g of items) {
      timeline.appendChild(
        h('div', { className: `guerra-item guerra-item--${g.cor}` },
          h('div', { className: 'guerra-item__dot' }),
          h('div', { className: 'guerra-item__card' },
            h('div', { className: 'guerra-item__head' },
              h('span', { className: 'guerra-item__nome' }, g.nome),
              h('span', { className: 'guerra-item__periodo' }, g.periodo)
            ),
            h('div', { className: 'guerra-item__meta' },
              h('span', { className: 'guerra-item__era' }, g.era),
              h('span', { className: 'guerra-item__baixas' }, `☠ ${g.baixas}`)
            ),
            h('p', { className: 'guerra-item__desc' }, g.desc)
          )
        )
      );
    }
  }

  const filterBar = h('div', { className: 'guerra-filters' },
    ...eras.map(e =>
      h('button', {
        className: `guerra-filter${e === 'Todas' ? ' is-active' : ''}`,
        onclick: ev => {
          document.querySelectorAll('.guerra-filter').forEach(b => b.classList.remove('is-active'));
          ev.currentTarget.classList.add('is-active');
          fEra = e; render();
        }
      }, e)
    )
  );

  render();

  return h('div', { className: 'guerra-page page-wrap' },
    h('div', { className: 'page-hero' },
      h('h1', null, '🌐 Guerras & Conflitos'),
      h('p', { className: 'u-text-muted' }, 'Linha do tempo dos grandes conflitos da história — da Antiguidade ao presente.')
    ),
    filterBar,
    timeline
  );
}
