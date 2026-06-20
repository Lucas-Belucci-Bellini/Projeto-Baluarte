/**
 * /taticas-estrategias — Táticas & Estratégias Militares
 * Do Sun Tzu à guerra moderna de drones
 */

import { h } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive.js';

const PRINCIPIOS = [
  { nome: 'Concentração de Forças', desc: 'Reunir poder de combate superior no ponto decisivo.', origem: 'Clausewitz / Napoleão' },
  { nome: 'Surpresa', desc: 'Atacar onde, quando ou como o inimigo não espera.', origem: 'Sun Tzu' },
  { nome: 'Manobra', desc: 'Posicionar forças para criar vantagem antes do combate.', origem: 'Liddell Hart' },
  { nome: 'Economia de Forças', desc: 'Alocar o mínimo essencial em esforços secundários.', origem: 'Doutrina dos EUA' },
  { nome: 'Objetivo', desc: 'Toda operação deve mirar um alvo claro e decisivo.', origem: 'Princípios da Guerra' },
  { nome: 'Iniciativa', desc: 'Ditar o ritmo e forçar o inimigo a reagir.', origem: 'Guerra de Manobra' },
];

const TATICAS = [
  { nome: 'Blitzkrieg', era: 'WWII', desc: 'Guerra-relâmpago: blindados + ar concentrados rompem a linha e cercam.', exemplo: 'Invasão da França, 1940', cor: 'mod' },
  { nome: 'Movimento de Pinça', era: 'Antiga→Moderna', desc: 'Dois flancos envolvem o inimigo simultaneamente.', exemplo: 'Canas, 216 a.C. (Aníbal)', cor: 'ant' },
  { nome: 'Guerra de Trincheiras', era: 'WWI', desc: 'Defesa estática com linhas fortificadas; impasse sangrento.', exemplo: 'Frente Ocidental, 1914-18', cor: 'mod' },
  { nome: 'Guerrilha', era: 'Atemporal', desc: 'Forças irregulares usam emboscadas, mobilidade e terreno.', exemplo: 'Vietcong, 1955-75', cor: 'irr' },
  { nome: 'Falange', era: 'Antiga', desc: 'Formação cerrada de lanceiros com escudos sobrepostos.', exemplo: 'Hoplitas gregos', cor: 'ant' },
  { nome: 'Cerco', era: 'Atemporal', desc: 'Isolar e desgastar uma posição fortificada até a rendição.', exemplo: 'Constantinopla, 1453', cor: 'ant' },
  { nome: 'Choque e Pavor', era: 'Moderna', desc: 'Demonstração esmagadora de força para paralisar a vontade inimiga.', exemplo: 'Iraque, 2003', cor: 'mod' },
  { nome: 'Guerra Híbrida', era: 'Contemporânea', desc: 'Mistura de forças convencionais, irregulares, cyber e desinformação.', exemplo: 'Crimeia, 2014', cor: 'cont' },
  { nome: 'Guerra de Drones', era: 'Contemporânea', desc: 'UAVs de reconhecimento e ataque mudam o campo de batalha.', exemplo: 'Nagorno-Karabakh, 2020', cor: 'cont' },
  { nome: 'Defesa em Profundidade', era: 'Atemporal', desc: 'Múltiplas linhas defensivas que absorvem e desgastam o avanço.', exemplo: 'Kursk, 1943', cor: 'mod' },
  { nome: 'Envolvimento Vertical', era: 'Moderna', desc: 'Tropas aerotransportadas atrás das linhas inimigas.', exemplo: 'Dia D, 1944', cor: 'mod' },
  { nome: 'Negação de Área (A2/AD)', era: 'Contemporânea', desc: 'Mísseis e sensores impedem o inimigo de operar numa região.', exemplo: 'Mar do Sul da China', cor: 'cont' },
];

const ESTRATEGISTAS = [
  { nome: 'Sun Tzu', obra: 'A Arte da Guerra', epoca: '~500 a.C.', ideia: '"A suprema arte da guerra é subjugar o inimigo sem lutar."' },
  { nome: 'Carl von Clausewitz', obra: 'Da Guerra', epoca: '1832', ideia: '"A guerra é a continuação da política por outros meios."' },
  { nome: 'Antoine-Henri Jomini', obra: 'A Arte da Guerra', epoca: '1838', ideia: 'Sistematizou linhas de operação e pontos decisivos.' },
  { nome: 'B.H. Liddell Hart', obra: 'Estratégia', epoca: '1954', ideia: 'Abordagem indireta — evitar a força, atacar o equilíbrio.' },
  { nome: 'John Boyd', obra: 'Ciclo OODA', epoca: '1976', ideia: 'Observar-Orientar-Decidir-Agir mais rápido que o inimigo.' },
  { nome: 'Mao Tsé-Tung', obra: 'Guerra de Guerrilha', epoca: '1937', ideia: '"O inimigo avança, nós recuamos; ele acampa, nós o fustigamos."' },
];

export function taticasEstrategiasPage() {
  return h('div', { className: 'tat-page page-wrap' },
    buildImmersiveHero({
      kicker: 'BALUARTE · TÁTICAS & ESTRATÉGIAS',
      title: 'Táticas & Estratégias',
      sub: 'A ARTE DA GUERRA',
      desc: 'Princípios, táticas e os grandes pensadores da guerra — do Sun Tzu ao drone warfare.',
      hudLeft: '🗺 DOUTRINA', hudRight: 'SUN TZU → DRONE'
    }),

    h('section', { className: 'tat-section' },
      h('h2', { className: 'tat-section-title' }, '⚖ Princípios da Guerra'),
      h('div', { className: 'tat-princ-grid' },
        ...PRINCIPIOS.map(p =>
          h('div', { className: 'tat-princ' },
            h('div', { className: 'tat-princ__nome' }, p.nome),
            h('p', { className: 'tat-princ__desc' }, p.desc),
            h('span', { className: 'tat-princ__origem' }, p.origem)
          )
        )
      )
    ),

    h('section', { className: 'tat-section' },
      h('h2', { className: 'tat-section-title' }, '⚔ Táticas Clássicas e Modernas'),
      h('div', { className: 'tat-grid' },
        ...TATICAS.map(t =>
          h('div', { className: `tat-card tat-card--${t.cor}` },
            h('div', { className: 'tat-card__head' },
              h('span', { className: 'tat-card__nome' }, t.nome),
              h('span', { className: 'tat-card__era' }, t.era)
            ),
            h('p', { className: 'tat-card__desc' }, t.desc),
            h('div', { className: 'tat-card__ex' }, `▸ ${t.exemplo}`)
          )
        )
      )
    ),

    h('section', { className: 'tat-section' },
      h('h2', { className: 'tat-section-title' }, '📖 Grandes Estrategistas'),
      h('div', { className: 'tat-estr-grid' },
        ...ESTRATEGISTAS.map(e =>
          h('div', { className: 'tat-estr' },
            h('div', { className: 'tat-estr__head' },
              h('span', { className: 'tat-estr__nome' }, e.nome),
              h('span', { className: 'tat-estr__epoca' }, e.epoca)
            ),
            h('div', { className: 'tat-estr__obra' }, e.obra),
            h('p', { className: 'tat-estr__ideia' }, e.ideia)
          )
        )
      )
    )
  );
}
