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
    color: '#d4a24e',
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
    color: '#e8c07a',
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
    color: '#e8c07a',
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
  },
  {
    id: 'warhammer-40k',
    name: 'Warhammer 40.000',
    tagline: 'No futuro sombrio só existe guerra.',
    color: '#ffaa00',
    icon: '⚙',
    type: 'crossover',
    summary: 'Galáxia em guerra eterna sob o Imperium da Humanidade. A equipe HOTEL do Baluarte estuda a doutrina de atrito imperial e a corrupção do Caos.',
    keyFacts: [
      'Cenário: 41º milênio',
      'O Imperador no Trono Dourado há 10 mil anos',
      'Space Marines — soldados geneticamente aprimorados',
      'Inimigos: Caos, Tiranídeos, Necrons, Orks'
    ],
    factions: ['Imperium da Humanidade', 'Adeptus Astartes', 'Forças do Caos'],
    threats: ['Os Quatro Deuses do Caos', 'Enxame Tiranídeo', 'O Despertar Necron'],
    media: ['Estudo de doutrina: atrito imperial (HOTEL)'],
    arcs: []
  },
  {
    id: 'gundam',
    name: 'Mobile Suit Gundam',
    tagline: 'Pilotos jovens, guerras antigas.',
    color: '#66ddff',
    icon: '◇',
    type: 'crossover',
    summary: 'Conflitos orbitais travados por mobile suits gigantes. A equipe DELTA cruza a tecnologia Jaeger do Baluarte com a doutrina de pilotagem Newtype.',
    keyFacts: [
      'Mobile suits — mechas humanoides de combate',
      'Colônias espaciais x Terra',
      'Newtypes — humanos de percepção expandida',
      'Reactor de minóvio como fonte de energia'
    ],
    factions: ['Federação Terrestre', 'Principado de Zeon', 'Pilotos independentes'],
    threats: ['Guerra orbital total', 'Queda de colônias', 'Armas de extermínio em massa'],
    media: ['Cruzamento técnico: Jaeger Mk II × mobile suit (DELTA)'],
    arcs: []
  },
  {
    id: 'evangelion',
    name: 'Neon Genesis Evangelion',
    tagline: 'Sincronize. Ou seja consumido.',
    color: '#7c4dff',
    icon: '◉',
    type: 'crossover',
    summary: 'Crianças pilotam bio-mechas colossais contra os Anjos. A equipe INDIA estuda o trauma de sincronização e a fronteira entre piloto e máquina.',
    keyFacts: [
      'Evangelions — unidades bio-mecânicas pilotadas por sincronização',
      'Anjos — entidades de origem desconhecida',
      'Projeto de Instrumentalização Humana',
      'O Terceiro Impacto como ameaça final'
    ],
    factions: ['NERV', 'SEELE', 'Pilotos das Crianças'],
    threats: ['Os Anjos', 'O Terceiro Impacto', 'Colapso de identidade na sincronização'],
    media: ['Estudo psicológico: custo da sincronização (INDIA)'],
    arcs: []
  },
  {
    id: 'mass-effect',
    name: 'Mass Effect',
    tagline: 'A galáxia inteira contra a escuridão que vem das estrelas.',
    color: '#00ff88',
    icon: '✦',
    type: 'crossover',
    summary: 'Ópera espacial de civilizações unidas contra uma ameaça cíclica de extinção. A equipe JULIETT mapeia a doutrina de coalizão multiespécie.',
    keyFacts: [
      'Relés de Massa permitem viagem interestelar',
      'O Conselho da Cidadela governa a galáxia',
      'Os Ceifadores retornam a cada 50 mil anos',
      'Esquadrões multiespécie de operações especiais'
    ],
    factions: ['Aliança de Sistemas', 'Conselho da Cidadela', 'Esquadrão Normandy'],
    threats: ['Os Ceifadores', 'Indoutrinação', 'Extinção cíclica'],
    media: ['Doutrina de coalizão multiespécie (JULIETT)'],
    arcs: []
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk · Night City',
    tagline: 'Acorda, samurai. Há uma cidade pra queimar.',
    color: '#e8c07a',
    icon: '◈',
    type: 'crossover',
    summary: 'Metrópole distópica dominada por corporações e implantes cibernéticos. A equipe ROMEO estuda contra-inteligência corporativa e o risco da ciberpsicose.',
    keyFacts: [
      'Night City — megalópole sem lei',
      'Implantes cibernéticos (cyberware) ampliam o corpo',
      'Corporações acima do Estado',
      'Netrunners invadem mentes e sistemas'
    ],
    factions: ['Megacorporações', 'Mercenários (edgerunners)', 'Gangues de rua'],
    threats: ['Ciberpsicose', 'Guerra corporativa', 'IAs hostis além do Blackwall'],
    media: ['Contra-inteligência corporativa (ROMEO)'],
    arcs: []
  },
  {
    id: 'transformers',
    name: 'Transformers',
    tagline: 'Autobots, transformar e avançar!',
    color: '#2474d8',
    icon: '◈',
    type: 'crossover',
    summary: 'Robôs alienígenas sencientes de Cybertron — Autobots contra Decepticons. A equipe ALFA do Baluarte conta com Optimus Prime e Bumblebee (Bayverse) entre os ativos pesados.',
    keyFacts: [
      'Cybertronianos — máquinas vivas que se reconfiguram',
      'Autobots (Optimus Prime) × Decepticons (Megatron)',
      'AllSpark — fonte de vida cybertroniana',
      'Ativos pesados acoplados à equipe ALFA'
    ],
    factions: ['Autobots', 'Decepticons', 'ALFA Baluarte'],
    threats: ['Megatron', 'Decepticons', 'Predacons'],
    media: ['Crônicas: ativos ALFA (Optimus, Bumblebee)'],
    arcs: []
  },
  {
    id: 'monsterverse',
    name: 'Monsterverse · Titãs',
    tagline: 'Que os deuses-monstro reinem.',
    color: '#5ad84a',
    icon: '☢',
    type: 'crossover',
    summary: 'Titãs colossais — Godzilla, Kong, Shimo e Mothra. O Setor Gaia do Baluarte mantém habitats de contenção e os mobiliza como dissuasão estratégica.',
    keyFacts: [
      'Setor Gaia — contenção e habitat de Titãs',
      'Godzilla em habitat geotérmico',
      'Kong no bioma da Ilha da Caveira',
      'Mobilização como dissuasão de nível continental'
    ],
    factions: ['Setor Gaia Baluarte', 'Monarch (referência)', 'Titãs aliados'],
    threats: ['Titãs hostis', 'MUTOs', 'Desequilíbrio do ecossistema'],
    media: ['Dossiê: Setor Gaia (Godzilla, Kong, Shimo, Mothra)'],
    arcs: []
  },
  {
    id: 'titanfall',
    name: 'Titanfall',
    tagline: 'Standby for Titanfall.',
    color: '#ff7a1a',
    icon: '⬡',
    type: 'crossover',
    summary: 'Pilotos de mobilidade extrema vinculados a Titãs de combate com IA (BT-7274). O Baluarte integra o protocolo de vínculo piloto-Titã às unidades mecanizadas.',
    keyFacts: [
      'Titãs de combate com IA (BT-7274)',
      'Pilotos com parkour / wall-run',
      'Vínculo neural piloto-Titã',
      'Protocolo 3: Proteger o Piloto'
    ],
    factions: ['Militia da Fronteira', 'IMC (hostil)', 'Unidades Titã Baluarte'],
    threats: ['IMC', 'Titãs renegados'],
    media: ['Integração: vínculo piloto-Titã'],
    arcs: []
  },
  {
    id: 'god-of-war',
    name: 'God of War',
    tagline: 'A fúria de Esparta não se apaga.',
    color: '#c0392b',
    icon: '⚔',
    type: 'crossover',
    summary: 'Kratos, o Fantasma de Esparta e matador de panteões. Integra a equipe ALFA como ativo de nível divino contra ameaças mitológicas.',
    keyFacts: [
      'Kratos — o Fantasma de Esparta',
      'Lâminas do Caos · Machado Leviatã',
      'Matador de panteões (grego, nórdico)',
      'Ativo de nível divino da ALFA'
    ],
    factions: ['ALFA Baluarte', 'Panteões (hostis)'],
    threats: ['Deuses do Olimpo', 'Deuses de Asgard', 'Titãs mitológicos'],
    media: ['Dossiê: ALFA (Kratos)'],
    arcs: []
  },
  {
    id: 'devil-may-cry',
    name: 'Devil May Cry',
    tagline: 'Estiloso até o inferno e de volta.',
    color: '#d11f2d',
    icon: '◉',
    type: 'crossover',
    summary: 'Os filhos de Sparda — Dante e Vergil — caçadores de demônios. Reforçam a equipe ALFA contra incursões demoníacas, com estilo letal.',
    keyFacts: [
      'Dante e Vergil, filhos de Sparda',
      'Rebellion · Yamato · Devil Trigger',
      'Caça a demônios de alto nível',
      'Ativos ALFA de combate sobrenatural'
    ],
    factions: ['ALFA Baluarte', 'Legião demoníaca (hostil)'],
    threats: ['Demônios maiores', 'Mundus', 'O Mundo Demônio'],
    media: ['Dossiê: ALFA (Dante, Vergil)'],
    arcs: []
  },
  {
    id: 'fate',
    name: 'Fate',
    tagline: 'Espíritos heroicos respondem ao chamado.',
    color: '#2e6fd0',
    icon: '⚔',
    type: 'crossover',
    summary: 'Magos e Espíritos Heroicos da Guerra do Graal — Shirou, Saber, Rin e Archer. Núcleo místico da ALFA, com projeção de armas e nobres fantasmas.',
    keyFacts: [
      'Guerra do Santo Graal',
      'Saber (Artoria) — Excalibur',
      'Shirou Emiya — projeção de armas',
      'Servos heroicos invocados'
    ],
    factions: ['ALFA Baluarte', 'Servos aliados', 'Mestres rivais'],
    threats: ['Servos inimigos', 'Corrupção do Graal'],
    media: ['Dossiê: ALFA — Magos e Espíritos Heroicos'],
    arcs: []
  }
];

export const TOTAL_UNIVERSOS = UNIVERSOS.length;

export function findUniverso(id) {
  return UNIVERSOS.find((u) => u.id === id) || null;
}
