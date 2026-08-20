/**
 * /guerras-conflitos — linha do tempo histórica dos grandes conflitos.
 */

import '../styles/militar.css';
import { h } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive';

interface Guerra {
  nome: string;
  periodo: string;
  era: string;
  baixas: string;
  cor: string;
  desc: string;
}

const GUERRAS: readonly Guerra[] = [
  { nome: 'Guerras Greco-Persas', periodo: '499–449 a.C.', era: 'Antiga', baixas: '~300 mil', cor: 'ant', desc: 'Cidades-estado gregas resistem ao Império Persa. Maratona, Termópilas e Salamina.' },
  { nome: 'Guerras Púnicas', periodo: '264–146 a.C.', era: 'Antiga', baixas: '~1,5 milhão', cor: 'ant', desc: 'Roma vs. Cartago pelo controle do Mediterrâneo. Aníbal cruza os Alpes; Cartago é destruída.' },
  { nome: 'Conquistas de Alexandre', periodo: '336–323 a.C.', era: 'Antiga', baixas: '~300 mil', cor: 'ant', desc: 'O maior império da Antiguidade, da Grécia à Índia, em uma década.' },
  { nome: 'Invasões Mongóis', periodo: '1206–1368', era: 'Medieval', baixas: '~30–40 milhões', cor: 'med', desc: 'O maior império terrestre contíguo da história, de Genghis Khan a Kublai Khan.' },
  { nome: 'Guerra dos Cem Anos', periodo: '1337–1453', era: 'Medieval', baixas: '~3 milhões', cor: 'med', desc: 'Inglaterra vs. França. Arco longo, Joana d\'Arc e o fim da cavalaria medieval.' },
  { nome: 'Guerra dos Trinta Anos', periodo: '1618–1648', era: 'Moderna', baixas: '~8 milhões', cor: 'pol', desc: 'Conflito religioso e político devastador na Europa Central. Paz de Vestfália.' },
  { nome: 'Guerras Napoleônicas', periodo: '1803–1815', era: 'Moderna', baixas: '~5 milhões', cor: 'pol', desc: 'A França revolucionária contra coalizões europeias. Austerlitz, Rússia, Waterloo.' },
  { nome: 'Guerra Civil Americana', periodo: '1861–1865', era: 'Industrial', baixas: '~750 mil', cor: 'ind', desc: 'União vs. Confederação. Primeira guerra industrial; fim da escravidão nos EUA.' },
  { nome: 'Primeira Guerra Mundial', periodo: '1914–1918', era: 'Mundial', baixas: '~20 milhões', cor: 'ww', desc: 'Guerra de trincheiras, gás, tanques e aviões. Colapso de quatro impérios.' },
  { nome: 'Segunda Guerra Mundial', periodo: '1939–1945', era: 'Mundial', baixas: '~70–85 milhões', cor: 'ww', desc: 'O conflito mais mortal da história. Blitzkrieg, Holocausto, bombas atômicas.' },
  { nome: 'Guerra da Coreia', periodo: '1950–1953', era: 'Guerra Fria', baixas: '~3 milhões', cor: 'gf', desc: 'Primeiro grande conflito da Guerra Fria. Divisão permanente da península.' },
  { nome: 'Guerra do Vietnã', periodo: '1955–1975', era: 'Guerra Fria', baixas: '~3 milhões', cor: 'gf', desc: 'EUA contra o Vietnã do Norte comunista. Guerrilha, napalm, derrota americana.' },
  { nome: 'Guerra do Golfo', periodo: '1990–1991', era: 'Contemporânea', baixas: '~25–50 mil', cor: 'cont', desc: 'Coalizão expulsa o Iraque do Kuwait. Guerra de precisão transmitida ao vivo.' },
  { nome: 'Guerra ao Terror', periodo: '2001–2021', era: 'Contemporânea', baixas: '~900 mil', cor: 'cont', desc: 'Afeganistão e Iraque após o 11 de Setembro. Insurgência e guerra assimétrica.' },
  { nome: 'Guerra Rússia-Ucrânia', periodo: '2022–presente', era: 'Contemporânea', baixas: 'Em curso', cor: 'cont', desc: 'Maior guerra convencional na Europa desde 1945. Drones, artilharia e trincheiras modernas.' }
];

export function guerrasConflitosPage(): HTMLDivElement {
  const eras: readonly string[] = ['Todas', ...new Set(GUERRAS.map((guerra) => guerra.era))];
  let activeEra = 'Todas';
  const timeline = h('div', { className: 'guerra-timeline' });

  const render = (): void => {
    timeline.innerHTML = '';
    GUERRAS.filter((guerra) => activeEra === 'Todas' || guerra.era === activeEra)
      .forEach((guerra) => timeline.appendChild(
        h('div', { className: `guerra-item guerra-item--${guerra.cor}` },
          h('div', { className: 'guerra-item__dot' }),
          h('div', { className: 'guerra-item__card' },
            h('div', { className: 'guerra-item__head' },
              h('span', { className: 'guerra-item__nome' }, guerra.nome),
              h('span', { className: 'guerra-item__periodo' }, guerra.periodo)),
            h('div', { className: 'guerra-item__meta' },
              h('span', { className: 'guerra-item__era' }, guerra.era),
              h('span', { className: 'guerra-item__baixas' }, `☠ ${guerra.baixas}`)),
            h('p', { className: 'guerra-item__desc' }, guerra.desc)))));
  };

  const filterBar = h('div', { className: 'guerra-filters' },
    ...eras.map((era) => h('button', {
      className: `guerra-filter${era === 'Todas' ? ' is-active' : ''}`,
      onclick: (event: Event): void => {
        const button = event.currentTarget;
        if (button instanceof HTMLElement) {
          document.querySelectorAll<HTMLElement>('.guerra-filter').forEach((element) =>
            element.classList.remove('is-active'));
          button.classList.add('is-active');
        }
        activeEra = era;
        render();
      }
    }, era)));

  render();
  return h('div', { className: 'guerra-page page-wrap' },
    buildImmersiveHero({
      kicker: 'BALUARTE · GUERRAS & CONFLITOS',
      title: 'Guerras & Conflitos',
      sub: 'LINHA DO TEMPO',
      desc: 'Linha do tempo dos grandes conflitos da história — da Antiguidade ao presente.',
      hudLeft: '🌐 CONFLITOS GLOBAIS',
      hudRight: 'TIMELINE'
    }),
    filterBar,
    timeline);
}
