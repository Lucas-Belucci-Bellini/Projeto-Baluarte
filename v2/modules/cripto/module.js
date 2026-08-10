/**
 * `/cripto` como manifesto — o caso de prova do Module System.
 *
 * ── Por que este módulo, e não outro ────────────────────────────────────────
 * `/cripto` foi escolhido por ser o **mais fácil**, de propósito. Tem 27 testes,
 * motor isolado (`cripto-engine.js`), **não emite eventos** e **não usa rede** —
 * verificado, não suposto. Se um módulo com essas características não couber no
 * formato sem gambiarra, o formato está errado, e descobrir isso no primeiro
 * custa infinitamente menos que no quinquagésimo.
 *
 * O contrário também vale, e é a armadilha: um formato validado **só** contra o
 * caso fácil erra nos difíceis. Antes de congelar o contrato, faltam dois —
 * `/editor` (estado pesado, muitas chaves) e `/militar` (rede, cache, 13 frentes
 * consolidadas numa entrada). Está anotado na `V2_ARCHITECTURE.md` §6 como
 * risco aberto, não como coisa resolvida.
 *
 * ── O que este arquivo demonstra ────────────────────────────────────────────
 * Tudo abaixo hoje vive espalhado por OITO arquivos da V1, e a duplicação já
 * derivou em dois pontos:
 *
 *   src/main.js:104                  → routes[0]
 *   src/layout/sidebar.js:80         → name + icon + nav      ("Lab de Cripto",  '⚿')
 *   src/layout/shell.js:158          → name                   ("Lab de Criptografia")  ← diverge
 *   src/utils/icons.js:109           → icon                   ('lock')                 ← diverge
 *   src/core/politica.js:237         → storage[0]
 *   src/core/politica.js:305         → stability
 *   src/data/site-capabilities.js:32 → description + keywords
 *   docs/nexus/dominios.json:449     → derivável de id + routes
 *
 * Dois nomes e dois ícones para a mesma coisa. Ninguém errou: a mesma verdade
 * declarada em quatro lugares diverge com o tempo. É o mecanismo, não o
 * descuido — e é o que o manifesto elimina por construção.
 */

export default {
  id: 'cripto',

  /* A ÚNICA fonte do nome. Sidebar, cabeçalho e catálogos leem daqui.
   * Escolhido o rótulo longo do `shell.js`: a sidebar abreviava por falta de
   * espaço, o que é decisão de layout e não de identidade — quem abrevia é o
   * CSS, não o dado. */
  name: 'Lab de Criptografia',

  version: '1.0.0',
  description: 'Laboratório de criptografia e cifras.',

  /* `estavel` porque a V1 já declara isso em politica.js:305 — e agora tem
   * lastro: 27 testes cobrindo os 26 exports do motor. */
  stability: 'estavel',

  /* Uma fonte para o ícone. O `⚿` da sidebar é o glifo que o operador vê hoje;
   * o `'lock'` do icons.js era um segundo sistema para o mesmo dado. */
  icon: '⚿',

  /* Sem rede, sem nativo: roda igual no site e no app. */
  ambiente: 'ambos',

  routes: [
    /* `view` devolve o ELEMENTO da página, não o módulo. Parece detalhe e não
     * é: a primeira versão fazia `() => import(...)`, que resolve para o
     * namespace do módulo — o router receberia um objeto e não teria o que
     * montar. Descoberto no banco de prova, com o router de verdade. */
    { path: '/cripto', view: (args) => import('../../../src/pages/cripto/index.js').then((m) => m.criptoPage(args)) }
  ],

  nav: { section: 'ferramentas', order: 30 },

  /* Motor puro: sem dependência de outro módulo. */
  dependencies: [],

  /* Nenhuma. Cifrar texto que o operador digitou não toca arquivo, rede nem
   * banco — e `cripto:active` é preferência de UI, não dado do usuário.
   * Declarar `USER_DATA` "por via das dúvidas" seria violar a Regra 11
   * (permissão mínima) no primeiro módulo da V2. */
  permissions: [],

  storage: [
    /* Qual painel estava aberto. Mesma chave e mesma versão da V1
     * (politica.js:237) — o manifesto herda, não reinventa. */
    { key: 'cripto:active', version: 1, class: 'local' }
  ],

  /* Verificado no código: não emite e não escuta nada. */
  events: { emits: [], consumes: [] },

  /* Sem estado global, sem timer, sem listener: nada a desmontar. Declarar
   * `lifecycle` vazio seria ruído — o Core assume o padrão. */
};
