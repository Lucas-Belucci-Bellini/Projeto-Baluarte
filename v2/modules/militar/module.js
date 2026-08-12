/**
 * Centro Militar — o caso DIFÍCIL do contrato de módulo.
 *
 * `/cripto` foi escolhido por ser fácil e por isso não prova quase nada. Este
 * aqui existe para o formato apanhar: rede, cache, 15 rotas num módulo só, e um
 * mapeamento com a tabela de estabilidade da V1 que **não é 1:1**.
 *
 * ── Achado 1: módulo ≠ rota, e a V1 já sabia disso ──────────────────────────
 * A tabela de estabilidade da V1 declara `{ id: 'arsenal', descricao: 'Arsenal e
 * Centro Militar' }` — **um id cobrindo duas rotas**. Não foi descuido: o Centro
 * Militar consolidou 13 frentes numa entrada de sidebar justamente porque são
 * uma coisa só do ponto de vista do operador.
 *
 * Isso responde empiricamente a pergunta da granularidade que estava em aberto:
 * **as 99 rotas não viram 99 módulos.** Um módulo é uma unidade de propósito, e
 * `routes[]` é plural desde o primeiro rascunho do contrato — o formato já
 * aguentava; faltava a evidência de que precisava.
 *
 * ── Achado 2: o que o contrato não expressava — e passou a expressar ────────
 * O hub chama `router.navigate(t.route)` para as 14 frentes. Se uma delas
 * sumisse, o botão levaria ao `notFound` — sem erro, sem aviso, e o operador
 * descobriria clicando. A V1 não tem como dizer "eu aponto para esta rota".
 *
 * Aqui as 15 rotas são do MESMO módulo (some o módulo, somem juntas), então
 * ficou anotado como pendência em vez de resolvido por conveniência. O campo
 * `references` fechou a pendência:
 *
 *   dependencies  → não funciona sem. Some o alvo, este é cortado em cascata.
 *   references    → degrada. Some o alvo, este sobe igual e o Registry avisa.
 *
 * As frentes entram como `references.routes` mesmo sendo do próprio módulo: é
 * exatamente o que elas são — links que o hub pinta —, e no dia em que uma
 * frente virar módulo separado (que é o rumo), a declaração já está certa e o
 * `referenciasOrfas()` passa a cobrar sozinho.
 */

/* As 14 frentes que o hub consolidou, mais o próprio hub. Uma lista, um lugar —
 * hoje elas vivem em `main.js`, `sidebar.js`, `militar.js` e `dominios.json`. */
/**
 * `view` devolve o ELEMENTO da página, não o módulo.
 *
 * A primeira versão fazia `() => import(...)`, que resolve para o namespace do
 * módulo — o router receberia um objeto e não teria o que montar. O banco de
 * prova pegou, com o router de verdade; nenhum teste com mock pegaria.
 *
 * O nome do export segue a convenção `kebab → camelCasePage`. Isso foi
 * **conferido nas 15**, não suposto: convenção não verificada é suposição com
 * cara de regra. Se uma página fugir do padrão, o `[nome]` devolve `undefined`
 * e a linha abaixo levanta dizendo qual — em vez de montar `undefined`.
 *
 * @param {string} rota @param {any} args
 */
async function carregar(rota, args) {
  const nome = rota.split('-').map((p, i) => (i ? p[0].toUpperCase() + p.slice(1) : p)).join('') + 'Page';
  const mod = await import(`../../../src/pages/${rota}.js`);
  if (typeof mod[nome] !== 'function') {
    throw new Error(`página "${rota}" não exporta ${nome}() — a convenção não vale para ela`);
  }
  return mod[nome](args);
}

const FRENTES = [
  'enciclopedia-militar', 'forcas-armadas', 'orcamentos-militares', 'poder-militar',
  'forcas-especiais', 'guerras-conflitos', 'historia-militar', 'batalhas-historicas',
  'tecnologia-militar', 'taticas-estrategias', 'organizacao-militar', 'armas-por-pais',
  'arsenal', 'arsenal-expandido'
];

export default {
  id: 'militar',
  name: 'Centro Militar',
  version: '1.0.0',
  description: 'Hub das frentes militares, com extrato vivo da Wikipédia.',

  /* A V1 declara `arsenal: estavel` cobrindo "Arsenal e Centro Militar". */
  stability: 'estavel',
  icon: '🎖',
  ambiente: 'ambos',

  routes: [
    { path: '/militar', view: (a) => carregar('militar', a) },
    ...FRENTES.map((f) => ({ path: `/${f}`, view: (/** @type {any} */ a) => carregar(f, a) }))
  ],

  nav: { section: 'militar', order: 10 },

  dependencies: [],

  /* Os 14 links que o hub pinta. Fracos de propósito: o Centro Militar abre e
   * funciona com qualquer uma delas ausente — só aquele cartão fica morto. É a
   * diferença que `dependencies` não sabe expressar, porque ali a ausência
   * derrubaria o hub inteiro. */
  references: { routes: FRENTES.map((f) => `/${f}`) },

  /* Busca extrato na Wikipédia (`src/utils/wikipedia.js`). É a diferença
   * concreta para o `/cripto`, que declara permissão nenhuma — e a razão de
   * `NETWORK` existir no vocabulário em vez de tudo ser permitido por padrão. */
  permissions: ['NETWORK'],

  storage: [
    /* ⚠️ DÍVIDA CONHECIDA. A V1 grava `militar-enc:cat` (a categoria escolhida na
     * Enciclopédia), e essa chave NÃO cabe no namespace deste módulo: o
     * validador exige prefixo `militar:`, e `militar-enc:` é outro namespace.
     *
     * A chave está comentada de propósito em vez de renomeada aqui: renomear é
     * uma migração de dado do operador, e migração de dado não se faz num
     * arquivo de exemplo. Entra no plano de migração real, com `migrate`, quando
     * este módulo for de fato construído. Declarar a chave errada só para o
     * validador passar seria exatamente o tipo de gambiarra que o caso difícil
     * existe para revelar.
     *
     * { key: 'militar-enc:cat', version: 1, class: 'local' }   ← rejeitada
     * { key: 'militar:enc-cat', version: 2, class: 'local', migrate }  ← o alvo
     */
  ],

  /* O cache da Wikipédia é do `wikipedia.js`, que na V2 vira serviço do Core e
   * não estado deste módulo — daí não aparecer aqui. */
  events: { emits: [], consumes: [] }
};
