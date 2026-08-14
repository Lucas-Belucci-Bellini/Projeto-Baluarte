/**
 * /batalhas-historicas — batalhas decisivas que mudaram o curso da história.
 */

import '../styles/militar.css';
import { h } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive.js';

interface Batalha {
  nome: string;
  ano: string;
  local: string;
  vencedor: string;
  perdedor: string;
  tatica: string;
  impacto: string;
  cor: string;
}

const BATALHAS: readonly Batalha[] = [
  { nome: 'Maratona', ano: '490 a.C.', local: 'Grécia', vencedor: 'Atenas', perdedor: 'Pérsia', tatica: 'Envolvimento duplo', impacto: 'Salvou a democracia grega; origem da corrida de maratona.', cor: 'ant' },
  { nome: 'Termópilas', ano: '480 a.C.', local: 'Grécia', vencedor: 'Pérsia', perdedor: 'Grécia (300 espartanos)', tatica: 'Defesa de desfiladeiro', impacto: 'Símbolo eterno de resistência heroica contra adversidade.', cor: 'ant' },
  { nome: 'Canas', ano: '216 a.C.', local: 'Itália', vencedor: 'Cartago (Aníbal)', perdedor: 'Roma', tatica: 'Duplo envolvimento perfeito', impacto: 'Obra-prima tática estudada em academias militares até hoje.', cor: 'ant' },
  { nome: 'Gaugamela', ano: '331 a.C.', local: 'Mesopotâmia', vencedor: 'Macedônia (Alexandre)', perdedor: 'Pérsia (Dario III)', tatica: 'Ataque oblíquo da cavalaria', impacto: 'Fim do Império Persa; Alexandre torna-se senhor da Ásia.', cor: 'ant' },
  { nome: 'Hastings', ano: '1066', local: 'Inglaterra', vencedor: 'Normandos (Guilherme)', perdedor: 'Anglo-saxões', tatica: 'Retirada fingida', impacto: 'Conquista normanda da Inglaterra; transforma a história inglesa.', cor: 'med' },
  { nome: 'Agincourt', ano: '1415', local: 'França', vencedor: 'Inglaterra (Henrique V)', perdedor: 'França', tatica: 'Arco longo em terreno lamacento', impacto: 'Demonstrou o poder do arco longo sobre a cavalaria pesada.', cor: 'med' },
  { nome: 'Constantinopla', ano: '1453', local: 'Bizâncio', vencedor: 'Império Otomano', perdedor: 'Bizâncio', tatica: 'Cerco com artilharia pesada', impacto: 'Fim do Império Romano do Oriente; ascensão otomana.', cor: 'med' },
  { nome: 'Austerlitz', ano: '1805', local: 'Morávia', vencedor: 'França (Napoleão)', perdedor: 'Rússia/Áustria', tatica: 'Centro fraco proposital + contra-ataque', impacto: 'A "Batalha dos Três Imperadores"; ápice de Napoleão.', cor: 'pol' },
  { nome: 'Waterloo', ano: '1815', local: 'Bélgica', vencedor: 'Coalizão (Wellington/Blücher)', perdedor: 'França (Napoleão)', tatica: 'Defesa em reverso + chegada prussiana', impacto: 'Fim definitivo de Napoleão e da era napoleônica.', cor: 'pol' },
  { nome: 'Gettysburg', ano: '1863', local: 'EUA', vencedor: 'União', perdedor: 'Confederação', tatica: 'Defesa em terreno elevado', impacto: 'Ponto de virada da Guerra Civil Americana.', cor: 'ind' },
  { nome: 'Somme', ano: '1916', local: 'França', vencedor: 'Indecisa (Aliados)', perdedor: '—', tatica: 'Ofensiva de trincheiras', impacto: '1 milhão de baixas; símbolo da carnificina da WWI. Estreia dos tanques.', cor: 'ww' },
  { nome: 'Stalingrado', ano: '1942–43', local: 'URSS', vencedor: 'União Soviética', perdedor: 'Alemanha', tatica: 'Cerco urbano (Operação Urano)', impacto: 'Maior virada da WWII na Europa; ~2 milhões de baixas.', cor: 'ww' },
  { nome: 'Dia D (Normandia)', ano: '1944', local: 'França', vencedor: 'Aliados', perdedor: 'Alemanha', tatica: 'Assalto anfíbio + aerotransporte', impacto: 'Abriu a Frente Ocidental; início da libertação da Europa.', cor: 'ww' },
  { nome: 'Midway', ano: '1942', local: 'Pacífico', vencedor: 'EUA', perdedor: 'Japão', tatica: 'Emboscada de porta-aviões', impacto: 'Virada da guerra no Pacífico; Japão perde 4 porta-aviões.', cor: 'ww' },
  { nome: 'Tet (Ofensiva)', ano: '1968', local: 'Vietnã', vencedor: 'Militar: EUA / Político: Vietnã do Norte', perdedor: '—', tatica: 'Ofensiva surpresa coordenada', impacto: 'Virou a opinião pública americana contra a guerra.', cor: 'gf' },
  { nome: '73 Easting', ano: '1991', local: 'Iraque', vencedor: 'EUA/Coalizão', perdedor: 'Iraque', tatica: 'Combate blindado com visão noturna', impacto: 'Demonstrou a superioridade tecnológica ocidental.', cor: 'cont' }
];

export function batalhasHistoricasPage(): HTMLDivElement {
  let search = '';
  const grid = h('div', { className: 'batalha-grid' });

  const render = (): void => {
    grid.innerHTML = '';
    BATALHAS.filter((batalha) =>
      batalha.nome.toLowerCase().includes(search) ||
      batalha.local.toLowerCase().includes(search) ||
      batalha.vencedor.toLowerCase().includes(search))
      .forEach((batalha) => grid.appendChild(
        h('div', { className: `batalha-card batalha-card--${batalha.cor}` },
          h('div', { className: 'batalha-card__head' },
            h('span', { className: 'batalha-card__nome' }, batalha.nome),
            h('span', { className: 'batalha-card__ano' }, batalha.ano)),
          h('div', { className: 'batalha-card__local' }, `📍 ${batalha.local}`),
          h('div', { className: 'batalha-card__vs' },
            h('div', { className: 'batalha-vs batalha-vs--win' },
              h('span', { className: 'batalha-vs__lbl' }, 'Vencedor'),
              h('span', { className: 'batalha-vs__nome' }, batalha.vencedor)),
            h('div', { className: 'batalha-vs batalha-vs--lose' },
              h('span', { className: 'batalha-vs__lbl' }, 'Derrotado'),
              h('span', { className: 'batalha-vs__nome' }, batalha.perdedor))),
          h('div', { className: 'batalha-card__tatica' },
            h('span', { className: 'batalha-card__tatica-lbl' }, '⚔ Tática: '),
            batalha.tatica),
          h('p', { className: 'batalha-card__impacto' }, batalha.impacto))));
  };

  const searchEl = h('input', {
    type: 'search',
    placeholder: 'Buscar batalha, local ou exército…',
    className: 'forcas-search',
    oninput: (event: Event): void => {
      if (event.target instanceof HTMLInputElement) {
        search = event.target.value.toLowerCase();
        render();
      }
    }
  });

  render();
  return h('div', { className: 'batalha-page page-wrap' },
    buildImmersiveHero({
      kicker: 'BALUARTE · BATALHAS HISTÓRICAS',
      title: 'Batalhas Históricas',
      sub: 'DECISIVAS NA HISTÓRIA',
      desc: `${BATALHAS.length} batalhas decisivas que mudaram o curso da história.`,
      hudLeft: '🔰 ARQUIVO DE BATALHAS',
      hudRight: 'HISTÓRIA'
    }),
    h('div', { className: 'forcas-controls' }, searchEl),
    grid);
}
