import '../styles/memorial.css';
import { h } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { buildImmersiveHero } from '../utils/immersive';

interface PageArgs {
  query?: Readonly<Record<string, string>> | null;
}

interface MemorialSource {
  readonly label: string;
  readonly url: string;
}

interface MemorialEntry {
  /** Nome da pessoa. Nunca do personagem. */
  readonly nome: string;
  readonly papel: string;
  readonly datas: string;
  readonly local: string;
  /** A frase que a pessoa deixou, se houver uma. */
  readonly frase?: string;
  readonly fraseAutor?: string;
  readonly corpo: readonly string[];
  /** Por que esta pessoa é parte da razão do Baluarte existir. */
  readonly porQue: readonly string[];
  readonly fontes: readonly MemorialSource[];
}

/**
 * Registro cronológico. Regra do memorial (ver `MEMORIAL.md`, na raiz):
 * entrada publicada não sai, não encolhe e não é reescrita por conveniência
 * de release. Toda entrada nasce com fonte verificável.
 */
const ENTRADAS: readonly MemorialEntry[] = [
  {
    nome: 'Peter Cullen',
    papel: 'A voz de Optimus Prime — 1984 a 2023',
    datas: '28 de julho de 1941 — 26 de agosto de 2026',
    local: 'Montreal · Los Angeles · 85 anos',
    frase: 'Peter, se você vai ser um herói, seja um herói de verdade. Não seja '
      + 'o tipo herói de Hollywood, com toda a baboseira, o berreiro e a '
      + 'tentativa de parecer durão... seja forte o bastante para ser gentil.',
    fraseAutor: 'Larry Cullen, capitão dos Fuzileiros Navais, veterano do Vietnã '
      + '— ao irmão, em 1984, na véspera do teste',
    corpo: [
      'Peter Cullen deu voz ao líder dos Autobots por quase quarenta anos, da '
        + 'série animada de 1984 até Transformers: Rise of the Beasts, em 2023. '
        + 'Também foi o Ió do Ursinho Pooh, o rosnado do Predador, o Venger de '
        + 'Caverna do Dragão e o KARR de Knight Rider. Morreu em casa, aos 85.',
      'A parte que importa aqui não é a fama do personagem — é a origem dele. '
        + 'Larry Cullen tinha voltado do Vietnã como capitão de fuzileiros, com '
        + 'uma Bronze Star por bravura e dois Purple Hearts. Quando o irmão mais '
        + 'novo contou que ia testar para o papel de um herói, foi isso que ele '
        + 'respondeu.',
      'Peter fez o teste imitando o irmão. Passou. E repetiu pelo resto da vida '
        + 'que Optimus Prime nunca tinha sido criação sua: era a imitação de um '
        + 'oficial de infantaria que voltou da guerra e escolheu ser gentil.',
      'A família pediu que quem quisesse honrá-lo o fizesse servindo a própria '
        + 'comunidade e conduzindo os outros com compaixão, integridade e '
        + 'lealdade — e lembrando sempre da frase acima.'
    ],
    porQue: [
      'O Baluarte é uma plataforma militar e narrativa, e a tentação de um '
        + 'projeto assim é confundir força com aspereza — tratar dureza como '
        + 'sinônimo de competência.',
      'A voz que o Peter construiu a partir do irmão é o argumento contrário: '
        + 'um comandante que é ouvido porque não precisa gritar. É um dos '
        + 'motivos deste site existir, e é o padrão de como as coisas aqui '
        + 'deveriam soar — na escrita, nas Crônicas, no J.A.R.V.I.S. e no trato '
        + 'com quem usa isto.',
      'O Optimus das Crônicas da Baluarte continua vivo; personagem não morre '
        + 'junto com quem o interpretou. Mas a pessoa que emprestou a voz, e o '
        + 'fuzileiro que emprestou o jeito de falar, esses ficam registrados.'
    ],
    fontes: [
      { label: 'The Hollywood Reporter', url: 'https://www.hollywoodreporter.com/movies/movie-news/peter-cullen-optimus-prime-transformers-eeyore-1236683075/' },
      { label: 'Forbes', url: 'https://www.forbes.com/sites/paultassi/2026/08/27/peter-cullen-dies-who-voiced-optimus-prime-for-over-40-years/' },
      { label: 'Euronews', url: 'https://www.euronews.com/culture/2026/08/28/peter-cullen-the-iconic-voice-of-optimus-prime-eeyore-and-predator-dies-aged-85' },
      { label: 'Hasbro', url: 'https://newsroom.hasbro.com/news-releases/news-release-details/remembering-peter-cullen' },
      { label: 'KTLA — a origem da voz', url: 'https://ktla.com/entertainment/peter-cullen-optimus-prime-inspiration/' }
    ]
  }
];

const REGRA: readonly string[] = [
  'Entra quem tem obra que é parte da razão do Baluarte existir — voz, escrita, '
    + 'música, código, doutrina. Não é lista de famosos: é lista de dívidas '
    + 'reconhecidas.',
  'Ninguém sai. Entrada publicada não é removida, resumida nem reescrita para '
    + 'caber num redesign. Memorial que expira não era memorial.',
  'Fato verificado, com fonte. Duas fontes independentes, no mínimo. Resumo de '
    + 'IA, print de rede social ou boato não abrem entrada — não se enterra '
    + 'ninguém vivo.',
  'A pessoa, não o personagem. O personagem segue existindo na ficção; o '
    + 'memorial é de quem morreu de verdade. Os dois não se misturam.',
  'Toda entrada existe em dois lugares, sempre juntos: nesta página e no '
    + 'MEMORIAL.md, na raiz do repositório.',
  'Sem métrica. Nada de contador de acesso, engajamento ou destaque rotativo. '
    + 'Ordem cronológica, e pronto.'
];

function buildEntrada(entrada: MemorialEntry): HTMLDivElement {
  const card = h('article', { className: 'card memorial-entrada' }) as HTMLDivElement;

  card.appendChild(
    h('header', { className: 'memorial-entrada__head' },
      h('h2', { className: 'memorial-entrada__nome' }, entrada.nome),
      h('p', { className: 'memorial-entrada__papel' }, entrada.papel),
      h('p', { className: 'memorial-entrada__datas' },
        h('span', null, entrada.datas),
        h('span', { className: 'memorial-entrada__sep' }, '·'),
        h('span', { className: 'u-text-muted' }, entrada.local))
    )
  );

  if (entrada.frase) {
    card.appendChild(
      h('blockquote', { className: 'memorial-frase' },
        h('p', { className: 'memorial-frase__texto' }, `“${entrada.frase}”`),
        entrada.fraseAutor
          ? h('footer', { className: 'memorial-frase__autor' }, `— ${entrada.fraseAutor}`)
          : null)
    );
  }

  const corpo = h('div', { className: 'memorial-entrada__corpo' });
  entrada.corpo.forEach((p) => corpo.appendChild(h('p', null, p)));
  card.appendChild(corpo);

  const porQue = h('section', { className: 'memorial-porque' },
    h('h3', { className: 'memorial-porque__titulo' }, 'Por que está aqui'));
  entrada.porQue.forEach((p) => porQue.appendChild(h('p', null, p)));
  card.appendChild(porQue);

  const fontes = h('footer', { className: 'memorial-fontes' },
    h('span', { className: 'memorial-fontes__rotulo' }, 'Fontes'));
  entrada.fontes.forEach((fonte) => {
    fontes.appendChild(
      h('a', {
        className: 'memorial-fontes__link',
        href: fonte.url,
        target: '_blank',
        rel: 'noopener noreferrer'
      }, fonte.label)
    );
  });
  card.appendChild(fontes);

  return card;
}

export function memorialPage(args: PageArgs = {}): HTMLDivElement {
  const page = h('div', { className: 'page-memorial' }) as HTMLDivElement;

  page.appendChild(buildImmersiveHero({
    kicker: 'BALUARTE · MEMORIAL',
    title: 'Memorial',
    sub: 'FORTE O BASTANTE PARA SER GENTIL',
    desc: 'O Baluarte foi construído em cima de obras feitas por pessoas reais. '
      + 'Quando uma delas morre, o nome fica — aqui, e sem prazo de validade.',
    ctas: [
      { label: '◇ Sobre o projeto', onClick: (): void => router.navigate('/sobre') }
    ],
    variant: 'lightrays',
    hudLeft: '⬡ REGISTRO PERMANENTE',
    hudRight: `${ENTRADAS.length} ${ENTRADAS.length === 1 ? 'NOME' : 'NOMES'}`,
    sceneKey: 'memorial',
    query: args.query ?? null
  }));

  ENTRADAS.forEach((entrada) => page.appendChild(buildEntrada(entrada)));

  const regra = h('section', { className: 'card memorial-regra' },
    h('h2', { className: 'memorial-regra__titulo' }, 'A regra'),
    h('p', { className: 'memorial-regra__intro' },
      'Vale a partir daqui, para todas as próximas atualizações.'));
  const lista = h('ol', { className: 'memorial-regra__lista' });
  REGRA.forEach((item) => lista.appendChild(h('li', null, item)));
  regra.appendChild(lista);
  page.appendChild(regra);

  return page;
}
