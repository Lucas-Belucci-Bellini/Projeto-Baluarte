/**
 * /tecnologia-militar — plataformas e sistemas de combate por domínio.
 */

import '../styles/militar.css';
import { h } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive.js';

type TechDomainId = 'terra' | 'ar' | 'mar' | 'espaco' | 'futuro';
type TechStatus = 'Operacional' | 'Implantação' | 'Teste' | 'Pesquisa' | 'Desenvolvimento' | 'Controverso';

interface TechDomain {
  id: TechDomainId;
  label: string;
  icon: string;
}

interface TechItem {
  nome: string;
  desc: string;
  exemplos: readonly string[];
  status: TechStatus;
}

const DOMINIOS: readonly TechDomain[] = [
  { id: 'terra', label: 'Terrestre', icon: '🚜' },
  { id: 'ar', label: 'Aéreo', icon: '✈' },
  { id: 'mar', label: 'Naval', icon: '🚢' },
  { id: 'espaco', label: 'Espaço & Cyber', icon: '🛰' },
  { id: 'futuro', label: 'Emergente', icon: '⚡' }
];

const TECH: Readonly<Record<TechDomainId, readonly TechItem[]>> = {
  terra: [
    { nome: 'Sistema de Proteção Ativa (APS)', desc: 'Trophy, Iron Fist — interceptam projéteis antitanque antes do impacto.', exemplos: ['Trophy (Israel)', 'Arena (Rússia)'], status: 'Operacional' },
    { nome: 'Robôs de Combate (UGV)', desc: 'Veículos terrestres não tripulados para reconhecimento e fogo.', exemplos: ['THeMIS', 'Uran-9'], status: 'Implantação' },
    { nome: 'Exoesqueletos', desc: 'Aumentam capacidade de carga e resistência do soldado.', exemplos: ['TALOS (cancelado)', 'Guardian XO'], status: 'Pesquisa' },
    { nome: 'Blindagem reativa explosiva (ERA)', desc: 'Painéis que detonam para neutralizar cargas ocas.', exemplos: ['Kontakt-5', 'Relikt'], status: 'Operacional' },
    { nome: 'Soldado conectado', desc: 'HUD, comunicação em rede, visão noturna integrada.', exemplos: ['IVAS (HoloLens)', 'FELIN'], status: 'Implantação' }
  ],
  ar: [
    { nome: 'Furtividade (Stealth)', desc: 'Geometria e materiais que reduzem assinatura de radar.', exemplos: ['F-35', 'B-21 Raider'], status: 'Operacional' },
    { nome: 'Drones de combate (UCAV)', desc: 'Aeronaves não tripuladas armadas e de reconhecimento.', exemplos: ['MQ-9 Reaper', 'Bayraktar TB2'], status: 'Operacional' },
    { nome: 'Loyal Wingman', desc: 'Drones autônomos que voam ao lado de caças tripulados.', exemplos: ['XQ-58 Valkyrie', 'MQ-28 Ghost Bat'], status: 'Teste' },
    { nome: 'Sensor Fusion', desc: 'Integração de radar, IRST e dados em uma única imagem tática.', exemplos: ['F-35 DAS', 'AESA radar'], status: 'Operacional' },
    { nome: 'Enxames de drones', desc: 'Centenas de drones coordenados por IA para saturação.', exemplos: ['Perdix', 'Projeto OFFSET'], status: 'Pesquisa' }
  ],
  mar: [
    { nome: 'Propulsão nuclear', desc: 'Autonomia praticamente ilimitada para porta-aviões e submarinos.', exemplos: ['Classe Ford', 'Classe Virginia'], status: 'Operacional' },
    { nome: 'Catapulta eletromagnética (EMALS)', desc: 'Substitui catapultas a vapor, lançamento mais suave.', exemplos: ['USS Gerald Ford'], status: 'Operacional' },
    { nome: 'Navios não tripulados (USV)', desc: 'Embarcações autônomas para patrulha e guerra de minas.', exemplos: ['Sea Hunter', 'Orca XLUUV'], status: 'Teste' },
    { nome: 'Sistema AEGIS', desc: 'Comando e controle integrado para defesa antiaérea/antimíssil.', exemplos: ['Arleigh Burke', 'Ticonderoga'], status: 'Operacional' },
    { nome: 'Sonar de matriz rebocada', desc: 'Detecção de submarinos a longa distância.', exemplos: ['SQR-19', 'CAPTAS-4'], status: 'Operacional' }
  ],
  espaco: [
    { nome: 'Satélites de reconhecimento', desc: 'Imagens de alta resolução e SIGINT do espaço.', exemplos: ['KH-11', 'Lacrosse'], status: 'Operacional' },
    { nome: 'GPS militar (M-code)', desc: 'Sinal criptografado anti-jamming para navegação precisa.', exemplos: ['GPS III'], status: 'Operacional' },
    { nome: 'Armas anti-satélite (ASAT)', desc: 'Mísseis e sistemas para destruir satélites inimigos.', exemplos: ['RS-28', 'SM-3'], status: 'Operacional' },
    { nome: 'Guerra cibernética', desc: 'Operações ofensivas e defensivas em redes.', exemplos: ['Stuxnet', 'Cyber Command'], status: 'Operacional' },
    { nome: 'Comunicação quântica', desc: 'Criptografia teoricamente inviolável via emaranhamento.', exemplos: ['Micius (China)'], status: 'Pesquisa' }
  ],
  futuro: [
    { nome: 'Armas hipersônicas', desc: 'Velocidade acima de Mach 5, manobráveis, difíceis de interceptar.', exemplos: ['Avangard', 'DF-17', 'Dark Eagle'], status: 'Implantação' },
    { nome: 'Armas de energia dirigida (laser)', desc: 'Lasers de alta potência contra drones e mísseis.', exemplos: ['HELIOS', 'Iron Beam'], status: 'Teste' },
    { nome: 'Railgun', desc: 'Canhão eletromagnético com projéteis a Mach 7.', exemplos: ['BAE Railgun (pausado)'], status: 'Pesquisa' },
    { nome: 'IA de comando', desc: 'Sistemas que apoiam (ou tomam) decisões táticas em tempo real.', exemplos: ['Project Maven', 'JADC2'], status: 'Desenvolvimento' },
    { nome: 'Armas autônomas letais (LAWS)', desc: 'Sistemas que selecionam e engajam alvos sem humano no loop.', exemplos: ['Debate ético em curso'], status: 'Controverso' }
  ]
};

const STATUS_CLS: Readonly<Record<TechStatus, string>> = {
  Operacional: 'op',
  Implantação: 'impl',
  Teste: 'teste',
  Pesquisa: 'pesq',
  Desenvolvimento: 'pesq',
  Controverso: 'contro'
};

export function tecnologiaMilitarPage(): HTMLDivElement {
  let activeDomain: TechDomainId = 'terra';
  const grid = h('div', { className: 'tech-grid' });
  const tabBar = h('div', { className: 'arsx-tabs' });
  const tabButtons: Partial<Record<TechDomainId, HTMLButtonElement>> = {};

  const render = (): void => {
    grid.innerHTML = '';
    TECH[activeDomain].forEach((tech) => {
      grid.appendChild(
        h('div', { className: 'tech-card' },
          h('div', { className: 'tech-card__head' },
            h('span', { className: 'tech-card__nome' }, tech.nome),
            h('span', { className: `tech-status tech-status--${STATUS_CLS[tech.status]}` }, tech.status)),
          h('p', { className: 'tech-card__desc' }, tech.desc),
          h('div', { className: 'tech-card__ex' },
            h('span', { className: 'tech-card__ex-label' }, 'Exemplos: '),
            ...tech.exemplos.map((example) => h('span', { className: 'tech-chip' }, example)))));
    });
  };

  DOMINIOS.forEach((domain) => {
    const button = h('button', {
      className: `arsx-tab${domain.id === activeDomain ? ' is-active' : ''}`,
      onclick: (): void => {
        tabButtons[activeDomain]?.classList.remove('is-active');
        activeDomain = domain.id;
        tabButtons[domain.id]?.classList.add('is-active');
        render();
      }
    }, `${domain.icon} ${domain.label}`);
    tabButtons[domain.id] = button;
    tabBar.appendChild(button);
  });
  render();

  return h('div', { className: 'tech-page page-wrap' },
    buildImmersiveHero({
      kicker: 'BALUARTE · TECNOLOGIA MILITAR',
      title: 'Tecnologia Militar',
      sub: 'SISTEMAS DE COMBATE',
      desc: 'Plataformas e sistemas de combate por domínio — do soldado conectado às armas hipersônicas.',
      variant: 'lightrays',
      hudLeft: '🚀 PLATAFORMAS',
      hudRight: 'POR DOMÍNIO'
    }),
    tabBar,
    grid);
}
