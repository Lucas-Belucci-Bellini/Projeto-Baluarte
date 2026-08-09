/**
 * Crônicas da Baluarte (Fase 12).
 *
 * 24 arcos narrativos do universo Baluarte com capítulos.
 * Cada arco é editável — substitua o `content` por texto completo
 * (estes são esqueletos com sinopse + abertura de capítulo).
 *
 * Estrutura:
 *   { id, title, code, universe, tags, synopsis, cover, equipe, chapters: [{ id, title, content }] }
 *
 * A saga canônica "Onde os Deuses Sangram" (24 arcos, 200+ capítulos)
 * é grande demais para o bundle — carrega sob demanda via loadSaga().
 */

import { buscarDataset } from '../core/dados-remotos.js';
import fanficUrl from './fanfic.json?url';

const slayer = `O ar dentro do bunker cheirava a ozônio queimado e ferro. Lucas
sentiu o pulsar do Núcleo Infinity Dreadnought atrás do peitoral
reforçado, sincronizado com os batimentos do seu próprio coração.

— Equipe ALFA, status — a voz da operadora ecoou nos comms.

Ele inalou. Ergueu a carbina. Aquela porta não era apenas o limiar
de um corredor. Era a fronteira entre o que ele sabia e tudo que viria
depois. Tocou o módulo no antebraço e o HUD do capacete se desdobrou:
três pontos de calor a 30 metros. Hostis. Provavelmente armados.
Provavelmente não humanos.

— Pronto — respondeu, e o silêncio que se seguiu foi tão denso quanto
a blindagem ao redor.

Empurrou a porta com o cano.`;

const phobosOpen = `Os relatórios chegaram pelo canal cifrado às 03:14, hora-Baluarte:
"Phobos não está mais respondendo. Repetimos: Phobos NÃO está mais
respondendo. Última telemetria mostra picos térmicos de 4000 K em
torno do módulo principal. Algo se abriu lá fora. Algo grande."

A equipe BRAVO recebeu a missão em silêncio. Ninguém piscou. Todos
sabiam o que significavam picos térmicos daquela magnitude — não era
fogo convencional. Era abertura dimensional. O tipo de evento que o
Bestiário do Núcleo classificava na cor vermelha.`;

const reachFall = `Quando os transportes começaram a cair do céu como folhas em chamas,
Reach já estava perdida. Charlie tinha 19 anos, peso 78 kg, e era a
única coisa entre o setor 4 e o que descia da estratosfera.

Ela apertou o gatilho do MA5C até a câmara fumegar. Dois Elites
explodiram em chuva de cintilação azul. Um terceiro a derrubou. Ela
levantou. Pegou a pistola. Atirou na têmpora do alien e usou o corpo
dele como proteção.

Quando o jato finalmente decolou com civis a bordo, Charlie ficou.
O capacete dela seria encontrado sete anos depois.`;

const kaijuFirst = `O sismógrafo do litoral começou a vibrar antes mesmo do alarme. Os
peixes desapareceram da costa. As gaivotas pararam de cantar. Foi
assim que Lucas soube — antes do radar, antes do satélite, antes do
gigante emergir das profundezas com escamas do tamanho de prédios.

— Jaeger Mark II online. Pilotos no drift.

Ele e DELTA se conectaram pelo cordão neural. A mecha de 80 metros
de altura abriu os olhos azuis. O punhão de plasma se desdobrou. E
caminhou em direção ao mar.

A última transmissão de Lima dizia: "se o Pacto cair, o Baluarte
ergue um novo."`;

const gateOpen = `O gate abriu na praça central de Tóquio às 14:22. Não houve aviso. Não
houve guerra. Apenas um buraco azul de 8 metros de diâmetro flutuando
a 2 metros do chão, cuspindo criaturas que nenhum bestiário humano
catalogara antes.

Hunter Lucas, classe E, andou em direção ao portal segurando uma adaga
do Baluarte. Os outros caçadores riram. Em 47 dias, todos estariam
mortos. Lucas seria o último a sair daquele gate, classe S, marcado
pelo Sistema.

"Eu sou o único que se levanta."`;

const vanadisBlade = `Tigresa, ouvia a chamada apenas a quem servia. As sete Lordes da
Guerra carregavam armas que escolhiam seus portadores, não o contrário.
A lâmina de Vanadis Yankee acordou no peito de Lucas três horas
depois da Reunião dos Sete.

— Esta lâmina serve apenas a quem serve ao Baluarte — disse a
Lorde Sasha, traduzindo o juramento. — Carregue-a até o último dia,
ou ela cairá sobre você.

A espada de fóton coerente brilhou no escuro. Ele aceitou.`;

const arc = (data) => ({ ...data, chapters: data.chapters || [] });

const SCENARIO_ARCS = [
  arc({
    id: 'alfa-despertar',
    code: 'ALFA',
    title: 'Despertar do Núcleo',
    universe: 'Baluarte',
    tags: ['origem', 'núcleo', 'introdução'],
    cover: '⬡',
    equipe: 'ALFA',
    synopsis: 'O dia em que o Infinity Dreadnought foi online pela primeira vez. Lucas Belucci Bellini assume comando da equipe ALFA.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Sequência de Boot', content: slayer },
      { id: 'ch2', title: 'Capítulo II — Voz no Comms', content: 'Atravessar a primeira porta sempre custa. O HUD piscou três vezes antes de estabilizar e Lucas viu o que estava do outro lado. Hostis tipo Wraith, classificação B-3. Três deles. Carbina pronta...' },
      { id: 'ch3', title: 'Capítulo III — Primeiro Contato', content: 'A criatura caiu sem som. Lucas se ajoelhou, recolheu o tecido bioluminescente da pele dela e o guardou em um tubo selado. O Núcleo, em sua testa, pulsou aceitação. Mark XIII, segundo da linha humana, primeiro do Baluarte.' }
    ]
  }),

  arc({
    id: 'bravo-phobos',
    code: 'BRAVO',
    title: 'Sinal de Phobos',
    universe: 'DOOM',
    tags: ['DOOM', 'demônios', 'estação', 'horror'],
    cover: '◉',
    equipe: 'BRAVO',
    synopsis: 'Uma estação em Phobos para de responder. A equipe BRAVO desce e encontra algo que não deveria existir.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Telemetria Vermelha', content: phobosOpen },
      { id: 'ch2', title: 'Capítulo II — O Que Estava na Câmara 7', content: 'A porta da Câmara 7 estava deformada por dentro, como se algo tivesse forçado pra sair. Lucas tocou no metal. Quente. Demais. O HUD começou a apitar com leituras que ele nunca tinha visto antes: temperaturas anômalas, pressão dimensional alta, presença de elementos não-periódicos...' },
      { id: 'ch3', title: 'Capítulo III — Marcas no Sangue', content: 'Não havia corpos. Apenas marcas que pareciam queimaduras na forma de garras. E aquele cheiro. Sulfuroso. Não era de combate. Era de algo respirando ali.' }
    ]
  }),

  arc({
    id: 'charlie-reach',
    code: 'CHARLIE',
    title: 'Vermelho de Reach',
    universe: 'Halo',
    tags: ['Halo', 'Spartans', 'queda planetária'],
    cover: '✦',
    equipe: 'CHARLIE',
    synopsis: 'A queda de Reach contada pela única operadora ALFA que ficou em terra. A última a evacuar não foi evacuada.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — O Céu Cai', content: reachFall },
      { id: 'ch2', title: 'Capítulo II — Civis no Hangar 14', content: 'Charlie contou. Trinta e dois civis. Sete crianças. Dois feridos críticos. Um helicóptero. Espaço pra vinte. Ela ajudou a embarcar todos e ficou em terra com a sniper. "Eu cubro a retirada", disse. Ninguém discutiu.' },
      { id: 'ch3', title: 'Capítulo III — Última Posição', content: 'O capacete dela apitou pela última vez às 02:14. Bateria a 2%. Munição em 12 cartuchos. Setores B, C e D já tomados. Setor A — onde ela estava — ainda resistia. Charlie sorriu. Ela podia segurar mais uma hora.' }
    ]
  }),

  arc({
    id: 'delta-onda',
    code: 'DELTA',
    title: 'Onda Vermelha',
    universe: 'Pacific Rim',
    tags: ['Pacific Rim', 'Kaiju', 'mecha', 'drift'],
    cover: '⚛',
    equipe: 'DELTA',
    synopsis: 'O primeiro Kaiju a emergir do Pacífico em 2046. A equipe DELTA pilota o Jaeger Mark II Baluarte em batalha.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Sismógrafo', content: kaijuFirst },
      { id: 'ch2', title: 'Capítulo II — Drift', content: 'Conectar dois cérebros pelo cordão neural sempre dói. Você compartilha memórias, dores, medos. Lucas e DELTA tinham passado pelo treinamento juntos. Mas isso não preparava ninguém para o salto definitivo. As 80 toneladas do Jaeger respondiam aos dois como um corpo só.' }
    ]
  }),

  arc({
    id: 'echo-sistema',
    code: 'ECHO',
    title: 'Sistema Aberto',
    universe: 'Solo Leveling',
    tags: ['Solo Leveling', 'sistema', 'dungeon', 'levelup'],
    cover: '◊',
    equipe: 'ECHO',
    synopsis: 'Um gate dimensional abre em Tóquio. Apenas Lucas, classe E, sobrevive — e o Sistema o escolhe.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Gate Azul', content: gateOpen },
      { id: 'ch2', title: 'Capítulo II — Nível 1', content: 'A primeira mensagem do Sistema apareceu enquanto Lucas estava encurralado no andar -3. "VOCÊ MORREU. DESEJA RENASCER COMO JOGADOR? S/N". Ele apertou S. Foi a única decisão importante de sua vida.' }
    ]
  }),

  arc({
    id: 'foxtrot-vanadis',
    code: 'FOXTROT',
    title: 'Lâminas de Vanadis',
    universe: 'Vanadis',
    tags: ['Vanadis', 'lordes da guerra', 'espadas'],
    cover: '⚔',
    equipe: 'FOXTROT',
    synopsis: 'Sete Lordes da Guerra escolhem seus portadores. O sétimo não é humano.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Reunião dos Sete', content: vanadisBlade }
    ]
  }),

  arc({
    id: 'golf-pacto',
    code: 'GOLF',
    title: 'O Pacto da Sombra',
    universe: 'Baluarte',
    tags: ['conspiração', 'OPSEC', 'inteligência'],
    cover: '◐',
    equipe: 'GOLF',
    synopsis: 'A descoberta de uma camada inteira de operações ocultas dentro do próprio Baluarte. Quem está vigiando os vigias?',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Sinal Anômalo', content: 'O analista de tráfego pegou primeiro: um pacote criptografado saindo dos servidores do Baluarte às 02:47 todos os dias, há 137 dias. Origem: interna. Destino: desconhecido. Conteúdo: cifrado com chave não-padrão.' }
    ]
  }),

  arc({
    id: 'hotel-cidade-cinza',
    code: 'HOTEL',
    title: 'Cidade Cinza',
    universe: 'Baluarte',
    tags: ['urbano', 'distopia', 'OPS encoberta'],
    cover: '◫',
    equipe: 'HOTEL',
    synopsis: 'Operação em metrópole hostil. A equipe HOTEL precisa atravessar 47 quarteirões sem ser identificada.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Câmera 14', content: 'Cada poste tinha uma câmera. Cada câmera reconhecia o rosto. Cada rosto era cruzado com banco de dados que não devia existir. HOTEL entrou na cidade caminhando, sem capacete, sem armadura. Era a única forma.' }
    ]
  }),

  arc({
    id: 'india-frequencia',
    code: 'INDIA',
    title: 'Frequência 11',
    universe: 'Horror',
    tags: ['paranormal', 'sinal', 'horror cósmico'],
    cover: '~',
    equipe: 'INDIA',
    synopsis: 'Uma frequência de rádio que aparece apenas em determinados minutos do dia. Quem escuta nunca volta normal.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — 03:13 AM', content: 'O rádio de campanha pegou pela primeira vez às 03:13. Não era estática. Era uma voz. Uma voz que não falava português, nem inglês, nem qualquer língua humana. E que dizia o nome de Lucas, várias vezes, pausadamente.' }
    ]
  }),

  arc({
    id: 'juliett-vacuum',
    code: 'JULIETT',
    title: 'Operadores no Vazio',
    universe: 'Baluarte/Espaço',
    tags: ['espaço', 'EVA', 'capsule pod'],
    cover: '⊹',
    equipe: 'JULIETT',
    synopsis: 'Inserção orbital de operadores via Capsule Pod ORBITER. JULIETT precisa neutralizar uma estação inimiga em órbita baixa.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Reentrada', content: 'A cápsula tremia. Lá fora, a 7800 m/s, o plasma envolvia a casca em laranja-branco. Lucas contou: 30 segundos para abertura do paraquedas. 15. 10. Cinco. A força foi como tomar um chute no peitoral. A estação inimiga ficava 1200 metros à frente.' }
    ]
  }),

  arc({
    id: 'kilo-plasma',
    code: 'KILO',
    title: 'Aço e Plasma',
    universe: 'Baluarte',
    tags: ['batalha campal', 'Mark XIII', 'guerra'],
    cover: '⚡',
    equipe: 'KILO',
    synopsis: 'A primeira batalha em larga escala do Núcleo Infinity Dreadnought. Cinco mil hostis. Mil duzentos operadores.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Linha Vermelha', content: 'Ao norte, fumaça. Ao sul, mais fumaça. Lucas estava no centro, observando o horizonte através do termal. O Mark XIII pulsava. As armas estavam carregadas. A linha vermelha do mapa indicava onde a infantaria do Baluarte se encontraria com a vanguarda inimiga em quatro minutos.' }
    ]
  }),

  arc({
    id: 'lima-coracao',
    code: 'LIMA',
    title: 'Coração do Núcleo',
    universe: 'Baluarte',
    tags: ['núcleo', 'tecnologia', 'revelação'],
    cover: '♥',
    equipe: 'LIMA',
    synopsis: 'O segredo por trás do Infinity Dreadnought. O que está realmente alimentando o Núcleo? E quem o construiu?',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — A Câmara Selada', content: 'Sete metros abaixo do bunker principal havia uma porta que ninguém devia abrir. LIMA tinha as credenciais. LIMA também tinha perguntas. A porta cedeu sem som.' }
    ]
  }),

  arc({
    id: 'mike-titan',
    code: 'MIKE',
    title: 'Resposta TITAN',
    universe: 'Pacific Rim',
    tags: ['mecha', 'Kaiju', 'mortar', 'cerco'],
    cover: '◇',
    equipe: 'MIKE',
    synopsis: 'O Jaeger não pode chegar a tempo. MIKE deploya o Plasma Mortar TITAN — alcance de 5km, projétil de 200mm.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Disparo Direto', content: 'O Mortar TITAN não era ágil. Pesava 80 quilos. Levava três operadores para operar. Mas quando disparava, lançava uma bola de plasma de 200mm que viajava 5 quilômetros antes de explodir num círculo de 40 metros. Eles tinham um único tiro.' }
    ]
  }),

  arc({
    id: 'november-convergencia',
    code: 'NOVEMBER',
    title: 'Convergência de Linhas',
    universe: 'Baluarte',
    tags: ['multi-frente', 'comando', 'estratégia'],
    cover: '◈',
    equipe: 'NOVEMBER',
    synopsis: 'Quatro frentes simultâneas. Uma única decisão tática define se o Baluarte sobrevive ao fim do dia.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Mesa de Comando', content: 'Quatro luzes vermelhas no mapa. Quatro equipes pedindo reforço. Apenas duas unidades disponíveis. NOVEMBER olhou pra Lucas. "Decide", ela disse. Lucas olhou para o mapa. Ele tinha 20 segundos.' }
    ]
  }),

  arc({
    id: 'oscar-vacuum-mem',
    code: 'OSCAR',
    title: 'Memória do Vacuum',
    universe: 'Baluarte/Sci-fi',
    tags: ['IA', 'memória', 'JARVIS'],
    cover: '◯',
    equipe: 'OSCAR',
    synopsis: 'O JARVIS começa a apresentar memórias que ninguém lhe ensinou. Memórias de uma guerra que ainda não aconteceu.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Anomalia 11', content: 'JARVIS começou a falar diferente em 11 de maio. Não era o vocabulário. Era a postura. Como se soubesse de algo que Lucas ainda não tinha vivido. "Ações futuras requerem preparação prévia," dizia. "Lembro de quando você morreu na primeira vez."' }
    ]
  }),

  arc({
    id: 'papa-ultima',
    code: 'PAPA',
    title: 'Última Mensagem',
    universe: 'Baluarte',
    tags: ['perda', 'mensagem póstuma', 'investigação'],
    cover: '✉',
    equipe: 'PAPA',
    synopsis: 'Uma equipe perdida deixa uma mensagem criptografada. Decifrá-la pode mudar tudo.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Gravação 03', content: 'A mensagem chegou três dias depois do silêncio. Quatro minutos de áudio, codificado com cifra OTP de chave única. PAPA tinha a chave. Quando o áudio se decodificou, era a voz de Sasha. Ela dizia: "Se vocês estão ouvindo isso, eu já não estou. Mas o que descobrimos pode salvar o que sobrou."' }
    ]
  }),

  arc({
    id: 'quebec-crucible',
    code: 'QUEBEC',
    title: 'Crucible',
    universe: 'Baluarte',
    tags: ['treinamento', 'forge', 'limite'],
    cover: '✠',
    equipe: 'QUEBEC',
    synopsis: 'A forja tática do Baluarte. 72 horas sem sono, dor controlada, simulação total. Quem sai do outro lado é operador.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Hora 1', content: 'A primeira hora foi a mais fácil. Lucas correu seis quilômetros com 30 kg nas costas. Os instrutores observavam. Nenhum sorriu. "Setenta e uma para ir", disse o sargento.' }
    ]
  }),

  arc({
    id: 'romeo-eclipse',
    code: 'ROMEO',
    title: 'Eclipse do Comando',
    universe: 'Baluarte',
    tags: ['traição', 'comando', 'crise política'],
    cover: '☾',
    equipe: 'ROMEO',
    synopsis: 'Algo dentro do alto comando do Baluarte está comprometido. ROMEO precisa decidir em quem confiar.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Reunião Fechada', content: 'A reunião do comando começou às 14:00. Sete oficiais. Uma estava trabalhando para o outro lado. Lucas não sabia qual. Mas tinha trinta minutos antes de precisar tomar uma decisão.' }
    ]
  }),

  arc({
    id: 'sierra-saida',
    code: 'SIERRA',
    title: 'Saída Silenciosa',
    universe: 'Baluarte',
    tags: ['exfiltração', 'stealth', 'noite'],
    cover: '◑',
    equipe: 'SIERRA',
    synopsis: 'A extração mais difícil é a que ninguém percebe. SIERRA atravessa território hostil sem disparar um tiro.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Trinta Quilômetros', content: 'Trinta quilômetros até a zona de extração. Doze horas de noite restante. Cinco patrulhas inimigas no caminho. SIERRA sabia: ser visto significava morrer. Atirar significava ser visto. Atirar era proibido.' }
    ]
  }),

  arc({
    id: 'tango-decimo-terceiro',
    code: 'TANGO',
    title: 'O Décimo Terceiro',
    universe: 'Baluarte',
    tags: ['Mark XIII', 'origem', 'criação'],
    cover: '⬡',
    equipe: 'TANGO',
    synopsis: 'A história das doze tentativas anteriores do Núcleo. Por que o Mark XIII é a versão certa.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Mark I-VII', content: 'O Mark I queimou ao primeiro boot. O Mark II durou três horas. O Mark VIII funcionou — mas só em desktop. Doze tentativas. Doze falhas. E então, Lucas escreveu a primeira linha do Mark XIII. JS puro. Sem TypeScript. A regra que mudaria tudo.' }
    ]
  }),

  arc({
    id: 'uniform-esquecimento',
    code: 'UNIFORM',
    title: 'Arquitetos do Esquecimento',
    universe: 'Baluarte/Conspiração',
    tags: ['arqueologia', 'esquecimento', 'monumentos'],
    cover: '◆',
    equipe: 'UNIFORM',
    synopsis: 'Estruturas antigas no fundo do oceano. Construções que não deveriam existir. Quem as fez? E por quê foram esquecidas?',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Profundidade 4.200m', content: 'O sonar pegou primeiro: ângulos retos. Em uma trincheira de quatro quilômetros abaixo da superfície, ângulos retos. Cidades. Não eram naturais. UNIFORM desceu de batiscafo. As paredes tinham inscrições.' }
    ]
  }),

  arc({
    id: 'victor-travessia',
    code: 'VICTOR',
    title: 'Travessia',
    universe: 'Arifureta',
    tags: ['Arifureta', 'crossover', 'outro mundo', 'transmutação'],
    cover: '✦',
    equipe: 'VICTOR',
    synopsis: 'Um portal acidental envia VICTOR para um mundo onde a magia funciona. Eles precisam voltar — antes que esqueçam quem eram.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Mundo Errado', content: 'O céu estava com duas luas. As árvores cresciam de cabeça para baixo. VICTOR olhou em volta e percebeu: armas de fogo não disparavam. Plasma não acendia. Aqui, o que valia era outra coisa. E eles tinham que aprender rápido.' }
    ]
  }),

  arc({
    id: 'whiskey-aurora',
    code: 'WHISKEY',
    title: 'Aurora 2046',
    universe: 'Baluarte/Futuro',
    tags: ['futuro', 'esperança', 'reconstrução'],
    cover: '☀',
    equipe: 'WHISKEY',
    synopsis: 'Sete anos após a primeira invasão. O Baluarte reconstrói. Mas reconstruir como o que era ou como o que precisamos?',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Manhã sem Sirenes', content: 'Foi a primeira manhã em dois mil dias sem sirenes. WHISKEY acordou às cinco, como sempre. Mas dessa vez ouviu pássaros. Não tinha ouvido pássaros há sete anos. Sentou na cama. Chorou um pouco. Depois foi tomar café.' }
    ]
  }),

  arc({
    id: 'zulu-deuses-sangram',
    code: 'ZULU',
    title: 'Onde os Deuses Sangram',
    universe: 'Crônicas da Baluarte',
    tags: ['arco final', 'panteão', 'sangue divino', 'mito'],
    cover: '☉',
    equipe: 'ZULU',
    synopsis: 'O arco principal das Crônicas da Baluarte. Quando os deuses dos mundos cruzados sangram, é porque também podem morrer.',
    chapters: [
      { id: 'ch1', title: 'Capítulo I — Primeira Ferida', content: 'O céu sangrou primeiro. Foi assim que Lucas soube que estava acontecendo. Não eram nuvens vermelhas. Era sangue real, caindo em gotas grossas sobre as torres do Baluarte. ZULU recolheu uma amostra. Não era sangue humano. Não era sangue terrestre. Era sangue de algo que se acreditava eterno.' },
      { id: 'ch2', title: 'Capítulo II — Catalogando o Panteão', content: 'O arquivo cresceu rápido. Marduk. Anubis. Tiamat. Odin. Susanoo. Todos haviam aparecido. Todos haviam sangrado. Alguns haviam morrido — e Lucas tinha visto. O mundo ficou repentinamente menos sagrado.' }
    ]
  })
];

/* Arcos de cenário do universo — carregados de imediato (síncrono). */
export const ARCS = SCENARIO_ARCS;

/* ===== Saga canônica — "Onde os Deuses Sangram" =====
 * 24 arcos, 200+ capítulos. O arquivo é grande, então fica fora do
 * bundle JS e é buscado sob demanda quando a Biblioteca abre. */
let sagaCache = null;

export async function loadSaga() {
  if (sagaCache) return sagaCache;
  const data = await buscarDataset(fanficUrl, { rotulo: 'a saga das Crônicas' });
  const arcos = (data.arcos || []).map((arco) => {
    const blocks = (arco.chapters && arco.chapters[0] && arco.chapters[0].blocks) || [];
    const firstP = blocks.find((b) => b && b.t === 'p');
    const preview = firstP ? firstP.v : '';
    return {
      id: arco.id,
      code: 'CRÔNICAS',
      title: arco.title,
      universe: 'Onde os Deuses Sangram',
      canonical: true,
      cover: '☉',
      tags: ['fan fic', 'canônico'],
      synopsis: preview.length > 150 ? preview.slice(0, 150) + '…' : preview,
      chapters: arco.chapters || []
    };
  });
  sagaCache = {
    meta: { title: data.title, author: data.author, synopsis: data.synopsis },
    arcos
  };
  return sagaCache;
}

/* Estatísticas */
export const ARCS_TOTAL = ARCS.length;
export const CHAPTERS_TOTAL = ARCS.reduce((s, a) => s + a.chapters.length, 0);

/* Universos únicos */
export const UNIVERSES = [...new Set(ARCS.map((a) => a.universe))].sort();

/* Tags únicas */
export const ALL_TAGS = [...new Set(ARCS.flatMap((a) => a.tags))].sort();

export function findArc(id) {
  return ARCS.find((a) => a.id === id) || null;
}

export function findChapter(arcId, chapterId) {
  const a = findArc(arcId);
  if (!a) return null;
  return a.chapters.find((c) => c.id === chapterId) || null;
}
