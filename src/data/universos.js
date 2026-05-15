/**
 * Universos do Baluarte (Fase 16).
 *
 * Crossovers narrativos: cada universo tem lore, personagens,
 * conexão com o Baluarte e link para arcos das Crônicas.
 */

export const UNIVERSOS = [
  {
    id: 'baluarte',
    name: 'Baluarte',
    tagline: 'O Núcleo Infinity Dreadnought.',
    color: '#00f0ff',
    icon: '⬡',
    type: 'core',
    summary: 'O universo principal: o Mark XIII, as 26 equipes ALFA-ZULU, o Núcleo, Lucas Belucci Bellini como operador-líder.',
    keyFacts: [
      'Núcleo Infinity Dreadnought · 13ª iteração',
      '26 equipes operacionais (alfabeto OTAN)',
      'Comando: Lucas Belucci Bellini',
      'Sede: Setor 0, bunker subterrâneo'
    ],
    factions: ['Comando Baluarte', 'Mesa Vermelha (NOVEMBER)', 'Forja (QUEBEC)'],
    threats: ['Pacto da Sombra (interno)', 'Convergência de divindades'],
    media: ['Crônicas (24 arcos)', 'Audio: Tema do Núcleo Infinity'],
    arcs: ['alfa-despertar', 'tango-decimo-terceiro', 'november-convergencia']
  },
  {
    id: 'doom',
    name: 'DOOM',
    tagline: 'Quando o inferno se abre, alguém precisa fechar.',
    color: '#ff3355',
    icon: '◉',
    type: 'crossover',
    summary: 'Universo do Slayer. Demônios surgem de fendas dimensionais em estações espaciais. Equipe BRAVO (Guardas do Limiar) responde a esses eventos.',
    keyFacts: [
      'Origem dimensional: Inferno',
      'Picos térmicos > 4000 K em aberturas',
      'Equipe responsável: BRAVO',
      'Base de operações: Phobos / Mobile'
    ],
    factions: ['Forças do Inferno', 'UAC (referência)', 'BRAVO Baluarte'],
    threats: ['Cacodemons', 'Hell Knights', 'Marauders', 'Mancubus'],
    media: ['Crônicas: Sinal de Phobos (BRAVO)'],
    arcs: ['bravo-phobos']
  },
  {
    id: 'halo',
    name: 'Halo',
    tagline: 'Reach caiu. Spartans não esquecem.',
    color: '#00ff88',
    icon: '✦',
    type: 'crossover',
    summary: 'Universo UNSC vs Covenant. A queda de Reach é catalogada nas Crônicas. CHARLIE é a equipe que ficou em terra para evacuação de civis.',
    keyFacts: [
      'Queda de Reach: ano-zero do crossover',
      'UNSC + Spartans alinhados com Baluarte',
      'CHARLIE: status BAIXA (perdas catastróficas)',
      'Recuperação do capacete: 7 anos depois'
    ],
    factions: ['UNSC', 'Spartans-II/III/IV', 'Covenant (hostis)', 'ONI (suspeito)'],
    threats: ['Elites (Sangheili)', 'Brutes', 'Hunters', 'The Flood'],
    media: ['Crônicas: Vermelho de Reach (CHARLIE)'],
    arcs: ['charlie-reach']
  },
  {
    id: 'pacific-rim',
    name: 'Pacific Rim',
    tagline: 'Drift compatible. Apocalypse incoming.',
    color: '#7c4dff',
    icon: '⚛',
    type: 'crossover',
    summary: 'Kaiju emergem do Pacífico. DELTA pilota o Jaeger Mark II Baluarte (460mm plasma cannon). Drift sustentado de até 7 horas.',
    keyFacts: [
      'Primeiro Kaiju: 2046',
      'Jaeger Mark II Baluarte: 80 metros, 1.7M kg',
      'Pilotos: Lucas + DELTA (Sasha Ferguson)',
      'Cordão neural 4ª geração'
    ],
    factions: ['PPDC', 'DELTA Baluarte', 'MIKE (Mortar TITAN)'],
    threats: ['Kaiju Cat-IV/V', 'Precursores'],
    media: ['Crônicas: Onda Vermelha (DELTA)', 'Resposta TITAN (MIKE)'],
    arcs: ['delta-onda', 'mike-titan']
  },
  {
    id: 'solo-leveling',
    name: 'Solo Leveling',
    tagline: 'Arise.',
    color: '#ff00aa',
    icon: '◊',
    type: 'crossover',
    summary: 'Gates dimensionais abrem em metrópoles. O Sistema escolhe Caçadores. ECHO Baluarte = squad de Hunters S-rank, classificação real ainda mais elevada.',
    keyFacts: [
      'Primeiro gate: 2044 (Tóquio)',
      'Sistema escolhe portadores',
      'ECHO: classe oficial S, real Ω',
      'Lucas: único portador da Sombra Imperial'
    ],
    factions: ['Hunter Association', 'ECHO Baluarte', 'Monarcas (hostis)'],
    threats: ['Demon Knights', 'Frost Dragon', 'Iron Golems', 'Monarcas'],
    media: ['Crônicas: Sistema Aberto (ECHO)'],
    arcs: ['echo-sistema']
  },
  {
    id: 'vanadis',
    name: 'Madan no Vanadis',
    tagline: 'As lâminas escolhem seus portadores.',
    color: '#ffd700',
    icon: '⚔',
    type: 'crossover',
    summary: 'Sete Lordes da Guerra carregam armas que escolhem seus portadores. FOXTROT são os sete portadores ativos. Quem é rejeitado morre.',
    keyFacts: [
      'Sete Lâminas Vanadis',
      'Lorde-de-Guerra atual: Sasha (Yankee)',
      'Operador solo YANKEE (independente)',
      'Photon Sword VANADIS · Equipamento experimental'
    ],
    factions: ['Sete Lordes da Guerra', 'FOXTROT Baluarte', 'YANKEE (solo)'],
    threats: ['Portadores rejeitados', 'Maldição das lâminas'],
    media: ['Crônicas: Lâminas de Vanadis (FOXTROT)'],
    arcs: ['foxtrot-vanadis']
  },
  {
    id: 'arifureta',
    name: 'Arifureta',
    tagline: 'A porta abre dos dois lados.',
    color: '#00ff88',
    icon: '✦',
    type: 'crossover',
    summary: 'Pesquisa de portais bidimensionais. VICTOR atravessou para Arifureta em 2046 e retornou após 9 meses subjetivos. Magia funciona; tecnologia falha.',
    keyFacts: [
      'Travessia: 2046',
      'Permanência subjetiva: 9 meses',
      'Magia funcional, eletrônica falha',
      'Anel transmutador como tecnologia compatível'
    ],
    factions: ['VICTOR Baluarte', 'Reino do outro lado'],
    threats: ['Bestas mágicas', 'Sintetistas hostis'],
    media: ['Crônicas: Travessia (VICTOR)'],
    arcs: ['victor-travessia']
  },
  {
    id: 'horror',
    name: 'Horror Cósmico',
    tagline: 'Sinais que não deveriam ser ouvidos.',
    color: '#ff00aa',
    icon: '~',
    type: 'crossover',
    summary: 'Transmissões anômalas em frequências específicas afetam a mente. INDIA monitora 24/7 a Frequência 11. Quem escuta nunca volta normal.',
    keyFacts: [
      'Frequência 11 ativa às 03:13 AM',
      'Equipe INDIA: combate paranormal',
      'Sonic Disruptor LOKI · arma anti-mente',
      'Headphones com filtro neural obrigatórios'
    ],
    factions: ['INDIA Baluarte', 'BRAVO (transbordo)', 'ZULU (catalogação)'],
    threats: ['Entidades sonoras', 'Divindades antigas', 'Vozes do outro lado'],
    media: ['Crônicas: Frequência 11 (INDIA)', 'Audio: gravações INDIA'],
    arcs: ['india-frequencia']
  },
  {
    id: 'endfield',
    name: 'Arknights · Endfield',
    tagline: 'Operadores em mundo alien.',
    color: '#66ddff',
    icon: '◇',
    type: 'crossover',
    summary: 'Operações em planeta classe-T (Talos II). Cross-link com JULIETT (orbital). Endfield Foundation aliada formal.',
    keyFacts: [
      'Planeta: Talos II',
      'JULIETT compatível com fauna local',
      'Energia: Originium controlado',
      'Operação conjunta com Endfield Foundation'
    ],
    factions: ['Endfield Foundation', 'JULIETT Baluarte', 'Reunion (hostis residuais)'],
    threats: ['Catatumbo storms', 'Originium beasts', 'Sui-tipo entities'],
    media: ['Próximo arco (TBD)'],
    arcs: []
  },
  {
    id: 'cronicas-zulu',
    name: 'Convergência Divina',
    tagline: 'Quando os deuses sangram, eles podem morrer.',
    color: '#ff3355',
    icon: '☉',
    type: 'core',
    summary: 'Arco final das Crônicas. ZULU cataloga divindades que apareceram durante a Convergência. 11 entidades documentadas, 3 mortas, 1 capturada.',
    keyFacts: [
      'Início: 2047',
      'Entidades catalogadas: 11',
      'Status: 3 KIA, 1 capturada, 7 em monitoramento',
      'Selo de Salomão V4 em ativação contínua'
    ],
    factions: ['ZULU Baluarte', 'Comando central', 'BRAVO (suporte)'],
    threats: ['Marduk', 'Anubis', 'Tiamat', 'Odin', 'Susanoo', 'Outros 6'],
    media: ['Crônicas: Onde os Deuses Sangram (ZULU)'],
    arcs: ['zulu-deuses-sangram']
  }
];

export const TOTAL_UNIVERSOS = UNIVERSOS.length;

export function findUniverso(id) {
  return UNIVERSOS.find((u) => u.id === id) || null;
}
