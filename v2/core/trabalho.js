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

  /** @type {Array<any>} espera, ordenada na inserção */
  const fila = [];
  /** @type {Map<string, number>} quantos de cada módulo estão rodando */
  const rodandoPor = new Map();
  let rodando = 0;
  let sequencia = 0;

  /** @param {string} modulo */
  const emUso = (modulo) => rodandoPor.get(modulo) ?? 0;

  /**
   * Escolhe o próximo elegível: prioridade, e desempate por ordem de chegada.
   *
   * Percorre a fila em vez de pegar o primeiro porque o primeiro pode estar
   * bloqueado pelo teto do próprio módulo — e parar ali deixaria trabalho de
   * outros módulos esperando por nada. É o que impede a fome.
   */
  function proximo() {
    let escolhido = -1;
    for (let i = 0; i < fila.length; i++) {
      const t = fila[i];
      if (emUso(t.modulo) >= limitePorModulo) continue;
      if (escolhido === -1) { escolhido = i; continue; }
      const e = fila[escolhido];
      if (t.prioridade < e.prioridade || (t.prioridade === e.prioridade && t.seq < e.seq)) {
        escolhido = i;
      }
    }
    return escolhido;
  }

  function bombear() {
    while (rodando < limite) {
      const i = proximo();
      if (i === -1) return;                 // nada elegível agora
      const t = fila.splice(i, 1)[0];
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
    if (fila.length >= tetoFila) {
      deps.metricas?.contar?.('trabalho_recusado', { modulo });
      /* Rejeitar na hora, não pendurar: promessa que nunca resolve é o pior
       * jeito de comunicar "não vai dar". */
      return Promise.reject(new FilaCheia(tetoFila));
    }

    return new Promise((resolver, rejeitar) => {
      const t = {
        modulo, nome, fn,
        prioridade: opts.prioridade ?? NORMAL,
        sinal: opts.sinal,
        seq: sequencia++,
        resolver, rejeitar
      };

      /* Cancelar enquanto espera tira da fila na hora — deixar lá gastaria uma
       * vaga que outro trabalho poderia usar. */
      opts.sinal?.addEventListener?.('abort', () => {
        const i = fila.indexOf(t);
        if (i !== -1) {
          fila.splice(i, 1);
          deps.metricas?.contar?.('trabalho_cancelado', { modulo });
          rejeitar(new Cancelado('cancelado na fila'));
        }
      }, { once: true });

      fila.push(t);
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
      naFila: fila.length,
      limite,
      limitePorModulo,
      tetoFila,
      porModulo: Object.fromEntries(rodandoPor)
    };
  }

  return { enfileirar, paraModulo, estado };
}

/** @typedef {ReturnType<typeof criarEscalonador>} Escalonador */
