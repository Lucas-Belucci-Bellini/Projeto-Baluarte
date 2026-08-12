/**
 * Escalonador de trabalho — concorrência no lado do navegador e do app.
 *
 * ── Por que não basta `Promise.all` ─────────────────────────────────────────
 * O lado Python já tem fila com `SKIP LOCKED`, mas ela vive no banco e serve
 * processos. No navegador o problema é outro e não tem nada resolvendo:
 *
 * **Sem teto, tudo dispara junto.** Dez módulos pedindo `fetch` ao subir viram
 * dez conexões simultâneas; o navegador enfileira por conta própria, com uma
 * ordem que ninguém escolheu, e a página que o operador está olhando espera
 * atrás de trabalho de fundo que ninguém pediu.
 *
 * **Sem cancelamento, trabalho abandonado continua custando.** Navegar para
 * outra rota não desfaz os cinco `fetch` da rota anterior — eles terminam,
 * gastam rede e escrevem em algo que já saiu da tela.
 *
 * **Sem justiça, um módulo faminta os outros.** Um bot que enfileira duzentas
 * tarefas monopoliza o teto global, e o resto do Baluarte para.
 *
 * ── A armadilha que este arquivo trata de frente: fila sem teto ─────────────
 * Se a entrada é mais rápida que a saída, a fila cresce até o processo morrer.
 * É o mesmo modo de falha da cardinalidade nas métricas — silencioso e adiado.
 * Aqui a fila tem teto e a rejeição é **explícita**: quem enfileira recebe erro
 * na hora, em vez de uma promessa que nunca resolve.
 */

/** Prioridades. Números como na fila do Postgres — menor roda antes. */
export const INTERATIVO = 10;
export const NORMAL = 100;
export const FUNDO = 500;

/** Cancelamento pedido pelo chamador. Tipo próprio para não virar erro genérico. */
export class Cancelado extends Error {
  /** @param {string} motivo */
  constructor(motivo = 'cancelado') {
    super(motivo);
    this.name = 'Cancelado';
  }
}

/** Fila cheia. Erro, não espera — ver o cabeçalho. */
export class FilaCheia extends Error {
  /** @param {number} teto */
  constructor(teto) {
    super(`fila de trabalho cheia (teto ${teto})`);
    this.name = 'FilaCheia';
  }
}

/**
 * @typedef {object} Opcoes
 * @property {number} [limite]        quantos podem rodar ao mesmo tempo
 * @property {number} [limitePorModulo] teto por módulo, para ninguém faminar os outros
 * @property {number} [tetoFila]      quantos podem esperar
 */

/**
 * @param {Opcoes} [opcoes]
 * @param {{log?: any, metricas?: any}} [deps]
 */
export function criarEscalonador(opcoes = {}, deps = {}) {
  const limite = opcoes.limite ?? 6;
  const limitePorModulo = opcoes.limitePorModulo ?? Math.max(1, Math.ceil(limite / 2));
  const tetoFila = opcoes.tetoFila ?? 500;

  /**
   * ── Por que isto é um monte e não um array ──────────────────────────────
   *
   * A primeira versão guardava tudo num array e escolhia varrendo a fila
   * inteira a cada despacho, com `splice` para retirar. Lê bem e está errado:
   * é O(n) por despacho e O(n) na retirada, ou seja **O(n²)** no total.
   *
   * Isso não apareceu em nenhum teste — os testes usam três, dez tarefas. O
   * banco de medição usou 50 000 e o número saiu: **1073 µs por tarefa
   * trivial**, 53 segundos para a leva. Mil vezes mais lento do que deveria.
   *
   * Fica registrado porque a lição vale mais que o conserto: esse defeito
   * sobreviveria a uma reescrita em qualquer linguagem — e uma linguagem mais
   * rápida o teria **escondido**, entregando talvez 50 µs por tarefa, o que
   * pareceria ótimo e continuaria sendo O(n²) esperando a próxima ordem de
   * grandeza. Trocar de linguagem para consertar algoritmo é pagar caro por um
   * conserto que não aconteceu.
   *
   * A estrutura agora:
   *
   *   filaPorModulo   um monte por módulo, ordenado por (prioridade, chegada)
   *   candidatos      monte de "módulo elegível", com entradas PREGUIÇOSAS —
   *                   entrada obsoleta é descartada na retirada em vez de ser
   *                   caçada na inserção, que é o que a mantém O(log n)
   *
   * Semântica preservada, e é isso que os testes cobram: prioridade manda,
   * chegada desempata, o teto por módulo impede fome, e cancelado sai da fila
   * na hora.
   */

  /** @type {Map<string, {itens: any[]}>} um monte por módulo */
  const filaPorModulo = new Map();
  /** @type {{itens: any[]}} montes de candidatos (entradas preguiçosas) */
  const candidatos = { itens: [] };
  /** @type {Map<string, number>} quantos de cada módulo estão rodando */
  const rodandoPor = new Map();
  let rodando = 0;
  let sequencia = 0;
  let naFila = 0;

  /** @param {string} modulo */
  const emUso = (modulo) => rodandoPor.get(modulo) ?? 0;

  /** Ordem: prioridade menor primeiro; empate, quem chegou antes. */
  const antes = (/** @type {any} */ a, /** @type {any} */ b) =>
    a.prioridade < b.prioridade || (a.prioridade === b.prioridade && a.seq < b.seq);

  /** @param {{itens: any[]}} h @param {any} v */
  function empurrar(h, v) {
    const it = h.itens;
    it.push(v);
    let i = it.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!antes(it[i], it[p])) break;
      [it[i], it[p]] = [it[p], it[i]];
      i = p;
    }
  }

  /** @param {{itens: any[]}} h */
  function retirar(h) {
    const it = h.itens;
    if (!it.length) return undefined;
    const topo = it[0];
    const ultimo = it.pop();
    if (it.length) {
      it[0] = ultimo;
      let i = 0;
      for (;;) {
        const e = 2 * i + 1; const d = e + 1;
        let m = i;
        if (e < it.length && antes(it[e], it[m])) m = e;
        if (d < it.length && antes(it[d], it[m])) m = d;
        if (m === i) break;
        [it[i], it[m]] = [it[m], it[i]];
        i = m;
      }
    }
    return topo;
  }

  /**
   * Anuncia que um módulo pode ser escolhido agora. Chamado ao enfileirar e ao
   * liberar vaga — a entrada carrega a chave da cabeça atual, e quem retira
   * confere se ela ainda é a cabeça. Entrada duplicada é barata; entrada
   * perdida seria trabalho parado para sempre, então erra-se para o lado de
   * empurrar demais.
   *
   * @param {string} modulo
   */
  function talvezElegivel(modulo) {
    const h = filaPorModulo.get(modulo);
    if (!h || !h.itens.length) return;
    if (emUso(modulo) >= limitePorModulo) return;
    const cabeca = h.itens[0];
    empurrar(candidatos, { prioridade: cabeca.prioridade, seq: cabeca.seq, modulo });
  }

  /** O próximo elegível, ou `undefined`. */
  function proximo() {
    for (;;) {
      const c = retirar(candidatos);
      if (!c) return undefined;

      const h = filaPorModulo.get(c.modulo);
      if (!h || !h.itens.length) continue;                 // módulo esvaziou
      if (emUso(c.modulo) >= limitePorModulo) continue;     // encheu; volta quando liberar
      if (h.itens[0].seq !== c.seq) continue;               // entrada obsoleta

      const t = retirar(h);
      if (!h.itens.length) filaPorModulo.delete(c.modulo);
      naFila -= 1;

      /* Cancelada enquanto esperava: já foi rejeitada no `abort`, e o lugar
       * dela na fila já foi devolvido. Só descartar e seguir. */
      if (t.cancelada) { talvezElegivel(c.modulo); continue; }

      /* Marca antes de sair: um `abort` que chegue depois daqui não pode
       * descontar `naFila` de novo — o lugar já foi devolvido nesta linha. */
      t.despachada = true;
      talvezElegivel(c.modulo);
      return t;
    }
  }

  function bombear() {
    while (rodando < limite) {
      const t = proximo();
      if (!t) return;                       // nada elegível agora
      executar(t);
    }
  }

  /** @param {any} t */
  function executar(t) {
    /* Cancelado enquanto esperava: nem começa. Sem esta checagem, cancelar só
     * teria efeito depois de a tarefa rodar — que é o oposto de cancelar. */
    if (t.sinal?.aborted) {
      deps.metricas?.contar?.('trabalho_cancelado', { modulo: t.modulo });
      t.rejeitar(new Cancelado('cancelado antes de começar'));
      return;
    }

    rodando += 1;
    rodandoPor.set(t.modulo, emUso(t.modulo) + 1);
    const t0 = Date.now();

    const encerrar = (/** @type {boolean} */ ok) => {
      rodando -= 1;
      const n = emUso(t.modulo) - 1;
      if (n <= 0) rodandoPor.delete(t.modulo);
      else rodandoPor.set(t.modulo, n);
      deps.metricas?.medir?.('trabalho_ms', Date.now() - t0, { modulo: t.modulo, ok: String(ok) });
      /* Vaga liberada: o módulo pode ter voltado a caber sob o próprio teto. */
      talvezElegivel(t.modulo);
      /* Bombear no microtask evita recursão profunda quando mil tarefas
       * resolvem em sequência — pilha estourada por fila rápida é bug chato de
       * achar, porque só aparece com carga. */
      queueMicrotask(bombear);
    };

    let concluida = false;
    try {
      Promise.resolve(t.fn({ sinal: t.sinal })).then(
        (v) => { if (!concluida) { concluida = true; encerrar(true); t.resolver(v); } },
        (e) => {
          if (concluida) return;
          concluida = true;
          encerrar(false);
          deps.log?.erro?.('trabalho falhou', e, { modulo: t.modulo, nome: t.nome });
          t.rejeitar(e);
        }
      );
    } catch (e) {
      /* Função síncrona que levanta antes de devolver promessa. Sem este catch,
       * o contador de `rodando` nunca desce e o escalonador trava para sempre. */
      concluida = true;
      encerrar(false);
      t.rejeitar(e);
    }
  }

  /**
   * Enfileira trabalho.
   *
   * @param {string} modulo quem pediu — carimbado por quem chama, não pelo módulo
   * @param {string} nome rótulo para métrica e log
   * @param {(ctx: {sinal?: AbortSignal}) => any} fn
   * @param {{prioridade?: number, sinal?: AbortSignal}} [opts]
   */
  function enfileirar(modulo, nome, fn, opts = {}) {
    if (naFila >= tetoFila) {
      deps.metricas?.contar?.('trabalho_recusado', { modulo });
      /* Rejeitar na hora, não pendurar: promessa que nunca resolve é o pior
       * jeito de comunicar "não vai dar". */
      return Promise.reject(new FilaCheia(tetoFila));
    }

    return new Promise((resolver, rejeitar) => {
      /* `cancelada` e `despachada` declarados aqui, e não acrescentados depois:
       * campo que nasce por atribuição solta some do tipo e da leitura. */
      /** @type {{modulo: string, nome: string, fn: Function, prioridade: number, sinal?: AbortSignal, seq: number, cancelada: boolean, despachada: boolean, resolver: Function, rejeitar: Function}} */
      const t = {
        cancelada: false,
        despachada: false,
        modulo, nome, fn,
        prioridade: opts.prioridade ?? NORMAL,
        sinal: opts.sinal,
        seq: sequencia++,
        resolver, rejeitar
      };

      /* Cancelar enquanto espera devolve a vaga na hora — deixar lá gastaria
       * um lugar que outro trabalho poderia usar.
       *
       * A retirada é PREGUIÇOSA: marca-se a tarefa e desconta-se `naFila`
       * agora, e o item some do monte quando chegar a vez dele. Caçar o
       * elemento no monte seria O(n), e cancelamento em massa voltaria a ser
       * O(n²) — o mesmo defeito, no outro extremo. Para quem observa (`naFila`,
       * a promessa, a métrica) o efeito é imediato, que é o que "cancelar"
       * precisa significar. */
      opts.sinal?.addEventListener?.('abort', () => {
        if (t.cancelada || t.despachada) return;
        t.cancelada = true;
        naFila -= 1;
        deps.metricas?.contar?.('trabalho_cancelado', { modulo });
        rejeitar(new Cancelado('cancelado na fila'));
      }, { once: true });

      let h = filaPorModulo.get(modulo);
      if (!h) { h = { itens: [] }; filaPorModulo.set(modulo, h); }
      empurrar(h, t);
      naFila += 1;

      talvezElegivel(modulo);
      deps.metricas?.contar?.('trabalho_enfileirado', { modulo });
      bombear();
    });
  }

  /** Recorte por módulo: o `modulo` é carimbado, como nas métricas. */
  function paraModulo(/** @type {string} */ id) {
    return {
      /**
       * @param {string} nome
       * @param {(ctx: {sinal?: AbortSignal}) => any} fn
       * @param {{prioridade?: number, sinal?: AbortSignal}} [opts]
       */
      fazer: (nome, fn, opts) => enfileirar(id, nome, fn, opts),
      INTERATIVO, NORMAL, FUNDO
    };
  }

  function estado() {
    return {
      rodando,
      naFila,
      limite,
      limitePorModulo,
      tetoFila,
      porModulo: Object.fromEntries(rodandoPor)
    };
  }

  return { enfileirar, paraModulo, estado };
}

/** @typedef {ReturnType<typeof criarEscalonador>} Escalonador */
