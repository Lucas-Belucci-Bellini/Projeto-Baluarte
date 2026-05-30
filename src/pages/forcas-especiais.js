/**
 * /forcas-especiais — Elites & Forças Especiais do Mundo
 * SOF (Special Operations Forces) por país
 */

import { h } from '../utils/helpers.js';

const SOF = [
  { nome: 'Delta Force (1st SFOD-D)', pais: '🇺🇸 EUA', ramo: 'Exército', fundacao: 1977, papel: 'Contraterrorismo, resgate de reféns', lema: 'Tier 1', cor: 'eua',
    nota: 'Unidade Tier 1 de elite do JSOC, altamente secreta.' },
  { nome: 'SEAL Team 6 (DEVGRU)', pais: '🇺🇸 EUA', ramo: 'Marinha', fundacao: 1980, papel: 'Contraterrorismo marítimo, direct action', lema: 'The Only Easy Day Was Yesterday', cor: 'eua',
    nota: 'Conduziu a operação que eliminou Osama bin Laden (2011).' },
  { nome: 'Green Berets', pais: '🇺🇸 EUA', ramo: 'Exército', fundacao: 1952, papel: 'Guerra não-convencional, treinamento', lema: 'De Oppresso Liber', cor: 'eua',
    nota: 'Forças Especiais focadas em operar com forças locais.' },
  { nome: 'SAS', pais: '🇬🇧 Reino Unido', ramo: 'Exército', fundacao: 1941, papel: 'Contraterrorismo, reconhecimento', lema: 'Who Dares Wins', cor: 'uk',
    nota: 'Referência mundial de SOF; cerco da embaixada iraniana (1980).' },
  { nome: 'SBS', pais: '🇬🇧 Reino Unido', ramo: 'Marinha Real', fundacao: 1940, papel: 'Operações marítimas especiais', lema: 'By Strength and Guile', cor: 'uk',
    nota: 'Equivalente naval do SAS.' },
  { nome: 'Spetsnaz', pais: '🇷🇺 Rússia', ramo: 'GRU/FSB', fundacao: 1949, papel: 'Reconhecimento, sabotagem, CT', lema: '—', cor: 'rus',
    nota: 'Termo genérico para várias unidades especiais russas (Alpha, Vympel).' },
  { nome: 'Sayeret Matkal', pais: '🇮🇱 Israel', ramo: 'FDI', fundacao: 1957, papel: 'Inteligência, resgate de reféns', lema: 'Quem ousa, vence', cor: 'isr',
    nota: 'Conduziu a Operação Entebbe (1976).' },
  { nome: 'Shayetet 13', pais: '🇮🇱 Israel', ramo: 'Marinha', fundacao: 1948, papel: 'Operações navais especiais', lema: '—', cor: 'isr',
    nota: 'Comandos navais de elite de Israel.' },
  { nome: 'GIGN', pais: '🇫🇷 França', ramo: 'Gendarmerie', fundacao: 1974, papel: 'Contraterrorismo, resgate', lema: "S'engager pour la vie", cor: 'fra',
    nota: 'Resolveu o sequestro do voo Air France 8969 (1994).' },
  { nome: 'Commandos Marine', pais: '🇫🇷 França', ramo: 'Marinha', fundacao: 1942, papel: 'Operações marítimas, CT', lema: '—', cor: 'fra',
    nota: 'Herdeiros dos comandos da França Livre.' },
  { nome: 'KSK', pais: '🇩🇪 Alemanha', ramo: 'Exército', fundacao: 1996, papel: 'Operações especiais, CT', lema: 'Facit Omnia Voluntas', cor: 'ger',
    nota: 'Kommando Spezialkräfte, formado após o caso da Somália.' },
  { nome: 'GSG 9', pais: '🇩🇪 Alemanha', ramo: 'Polícia Federal', fundacao: 1972, papel: 'Contraterrorismo policial', lema: '—', cor: 'ger',
    nota: 'Criado após o massacre de Munique (1972); resgate de Mogadíscio (1977).' },
  { nome: 'JW GROM', pais: '🇵🇱 Polônia', ramo: 'Forças Especiais', fundacao: 1990, papel: 'CT, direct action', lema: 'Tobie Ojczyzno', cor: 'pol',
    nota: 'Uma das SOF mais respeitadas da OTAN.' },
  { nome: 'SSG (Black Storks)', pais: '🇵🇰 Paquistão', ramo: 'Exército', fundacao: 1956, papel: 'CT, reconhecimento profundo', lema: '—', cor: 'pak',
    nota: 'Special Service Group, treino com SOF dos EUA e China.' },
  { nome: 'Snow Leopard Commando', pais: '🇨🇳 China', ramo: 'Polícia Armada', fundacao: 2002, papel: 'Contraterrorismo', lema: '—', cor: 'chn',
    nota: 'Unidade CT de elite chinesa.' },
  { nome: 'MARCOS', pais: '🇮🇳 Índia', ramo: 'Marinha', fundacao: 1987, papel: 'Operações marítimas especiais', lema: 'The Few The Fearless', cor: 'ind',
    nota: 'Marine Commandos indianos.' },
  { nome: 'Para SF', pais: '🇮🇳 Índia', ramo: 'Exército', fundacao: 1966, papel: 'Direct action, CT', lema: 'Men Apart', cor: 'ind',
    nota: 'Paraquedistas de elite indianos.' },
  { nome: 'JTF2', pais: '🇨🇦 Canadá', ramo: 'Forças Armadas', fundacao: 1993, papel: 'CT, direct action', lema: '—', cor: 'can',
    nota: 'Joint Task Force 2, recorde de tiro de sniper de longa distância.' },
  { nome: 'SASR', pais: '🇦🇺 Austrália', ramo: 'Exército', fundacao: 1957, papel: 'Reconhecimento, CT', lema: 'Who Dares Wins', cor: 'aus',
    nota: 'Special Air Service Regiment australiano.' },
  { nome: 'COMSUBIN', pais: '🇮🇹 Itália', ramo: 'Marinha', fundacao: 1952, papel: 'Mergulho de combate, CT naval', lema: '—', cor: 'ita',
    nota: 'Descendente dos lendários assaltadores italianos da 2ª Guerra.' },
  { nome: 'BOPE', pais: '🇧🇷 Brasil', ramo: 'Polícia Militar RJ', fundacao: 1978, papel: 'Operações urbanas, CT', lema: 'Faca na Caveira', cor: 'bra',
    nota: 'Batalhão de Operações Especiais, atuação em ambiente urbano complexo.' },
  { nome: 'COT', pais: '🇧🇷 Brasil', ramo: 'Polícia Federal', fundacao: 1986, papel: 'Contraterrorismo federal', lema: '—', cor: 'bra',
    nota: 'Comando de Operações Táticas da PF.' },
];

export function forcasEspeciaisPage() {
  let search = '';
  const grid = h('div', { className: 'sof-grid' });
  const searchEl = h('input', {
    type: 'search', placeholder: '🔍 Buscar unidade ou país…', className: 'forcas-search',
    oninput: e => { search = e.target.value.toLowerCase(); render(); }
  });

  function render() {
    grid.innerHTML = '';
    const items = SOF.filter(u =>
      u.nome.toLowerCase().includes(search) ||
      u.pais.toLowerCase().includes(search) ||
      u.papel.toLowerCase().includes(search)
    );
    for (const u of items) {
      grid.appendChild(
        h('div', { className: `sof-card sof-card--${u.cor}` },
          h('div', { className: 'sof-card__head' },
            h('span', { className: 'sof-card__nome' }, u.nome),
            h('span', { className: 'sof-card__ano' }, `est. ${u.fundacao}`)
          ),
          h('div', { className: 'sof-card__meta' },
            h('span', { className: 'sof-card__pais' }, u.pais),
            h('span', { className: 'sof-card__ramo' }, u.ramo)
          ),
          h('div', { className: 'sof-card__papel' }, u.papel),
          u.lema !== '—' && h('div', { className: 'sof-card__lema' }, `« ${u.lema} »`),
          h('p', { className: 'sof-card__nota' }, u.nota)
        )
      );
    }
  }
  render();

  return h('div', { className: 'sof-page page-wrap' },
    h('div', { className: 'page-hero' },
      h('h1', null, '🪖 Elites & Forças Especiais'),
      h('p', { className: 'u-text-muted' }, `${SOF.length} unidades de operações especiais (SOF) de elite ao redor do mundo.`)
    ),
    h('div', { className: 'forcas-controls' }, searchEl),
    grid
  );
}
