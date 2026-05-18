/**
 * Arquivo de Memes — Lembrança dos Velhos Tempos (v2.0.0).
 *
 * Catálogo curado dos memes mais marcantes de 2016 — o ano em que a
 * internet entrou em colapso de tanto rir. Cada entrada traz origem,
 * contexto e a frase de assinatura.
 */

export const MEME_CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'reacao', label: 'Reação' },
  { id: 'video', label: 'Vídeo' },
  { id: 'musica', label: 'Áudio/Música' },
  { id: 'personagem', label: 'Personagem' },
  { id: 'formato', label: 'Formato' },
  { id: 'evento', label: 'Evento' }
];

/* tier: 'lendario' | 'classico' | 'viral' */
export const MEMES_2016 = [
  {
    id: 'harambe',
    nome: 'Harambe',
    quando: 'Maio 2016',
    categoria: 'evento',
    glyph: '◍',
    frase: "Dicks out for Harambe",
    tier: 'lendario',
    origem: 'Gorila do Zoológico de Cincinnati, abatido depois que uma criança caiu no recinto.',
    descricao:
      'A morte de Harambe virou o luto irônico mais longo da internet. Por meses ' +
      'tudo era "em memória de Harambe" — eleições, provas, terminar a fila do RU. ' +
      'O exemplo perfeito de como 2016 transformava tragédia em folclore digital.'
  },
  {
    id: 'dat-boi',
    nome: 'Dat Boi',
    quando: '2016',
    categoria: 'personagem',
    glyph: '◴',
    frase: "here come dat boi  /  o shit waddup!",
    tier: 'lendario',
    origem: 'Render 3D genérico de um sapo verde pedalando um monociclo.',
    descricao:
      'Sem contexto, sem motivo: um sapo num monociclo. A graça era exatamente o ' +
      'absurdo do diálogo decorado — "here come dat boi" / "o shit waddup". ' +
      'Surrealismo puro, marca registrada do humor de 2016.'
  },
  {
    id: 'arthur-fist',
    nome: 'Punho do Arthur',
    quando: 'Ago 2016',
    categoria: 'reacao',
    glyph: '✊',
    frase: 'aquela raiva que você engole',
    tier: 'lendario',
    origem: 'Frame do desenho "Arthur" (PBS) com o oroniauta cerrando o punho.',
    descricao:
      'O punho fechado do Arthur, do desenho infantil, virou a imagem definitiva ' +
      'da frustração contida — aquela raiva educada que ninguém pode demonstrar. ' +
      'Reaction image instantânea para qualquer injustiça do dia a dia.'
  },
  {
    id: 'damn-daniel',
    nome: 'Damn Daniel',
    quando: 'Fev 2016',
    categoria: 'video',
    glyph: '◐',
    frase: "Damn, Daniel! Back at it again with the white Vans",
    tier: 'classico',
    origem: 'Vídeo no Twitter de um adolescente elogiando, dia após dia, os tênis Vans brancos do amigo.',
    descricao:
      'Um vídeo curtíssimo que dominou fevereiro de 2016. Tão grande que o Daniel ' +
      'real ganhou Vans de graça pra vida toda e foi ao programa da Ellen. Prova ' +
      'de que qualquer coisa podia explodir do nada naquele ano.'
  },
  {
    id: 'mannequin-challenge',
    nome: 'Mannequin Challenge',
    quando: 'Nov 2016',
    categoria: 'video',
    glyph: '◇',
    frase: '#MannequinChallenge',
    tier: 'classico',
    origem: 'Desafio viral: grupos inteiros congelados como manequins enquanto a câmera passeia.',
    descricao:
      'Todo mundo parado no meio de um gesto enquanto alguém filma andando pela ' +
      'cena, normalmente ao som de "Black Beatles". Times de futebol, escolas e ' +
      'até a Casa Branca entraram na onda.'
  },
  {
    id: 'pokemon-go',
    nome: 'Pokémon GO',
    quando: 'Jul 2016',
    categoria: 'evento',
    glyph: '◓',
    frase: 'Gotta catch ’em all — na rua mesmo',
    tier: 'lendario',
    origem: 'Jogo de realidade aumentada da Niantic lançado em julho de 2016.',
    descricao:
      'Por algumas semanas o planeta inteiro saiu de casa pra caçar pokémon em ' +
      'praças, hospitais e cemitérios. Gerou memes, notícias bizarras e o verão ' +
      'mais estranho da década. Depois sumiu quase tão rápido quanto chegou.'
  },
  {
    id: 'ppap',
    nome: 'PPAP — Pen-Pineapple-Apple-Pen',
    quando: 'Ago 2016',
    categoria: 'musica',
    glyph: '♪',
    frase: 'I have a pen, I have an apple… Apple-Pen!',
    tier: 'classico',
    origem: 'Clipe do comediante japonês Pikotaro (Kazuhito Kosaka).',
    descricao:
      'Vinte e cinco segundos de nonsense que entraram para o Guinness como a ' +
      'música mais curta a aparecer no Billboard Hot 100. Impossível de tirar da ' +
      'cabeça — e essa sempre foi a intenção.'
  },
  {
    id: 'crying-jordan',
    nome: 'Crying Jordan',
    quando: '2016',
    categoria: 'reacao',
    glyph: '◉',
    frase: 'o rosto da derrota',
    tier: 'lendario',
    origem: 'Foto de Michael Jordan chorando no discurso do Hall da Fama de 2009.',
    descricao:
      'O rosto choroso de Jordan foi photoshopado em absolutamente tudo que perdia, ' +
      'falhava ou era eliminado. Em 2016 chegou ao auge: ver o rosto colado em ' +
      'alguém já bastava pra anunciar a derrota.'
  },
  {
    id: 'evil-kermit',
    nome: 'Evil Kermit',
    quando: 'Nov 2016',
    categoria: 'formato',
    glyph: '◑',
    frase: 'me: …  /  me também eu, de capuz: faz a coisa errada',
    tier: 'classico',
    origem: 'Cena do filme "Muppets Most Wanted" com o Kermit e seu sósia vilão Constantine, encapuzado.',
    descricao:
      'O template do anjo e do demônio para a era da internet: o "eu" responsável ' +
      'contra o "eu" sombrio cochichando péssimas ideias. Virou o jeito padrão de ' +
      'admitir suas piores vontades.'
  },
  {
    id: 'we-are-number-one',
    nome: 'We Are Number One',
    quando: 'Out 2016',
    categoria: 'musica',
    glyph: '♫',
    frase: 'We are number one!',
    tier: 'classico',
    origem: 'Música do vilão Robbie Rotten, da série infantil islandesa "LazyTown".',
    descricao:
      'O meme nasceu como homenagem a Stefán Karl Stefánsson, ator do Robbie Rotten, ' +
      'após ele revelar o câncer. A internet remixou a música de mil formas — um ' +
      'raro caso de meme nascido de carinho.'
  },
  {
    id: 'ken-bone',
    nome: 'Ken Bone',
    quando: 'Out 2016',
    categoria: 'personagem',
    glyph: '◒',
    frase: 'o homem do suéter vermelho',
    tier: 'viral',
    origem: 'Eleitor indeciso que fez uma pergunta no debate presidencial dos EUA usando um suéter vermelho.',
    descricao:
      'Por 48 horas, Ken Bone foi a pessoa mais querida da internet — só pelo ' +
      'suéter vermelho e pelo nome perfeito. Um lembrete de quão rápido 2016 ' +
      'transformava qualquer um em celebridade instantânea.'
  },
  {
    id: 'running-90s',
    nome: 'Running in the 90s',
    quando: '2016',
    categoria: 'musica',
    glyph: '◢',
    frase: 'Eurobeat intensifies',
    tier: 'classico',
    origem: 'Trilha Eurobeat do anime "Initial D" colada em vídeos de carros derrapando.',
    descricao:
      'Qualquer clipe de carro fazendo curva ganhava a Eurobeat de Initial D por ' +
      'cima e virava lendário. A base do humor de "deja vu" e dos vídeos de drift ' +
      'que tomaram conta de 2016 e 2017.'
  },
  {
    id: 'expanding-brain',
    nome: 'Cérebro Expandido',
    quando: 'Fim de 2016',
    categoria: 'formato',
    glyph: '◈',
    frase: 'do cérebro pequeno à galáxia',
    tier: 'lendario',
    origem: 'Template de 4+ painéis: o cérebro vai brilhando mais a cada nível.',
    descricao:
      'Ironicamente, cada "nível de iluminação" costuma ser pior que o anterior. ' +
      'O formato definitivo pra fingir genialidade enquanto se diz a maior bobagem ' +
      'possível. Ainda hoje em uso pesado.'
  },
  {
    id: 'pepe',
    nome: 'Pepe the Frog',
    quando: '2016',
    categoria: 'personagem',
    glyph: '◔',
    frase: 'feels bad man',
    tier: 'lendario',
    origem: 'Sapo do quadrinho "Boy’s Club", de Matt Furie.',
    descricao:
      'O sapo melancólico era o rosto dos sentimentos da internet — o "feels bad ' +
      'man". Em 2016 explodiram os "Rare Pepes" colecionáveis. Furie depois lutou ' +
      'na justiça pra retomar o personagem.'
  },
  {
    id: 'joe-biden',
    nome: 'Joe & Obama',
    quando: 'Nov 2016',
    categoria: 'formato',
    glyph: '◎',
    frase: 'as aventuras do Joe Biden na Casa Branca',
    tier: 'classico',
    origem: 'Memes pós-eleição imaginando o vice Biden aprontando travessuras contra Trump.',
    descricao:
      'Depois da eleição de 2016, a internet inventou uma sitcom fictícia: Biden, o ' +
      'levado, e Obama, o paciente. Pegadinhas, post-its e planos de criança — humor ' +
      'como válvula de escape de um ano pesado.'
  },
  {
    id: 'drakeposting',
    nome: 'Drakeposting',
    quando: '2016',
    categoria: 'formato',
    glyph: '◧',
    frase: 'não  ✕   /   isso  ✓',
    tier: 'lendario',
    origem: 'Cenas do clipe "Hotline Bling", do Drake, recusando e depois aprovando.',
    descricao:
      'Dois painéis: Drake enojado rejeitando a opção A, Drake satisfeito apontando ' +
      'a opção B. O template de comparação mais usado da história da internet ' +
      'nasceu de vez em 2016.'
  },
  {
    id: 'bee-movie',
    nome: 'Bee Movie',
    quando: '2016',
    categoria: 'formato',
    glyph: '◨',
    frase: 'Ya like jazz?',
    tier: 'classico',
    origem: 'O filme "Bee Movie" (2007), da DreamWorks.',
    descricao:
      'A internet decidiu, sem motivo, postar o roteiro inteiro do filme das ' +
      'abelhas — e depois remixá-lo: acelerado, com a letra de "Whole New World", ' +
      'tocando toda vez que alguém dizia "bee". Caos coletivo.'
  },
  {
    id: 'john-cena',
    nome: 'Unexpected John Cena',
    quando: '2016',
    categoria: 'video',
    glyph: '◗',
    frase: 'And his name is JOHN CENA!',
    tier: 'classico',
    origem: 'Pegadinha de áudio: a entrada do lutador John Cena com trombetas no meio de qualquer vídeo.',
    descricao:
      'Você assistia a um vídeo tranquilo e — BAM — trombetas e "AND HIS NAME IS ' +
      'JOHN CENA!". O bait-and-switch perfeito. Tornou Cena um ícone irônico do ' +
      'humor de 2016.'
  },
  {
    id: 'cash-me-ousside',
    nome: 'Cash Me Ousside',
    quando: 'Set 2016',
    categoria: 'video',
    glyph: '◖',
    frase: "Cash me ousside, how bow dah?",
    tier: 'classico',
    origem: 'Participação de Danielle Bregoli no programa "Dr. Phil".',
    descricao:
      'A frase desafiadora ("me encara lá fora, que tal?") com sotaque marcado ' +
      'virou bordão mundial. Um dos casos mais citados de alguém ficar famoso da ' +
      'noite pro dia por causa de uma única frase.'
  },
  {
    id: 'roll-safe',
    nome: 'Roll Safe',
    quando: 'Fim de 2016',
    categoria: 'reacao',
    glyph: '◕',
    frase: 'Você não pode perder se você não jogar',
    tier: 'lendario',
    origem: 'Frame do ator Kayode Ewumi apontando para a própria têmpora numa websérie britânica.',
    descricao:
      'O homem batendo no dedo na cabeça acompanha "lógicas" geniais que, na ' +
      'verdade, são terríveis. O meme de pseudo-sabedoria por excelência — e um ' +
      'dos formatos de reação mais duráveis que 2016 deixou.'
  },
  {
    id: 'fim-do-vine',
    nome: 'O Fim do Vine',
    quando: 'Out 2016',
    categoria: 'evento',
    glyph: '◭',
    frase: 'do utwid me up inside',
    tier: 'classico',
    origem: 'O Twitter anunciou o encerramento do Vine em outubro de 2016.',
    descricao:
      'A notícia da morte do app de vídeos de 6 segundos provocou luto coletivo. ' +
      'Compilações de "melhores Vines" rodam até hoje. O Vine morreu, mas seu ' +
      'humor (rápido, absurdo) virou o DNA do TikTok.'
  },
  {
    id: 'salt-bae',
    nome: 'Salt Bae',
    quando: 'Fim de 2016',
    categoria: 'personagem',
    glyph: '◇',
    frase: 'o gesto do sal pelo cotovelo',
    tier: 'classico',
    origem: 'Vídeo do chef turco Nusret Gökçe temperando carne com estilo teatral.',
    descricao:
      'O jeito específico de jogar sal — deslizando pelo antebraço — virou gesto ' +
      'universal. Imitado em festas, jogos e propagandas no mundo todo na virada ' +
      'de 2016 para 2017.'
  },
  {
    id: 'eleicao-2016',
    nome: 'Eleição EUA 2016',
    quando: 'Nov 2016',
    categoria: 'evento',
    glyph: '◫',
    frase: 'a internet não estava pronta',
    tier: 'lendario',
    origem: 'A disputa presidencial Trump x Clinton.',
    descricao:
      'A eleição mais memética da história até então: bordões, mapas, edições e ' +
      'um fluxo infinito de piadas dos dois lados. Marcou o momento em que o meme ' +
      'virou, de vez, ferramenta política.'
  },
  {
    id: 'why-you-lying',
    nome: 'Why You Always Lying',
    quando: '2016',
    categoria: 'musica',
    glyph: '♩',
    frase: 'Whyyy you always lyinggg',
    tier: 'viral',
    origem: 'Vídeo musical de Nicholas Fraser parodiando "No Diggity", do Blackstreet.',
    descricao:
      'A versão cantada de "para de mentir" se espalhou como reação universal a ' +
      'qualquer lorota. Curto, grudento e perfeito pra encerrar discussão — outro ' +
      'micro-hit que dominou os feeds.'
  },
  {
    id: 'stop-it-get-help',
    nome: 'Stop It, Get Some Help',
    quando: '2016',
    categoria: 'reacao',
    glyph: '◉',
    frase: "Stop it. Get some help.",
    tier: 'viral',
    origem: 'PSA antidrogas dos anos 80 estrelado por Michael Jordan.',
    descricao:
      'O clipe antigo de Jordan dizendo "pare com isso, procure ajuda" foi colado ' +
      'no fim de incontáveis vídeos — sempre como um corte seco e cômico. ' +
      'Combinava perfeitamente com o humor de edição de 2016.'
  },
  {
    id: 'nazare-confusa',
    nome: 'Nazaré Confusa',
    quando: '2016',
    categoria: 'reacao',
    glyph: '◓',
    frase: 'a matemática não fecha',
    tier: 'lendario',
    origem: 'A atriz Renata Sorrah como Nazaré Tedesco, na novela "Senhora do Destino" (Globo, 2004).',
    descricao:
      'Orgulho brasileiro: o rosto confuso da Nazaré, cercado de fórmulas ' +
      'matemáticas flutuantes, virou meme MUNDIAL em 2016 como "Confused Math ' +
      'Lady". O Brasil exportou a expressão definitiva de "não entendi nada".'
  },
  {
    id: 'bone-app-teeth',
    nome: 'Bone App the Teeth',
    quando: 'Fim de 2016',
    categoria: 'formato',
    glyph: '◌',
    frase: '"bon appétit" escrito muito errado',
    tier: 'viral',
    origem: 'Comentário de um vídeo de culinária que errou feio "bon appétit".',
    descricao:
      'O erro de digitação tão absurdo que virou bordão proposital. Acompanhado de ' +
      'um chef "corrigindo" cada vez de forma mais errada — humor anti-humor, bem ' +
      'do jeitinho do fim de 2016.'
  },
  {
    id: 'nut-button',
    nome: 'Nut Button',
    quando: '2016',
    categoria: 'formato',
    glyph: '◉',
    frase: 'when you… *aperta o botão*',
    tier: 'viral',
    origem: 'GIF de uma mão apertando um botão vermelho dramaticamente.',
    descricao:
      'O template do "quando acontece algo bom demais, você aperta O botão". ' +
      'Simples, expressivo e infinitamente reaproveitável — um dos formatos de ' +
      'reação mais postados do ano.'
  },
  {
    id: 'mr-krabs-blur',
    nome: 'Mr. Krabs Confuso',
    quando: '2016',
    categoria: 'reacao',
    glyph: '◐',
    frase: 'quando você acorda e não sabe onde está',
    tier: 'classico',
    origem: 'Frame borrado e tremido do Sr. Sirigueijo, de Bob Esponja.',
    descricao:
      'O Sr. Sirigueijo desfocado no meio de um cenário rodopiante virou a imagem ' +
      'da desorientação total — perder o fio da meada, acordar zonzo, esquecer o ' +
      'que ia falar. Bob Esponja foi mina de ouro de memes em 2016.'
  }
];
