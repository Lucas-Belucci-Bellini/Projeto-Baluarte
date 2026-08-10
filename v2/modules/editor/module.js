/**
 * Editor de Código — o caso que expôs um acoplamento invisível.
 *
 * Eu tinha escolhido este módulo esperando "estado pesado, muitas chaves". Ele
 * tem **uma** chave. O que apareceu no lugar foi melhor.
 *
 * ── O achado: JARVIS escreve no storage do editor ───────────────────────────
 * `src/utils/jarvis-tools.js:232` faz `storage.set('editor:state', …)`. Um
 * módulo grava direto na chave de outro, sem passar por API nenhuma:
 *
 *     // jarvis-tools.js
 *     const editorState = storage.get('editor:state') || { tabs: [], activeId: null };
 *     …
 *     storage.set('editor:state', editorState);
 *
 * Isso funciona hoje e é frágil de um jeito específico: o JARVIS precisa
 * conhecer **o formato interno** do editor (`tabs`, `activeId`). No dia em que o
 * editor mudar essa estrutura, o JARVIS quebra — e quebra escrevendo, ou seja,
 * corrompendo o estado em vez de falhar na leitura.
 *
 * É a Regra 2 violada em uma linha: *"evitar importações diretas de
 * implementação interna de outros módulos"*. Storage compartilhado é import
 * disfarçado — pior, porque nenhuma ferramenta de análise estática aponta.
 *
 * ── Como o contrato resolve ─────────────────────────────────────────────────
 * `storage[]` com namespace obrigatório torna isto **impossível por
 * construção**: a chave `editor:state` pertence a este módulo, e um módulo
 * `jarvis` que a declarasse seria recusado pelo validador. O caminho legítimo
 * passa a ser a `api` — o editor expõe `abrirAba()`, e o JARVIS chama.
 *
 * O `api` abaixo é justamente isso, e é a razão de este manifesto ter uma seção
 * que o `/cripto` não tem: o `/cripto` não é chamado por ninguém.
 */

export default {
  id: 'editor',
  name: 'Editor de Código',
  version: '1.0.0',
  description: 'Editor com abas, destaque de sintaxe e execução local.',

  /* `beta` na tabela da V1 — herdado, não promovido por otimismo. */
  stability: 'beta',
  icon: '⌨',
  ambiente: 'ambos',

  routes: [
    { path: '/editor', view: () => import('../../../src/pages/editor.js') }
  ],

  nav: { section: 'ferramentas', order: 10 },
  dependencies: [],

  /* Nenhuma: o editor roda no navegador, sobre estado local. Executar código é
   * feito no sandbox do terminal, que é outro módulo — se um dia o editor
   * executar por conta própria, aqui entra `EXECUTION`. */
  permissions: [],

  storage: [
    /* Abas abertas e qual está ativa. Mesma chave e versão da V1. */
    { key: 'editor:state', version: 1, class: 'local' }
  ],

  /* A API que substitui o acesso direto do JARVIS ao storage. Assinaturas, não
   * implementação — o módulo não existe ainda; o contrato existe.
   *
   * Regra 29 (toda API precisa de dono): finalidade = deixar outro módulo mexer
   * nas abas sem conhecer o formato; consumidor = JARVIS. */
  api: {
    // abrirAba({ nome, conteudo }) -> id
    // fecharAba(id) -> boolean
    // listarAbas() -> [{ id, nome }]
  },

  /* Emitir isto é o que permite ao JARVIS reagir a uma aba aberta sem consultar
   * o storage num laço. Ainda não implementado na V1 — o editor não emite nada
   * hoje —, e por isso está declarado aqui como intenção do módulo da V2, não
   * como fato sobre o código atual. */
  events: { emits: ['editor:aba-aberta', 'editor:aba-fechada'], consumes: [] }
};
