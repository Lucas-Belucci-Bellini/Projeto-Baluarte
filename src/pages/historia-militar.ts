/**
 * /historia-militar — linha do tempo por era, da pré-história à guerra moderna.
 */

import '../styles/militar.css';
import { h } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive';

interface Era {
  id: string;
  nome: string;
  periodo: string;
  cor: string;
  resumo: string;
  marcos: readonly string[];
}

const ERAS: readonly Era[] = [
  { id: 'prehist', nome: 'Pré-História & Antiguidade', periodo: '3000 a.C. – 500 a.C.', cor: 'era1', resumo: 'Primeiras armas de bronze, carros de guerra, exércitos profissionais surgem na Mesopotâmia, Egito e Assíria.', marcos: ['Carros de guerra sumérios e egípcios', 'Exército permanente assírio (armas de ferro)', 'Falange hoplita grega', 'Batalha de Kadesh (1274 a.C.) — primeira batalha bem documentada'] },
  { id: 'classica', nome: 'Era Clássica', periodo: '500 a.C. – 476 d.C.', cor: 'era2', resumo: 'Auge das legiões romanas e das táticas gregas/macedônicas. Engenharia de cerco e logística em escala imperial.', marcos: ['Falange macedônica de Alexandre, o Grande', 'Legiões romanas — manípulos e coortes', 'Batalha de Canas (216 a.C.) — duplo envolvimento de Aníbal', 'Guerras Púnicas, conquistas de César'] },
  { id: 'medieval', nome: 'Idade Média', periodo: '476 – 1492', cor: 'era3', resumo: 'Cavalaria pesada, castelos, arco longo e o início da pólvora. Cruzadas e invasões mongóis remodelam o mundo.', marcos: ['Cavaleiros e feudalismo militar', 'Arco longo inglês (Crécy, 1346)', 'Arqueiros montados mongóis de Genghis Khan', 'Queda de Constantinopla (1453) — canhões derrubam muralhas'] },
  { id: 'polvora', nome: 'Era da Pólvora', periodo: '1492 – 1815', cor: 'era4', resumo: 'Mosquetes, artilharia e exércitos de linha. A guerra se torna estatal e massiva, culminando nas Guerras Napoleônicas.', marcos: ['Tercios espanhóis (pique e mosquete)', 'Revolução militar — infantaria de linha', 'Guerras Napoleônicas — corpos de exército e conscrição', 'Artilharia móvel padronizada'] },
  { id: 'industrial', nome: 'Era Industrial', periodo: '1815 – 1914', cor: 'era5', resumo: 'Ferrovias, telégrafo, rifles de retrocarga e metralhadoras transformam logística e poder de fogo.', marcos: ['Guerra Civil Americana (1861-65) — primeira guerra industrial', 'Metralhadora Gatling / Maxim', 'Couraçados a vapor', 'Mobilização por ferrovia'] },
  { id: 'mundiais', nome: 'Guerras Mundiais', periodo: '1914 – 1945', cor: 'era6', resumo: 'Guerra total e mecanizada: trincheiras, tanques, aviação, submarinos e, por fim, a arma nuclear.', marcos: ['WWI — trincheiras, gás, primeiros tanques e aviões', 'Blitzkrieg alemã na WWII', 'Porta-aviões dominam o Pacífico', 'Bombas atômicas em Hiroshima e Nagasaki (1945)'] },
  { id: 'friacont', nome: 'Guerra Fria & Contemporânea', periodo: '1945 – hoje', cor: 'era7', resumo: 'Dissuasão nuclear, guerras por procuração, mísseis, guerra eletrônica, drones e domínios cyber/espacial.', marcos: ['Corrida nuclear e MAD (destruição mútua assegurada)', 'Guerras do Vietnã e do Golfo', 'Mísseis de precisão e furtividade', 'Guerra de drones e cibernética (séc. XXI)'] }
];

export function historiaMilitarPage(): HTMLDivElement {
  const timeline = h('div', { className: 'hist-timeline' });

  ERAS.forEach((era) => {
    const detail = h('div', { className: 'hist-detail' },
      h('p', { className: 'hist-detail__resumo' }, era.resumo),
      h('ul', { className: 'hist-detail__marcos' },
        ...era.marcos.map((marco) => h('li', null, marco))));
    detail.style.display = 'none';

    const node = h('div', { className: `hist-era hist-era--${era.cor}` });
    const header = h('button', {
      className: 'hist-era__header',
      onclick: (): void => {
        const open = detail.style.display === 'block';
        detail.style.display = open ? 'none' : 'block';
        node.classList.toggle('is-open', !open);
      }
    },
      h('div', null,
        h('div', { className: 'hist-era__nome' }, era.nome),
        h('div', { className: 'hist-era__periodo' }, era.periodo)),
      h('span', { className: 'hist-era__toggle' }, '▾'));
    node.appendChild(h('div', { className: 'hist-era__dot' }));
    node.appendChild(h('div', { className: 'hist-era__body' }, header, detail));
    timeline.appendChild(node);
  });

  return h('div', { className: 'hist-page page-wrap' },
    buildImmersiveHero({
      kicker: 'BALUARTE · HISTÓRIA MILITAR',
      title: 'História Militar',
      sub: 'DA PRÉ-HISTÓRIA À ERA MODERNA',
      desc: 'Da pré-história à guerra moderna — clique em cada era para ver os marcos.',
      hudLeft: '📜 LINHA DO TEMPO',
      hudRight: 'ERAS'
    }),
    timeline);
}
