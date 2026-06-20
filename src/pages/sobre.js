/**
 * Página /sobre — Sobre o Projeto Baluarte.
 *
 * Documentação viva do projeto: o que ele é, como chegou até aqui,
 * o que cada área faz, o lado educacional e o aviso de obra em
 * andamento. É a página que explica o Baluarte a quem chega.
 */

import { h } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { buildImmersiveHero } from '../utils/immersive.js';

/* ===== Como o projeto chegou ao nível atual ===== */
const TIMELINE = [
  {
    tag: 'Mark I–VII',
    title: 'Os protótipos frágeis',
    text: 'As primeiras tentativas mal sobreviviam ao primeiro boot. Algumas ' +
      'duravam poucas horas, outras nem isso. Cada Mark testava uma ideia e ' +
      'quebrava de um jeito novo — mas cada quebra ensinava algo.'
  },
  {
    tag: 'Mark VIII',
    title: 'A primeira que funcionou',
    text: 'O Mark VIII finalmente rodou de verdade — mas só no desktop. Foi a ' +
      'prova de que o projeto era possível. Faltava torná-lo sólido, portátil ' +
      'e capaz de crescer sem desabar.'
  },
  {
    tag: 'Mark IX–XII',
    title: 'A armadilha do TypeScript',
    text: 'As versões seguintes tentaram crescer apoiadas em TypeScript e ' +
      'frameworks pesados. Quatro tentativas, quatro colapsos. Doze Marks ao ' +
      'todo — doze plataformas que nunca chegaram ao fim.'
  },
  {
    tag: 'A regra',
    title: 'JavaScript puro, sem exceção',
    text: 'Depois de 12 falhas veio a decisão que mudou tudo: JavaScript puro ' +
      '(ES2022), sem TypeScript, sem framework. O Vite entra apenas como ' +
      'empacotador. Menos camadas significam menos pontos de quebra.'
  },
  {
    tag: 'Mark XIII',
    title: 'A reconstrução em 21 fases',
    text: 'O Mark XIII foi reescrito do zero em 21 fases incrementais. Cada ' +
      'fase é um snapshot versionado — com branch e tag próprias — para que ' +
      'nunca mais se perca tudo de uma vez se algo der errado.'
  },
  {
    tag: 'v1.0.0',
    title: 'Onde o Baluarte está agora',
    text: 'As 21 fases foram entregues. Esta é a v1.0.0: a primeira versão ' +
      'completa e estável do Baluarte. Um marco importante — mas, como você vai ' +
      'ler no fim desta página, não o destino final.'
  }
];

/* ===== O que cada área do site faz ===== */
const MAPA = [
  {
    group: 'Comando',
    items: [
      { icon: '⬡', name: 'Ponte de Comando',
        desc: 'A tela inicial: status do sistema, métricas e acesso rápido a tudo.' },
      { icon: '⚙', name: 'Hub de Ferramentas',
        desc: 'Catálogo central com mais de 35 ferramentas técnicas, busca e filtro por categoria.' }
    ]
  },
  {
    group: 'Ferramentas técnicas',
    items: [
      { icon: '⌨', name: 'Editor de Código (IDE)',
        desc: 'Editor multi-arquivo com destaque de sintaxe para 26 linguagens, ' +
          'execução de JS/HTML/CSS e um filesystem virtual.' },
      { icon: '▶', name: 'Terminal Web',
        desc: '60+ comandos POSIX-like, filesystem virtual persistente, pipes e histórico navegável.' },
      { icon: '∑', name: 'Calculadoras',
        desc: 'Científica, numérica (bin/hex/oct + IEEE 754), financeira, estatística, ' +
          'engenharia, saúde e conversores de unidades.' },
      { icon: '⚿', name: 'Lab de Criptografia',
        desc: 'César, Vigenère, Atbash, Base64/32/Hex, hashes SHA, AES-GCM e One-Time Pad ' +
          '— sempre com a teoria por trás.' },
      { icon: '⊨', name: 'Tabela Verdade & Regex',
        desc: 'Parser de lógica booleana com mapa de Karnaugh e um tester de expressões regulares explicado.' },
      { icon: '◢', name: 'Gráficos, FFT e Símbolos',
        desc: 'Gerador de gráficos em Canvas puro, visualizador de espectro de áudio e 1200+ símbolos Unicode.' }
    ]
  },
  {
    group: 'Conhecimento & narrativa',
    items: [
      { icon: '◫', name: 'Biblioteca — Crônicas da Baluarte',
        desc: 'A fan fic "Onde os Deuses Sangram" completa: 24 arcos e mais de ' +
          'mil capítulos, com leitor, favoritos e retomada de leitura.' },
      { icon: '◬', name: 'Academia',
        desc: 'Tutoriais de linguagens de programação, do primeiro passo ao avançado.' },
      { icon: '✦', name: 'Universo',
        desc: 'As wikis dos mundos cruzados pelas Crônicas: facções, ameaças e linha do tempo.' },
      { icon: '⚛', name: 'Referência',
        desc: 'Tabela periódica dos 118 elementos, catálogo de mods, guia para montar ' +
          'PC e um simulador de lógica digital.' }
    ]
  },
  {
    group: 'Tático & sistema',
    items: [
      { icon: '◆', name: 'Elites & Arsenal',
        desc: 'As equipes operacionais ALFA → ZULU e o catálogo de armas, veículos e doutrinas táticas.' },
      { icon: '⚿', name: 'CiberSeg',
        desc: 'Enciclopédia de segurança cibernética: conceitos, vetores de ataque e defesas.' },
      { icon: '◈', name: 'Economia',
        desc: 'Cotações de câmbio e criptomoedas em tempo real, com conversor embutido.' },
      { icon: '◉', name: 'J.A.R.V.I.S. & IA Mark 11',
        desc: 'O assistente de IA com memória, e a IA Proprietária — um sistema de Skills modulares.' }
    ]
  }
];

/* ===== Por que isto também é educacional ===== */
const EDUCACIONAL = [
  { icon: '⚿', text: 'O Lab de Criptografia não só cifra textos — explica César, ' +
      'Vigenère, análise de frequência, funções hash e a segurança provada do One-Time Pad.' },
  { icon: '⊨', text: 'A Tabela Verdade ensina lógica booleana de verdade: AND, OR, ' +
      'NOT, XOR, mapas de Karnaugh e simplificação de circuitos.' },
  { icon: '⚛', text: 'A Tabela Periódica e o simulador de lógica digital transformam ' +
      'química e eletrônica em algo que dá para tocar, montar e testar.' },
  { icon: '⌨', text: 'Editor e Terminal são um ambiente seguro para escrever, rodar e ' +
      'quebrar código — aprender programando, sem medo de errar.' },
  { icon: '◫', text: 'Até o software por trás é uma aula: este site é um estudo de caso ' +
      'de engenharia incremental — 21 fases, cada uma testada antes da seguinte.' }
];

export function sobrePage(args) {
  const page = h('div', { className: 'page-sobre' });

  page.appendChild(buildImmersiveHero({
    kicker: 'BALUARTE · SOBRE O PROJETO',
    title: 'Sobre o Baluarte',
    sub: 'UMA PLATAFORMA, MUITAS',
    desc: 'O que é o Baluarte, como ele chegou até aqui, o que cada parte faz — '
      + 'e por que ele ainda está em construção.',
    ctas: [
      { label: '🗺 Roadmap', variant: 'primary', onClick: () => router.navigate('/roadmap') },
      { label: '🔗 Núcleo de IA', onClick: () => router.navigate('/git-nexus') }
    ],
    hudLeft: '◇ PLATAFORMA · MARK XIII',
    hudRight: 'JS PURO · OFFLINE-FIRST',
    sceneKey: 'sobre',
    query: args && args.query
  }));

  /* Intro */
  page.appendChild(
    h('div', { className: 'card sobre-hero' },
      h('h2', { className: 'sobre-h' }, '⬡ O que é o Baluarte'),
      h('p', null,
        'O Projeto Baluarte é uma plataforma só — feita de muitas. Reúne ' +
        'ferramentas técnicas, conteúdo educacional, um universo narrativo ' +
        'próprio e assistentes de inteligência artificial, tudo num ',
        h('strong', null, 'site único, rápido e que funciona offline'), '.'),
      h('p', { className: 'u-text-muted' },
        'É construído inteiramente em JavaScript puro, HTML e CSS — sem ' +
        'TypeScript e sem framework. Essa escolha não foi por acaso: foi a ' +
        'lição mais cara que o projeto aprendeu.')
    )
  );

  /* Timeline */
  page.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Como o projeto chegou até aqui'),
      h('span', { className: 'section-header__count' }, 'Mark I → v1.0.0'))
  );
  const tl = h('div', { className: 'sobre-timeline' });
  TIMELINE.forEach((entry) => {
    tl.appendChild(
      h('div', { className: 'sobre-tl-item' },
        h('div', { className: 'sobre-tl-tag' }, entry.tag),
        h('div', { className: 'sobre-tl-body' },
          h('div', { className: 'sobre-tl-title' }, entry.title),
          h('p', { className: 'sobre-tl-text' }, entry.text)
        )
      )
    );
  });
  page.appendChild(tl);

  /* Mapa do site */
  page.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'O que cada coisa faz'),
      h('span', { className: 'section-header__count' }, 'mapa do Baluarte'))
  );
  MAPA.forEach((block) => {
    page.appendChild(h('div', { className: 'sobre-map-group' }, block.group));
    const grid = h('div', { className: 'sobre-map-grid' });
    block.items.forEach((item) => {
      grid.appendChild(
        h('div', { className: 'card sobre-map-card' },
          h('div', { className: 'sobre-map-card__icon' }, item.icon),
          h('div', null,
            h('div', { className: 'sobre-map-card__name' }, item.name),
            h('div', { className: 'sobre-map-card__desc' }, item.desc)
          )
        )
      );
    });
    page.appendChild(grid);
  });

  /* Educacional */
  page.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Por que isto também é educacional'))
  );
  page.appendChild(
    h('div', { className: 'card sobre-edu' },
      h('p', null,
        'O Baluarte é embalado como uma plataforma militar de ficção — mas, ' +
        'por baixo da temática, cada ferramenta foi feita para ', h('strong', null, 'ensinar'),
        '. Você não só usa: você entende o que está acontecendo.'),
      ...EDUCACIONAL.map((item) =>
        h('div', { className: 'sobre-edu-item' },
          h('span', { className: 'sobre-edu-item__icon' }, item.icon),
          h('span', null, item.text)
        )
      )
    )
  );

  /* Em construção — aviso final */
  page.appendChild(
    h('div', { className: 'sobre-build' },
      h('div', { className: 'sobre-build__badge' }, '⚠ EM CONSTRUÇÃO'),
      h('h2', { className: 'sobre-build__title' }, 'Este site ainda está sendo construído'),
      h('p', null,
        'A v1.0.0 é um marco — a primeira versão completa — mas ', h('strong', null, 'não é o fim'),
        '. O Baluarte continua sendo construído, e ainda vai ganhar muito mais ' +
        'conteúdo. É para esperar novas versões depois desta.'),
      h('p', null,
        'Cada uma das 21 fases (', h('span', { className: 'u-mono' }, 'fase-1'), ' até ',
        h('span', { className: 'u-mono' }, 'fase-21'), ') tem a própria branch e tag no ' +
        'repositório. Uma fase é um ', h('strong', null, 'snapshot'),
        ' — uma fotografia do Baluarte naquele instante.'),
      h('p', { className: 'u-text-muted' },
        'Nem tudo que aparece num snapshot é definitivo: algumas coisas iriam ' +
        'para o site, outras não. Os snapshots registram o caminho; a v1.0.0 ' +
        'consolida o que passou nos testes. As próximas versões seguem a partir daqui.'),
      h('div', { className: 'sobre-build__actions' },
        h('button', {
          className: 'btn btn--primary',
          onclick: () => router.navigate('/home')
        }, '⬡ Voltar à Ponte de Comando'),
        h('button', {
          className: 'btn btn--ghost',
          onclick: () => router.navigate('/biblioteca')
        }, '◫ Ler as Crônicas')
      )
    )
  );

  return page;
}
