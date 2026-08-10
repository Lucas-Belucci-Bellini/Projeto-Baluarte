/**
 * Event Bus da V2 — o sistema nervoso.
 *
 * ── Por que não reaproveitar o da V1 ────────────────────────────────────────
 * O bus da V1 é bom: cura curinga, isola handler e tem catálogo gerado. Mas
 * `emit(event, payload)` tem **dois** parâmetros e monta `meta = { event }` por
 * conta própria — um terceiro argumento é descartado em silêncio (achado pelo
 * verificador de tipos ao escrever o `contexto.js`).
 *
 * A §7 do plano exige que um evento carregue **nome, origem, timestamp,
 * payload, versão e contexto quando necessário**. A V1 carrega os dois
 * primeiros. Isso não é lacuna cosmética: sem `origem`, "quem emitiu isto?" não
 * tem resposta em runtime, e com centenas de módulos essa é a primeira pergunta
 * de qualquer investigação.
 *
 * Então: **estender, não substituir**. O que a V1 faz bem é preservado aqui de
 * propósito — inclusive as decisões que já custaram caro a ela.
 *
 * ── As decisões da V1 que ficam, e por quê ──────────────────────────────────
 *
 * **Curinga é inscrição, não evento.** `emit('*')` faria os ouvintes de `'*'`
 * receberem um evento que nunca aconteceu, com o nome de um padrão. Barrado
 * alto: é bug de quem chamou, e o silêncio viraria dado sujo no histórico.
 *
 * **Iterar sobre cópias.** Um handler pode se desinscrever — ou inscrever outro
 * — durante o `emit`. Sem a cópia, o laço corrompe.
 *
 * **Handler isolado.** Um que levanta não impede os demais. Telemetria quebrada
 * não pode derrubar a aplicação.
 */

const RE_CURINGA_PREFIXO = /:\*$/;

/**
 * @typedef {object} Envelope
 * @property {string} evento
 * @property {string} origem     qual módulo emitiu — o que falta na V1
 * @property {number} versao     do formato do payload, não do módulo
 * @property {string} em         ISO 8601
 * @property {Record<string, unknown>} [contexto]
 */

/**
 * @param {{log?: {aviso: Function, erro: Function}}} [deps]
 */
export function criarBus(deps = {}) {
  /** @type {Map<string, Set<Function>>} */
  const inscritos = new Map();
  /** @type {Map<string, number>} contagem por evento, para o diagnóstico */
  const contador = new Map();

  /** @param {string} padrao @param {Function} fn */
  function on(padrao, fn) {
    if (typeof fn !== 'function') throw new TypeError('[bus] handler precisa ser função');
    let conjunto = inscritos.get(padrao);
    if (!conjunto) { conjunto = new Set(); inscritos.set(padrao, conjunto); }
    conjunto.add(fn);
    /* Devolve a baixa em vez de exigir `off(padrao, fn)`: guardar a referência
     * exata da função para desinscrever é a fonte clássica de vazamento de
     * listener, porque `on(x, () => {})` é impossível de cancelar depois. */
    return () => {
      conjunto.delete(fn);
      if (conjunto.size === 0) inscritos.delete(padrao);
    };
  }

  /** @param {string} evento */
  function alvos(evento) {
    const fns = [];
    for (const [padrao, conjunto] of inscritos) {
      const casa = padrao === '*'
        ? true
        : RE_CURINGA_PREFIXO.test(padrao)
          ? evento.startsWith(padrao.slice(0, -1))
          : padrao === evento;
      if (casa) fns.push(...conjunto);
    }
    return fns;
  }

  /**
   * @param {string} evento
   * @param {any} [payload]
   * @param {{origem?: string, versao?: number, contexto?: Record<string, unknown>}} [meta]
   */
  function emit(evento, payload, meta = {}) {
    if (evento === '*' || RE_CURINGA_PREFIXO.test(evento)) {
      throw new Error(`[bus] "${evento}" é padrão de inscrição, não evento. Não dá pra emitir.`);
    }

    /** @type {Envelope} */
    const envelope = {
      evento,
      /* `desconhecida` em vez de vazio: quem lê um log com origem vazia acha que
       * o campo quebrou; com "desconhecida" sabe que ninguém declarou. */
      origem: meta.origem ?? 'desconhecida',
      versao: meta.versao ?? 1,
      em: new Date().toISOString(),
      ...(meta.contexto ? { contexto: meta.contexto } : {})
    };

    contador.set(evento, (contador.get(evento) ?? 0) + 1);

    for (const fn of alvos(evento)) {
      try {
        fn(payload, envelope);
      } catch (err) {
        /* Isolamento: um handler ruim não impede os outros. Registrar é
         * obrigatório — engolir aqui seria criar o buraco negro clássico em que
         * eventos "somem" sem ninguém saber por quê. */
        deps.log?.erro?.('handler de evento levantou', err, { evento, origem: envelope.origem });
      }
    }

    return envelope;
  }

  /**
   * Quem está escutando o quê, agora. Complementa o catálogo estático do
   * Registry: lá é o que os módulos DECLARAM, aqui é o que existe de fato —
   * e a diferença entre os dois é onde mora o bug.
   */
  function inscricoes() {
    return [...inscritos].map(([padrao, c]) => ({ padrao, ouvintes: c.size }));
  }

  /** Quantas vezes cada evento passou. É o "qual evento ocorreu" da Regra 35. */
  function contagem() {
    return Object.fromEntries(contador);
  }

  function limpar() {
    inscritos.clear();
    contador.clear();
  }

  return { on, emit, inscricoes, contagem, limpar };
}

/** @typedef {ReturnType<typeof criarBus>} Bus */
