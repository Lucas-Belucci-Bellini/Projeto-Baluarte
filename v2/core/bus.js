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
 *
 * ── Correlação: `origem` responde "quem", falta responder "de quê" ──────────
 *
 * `origem` diz qual módulo emitiu ESTE evento. Não diz de onde ele veio. Num
 * sistema em que um clique vira `rota:mudou`, que dispara `modulo:carregar`,
 * que dispara `runtime:pedido`, que falha — a pergunta da investigação não é
 * "quem emitiu o erro" (o runtime, obviamente), é **"o que começou isto?"**.
 * Sem um fio ligando os quatro, a resposta exige adivinhar por timestamp, que é
 * exatamente o que deixa de funcionar quando há concorrência.
 *
 * Então cada envelope carrega três identidades, e não uma:
 *
 *   `id`         — este evento, único.
 *   `correlacao` — a CADEIA inteira. Igual nos quatro do exemplo acima.
 *   `causa`      — o `id` do evento imediatamente anterior. É o que torna a
 *                  cadeia uma ÁRVORE e não um saco: com `correlacao` sozinha
 *                  sabe-se que os quatro são parentes, com `causa` sabe-se quem
 *                  gerou quem.
 *
 * **A propagação é automática.** Um `emit` feito de dentro de um handler herda
 * a `correlacao` do evento que está a ser tratado e aponta `causa` para ele.
 * Exigir que cada módulo passasse isso à mão seria garantir que a cadeia se
 * parte justamente nos módulos que ninguém reviu — que são os que se investiga.
 *
 * ⚠️ **O limite honesto:** a herança vale para o que é emitido ENQUANTO o
 * handler corre. Um handler `async` que emite depois de um `await` já saiu do
 * despacho, e o `emit` nasceria com cadeia nova. Para esse caso existe
 * `derivar(envelope)`, que devolve o `meta` a passar à mão. Não há como o bus
 * adivinhar sozinho sem `AsyncLocalStorage`, que não existe no navegador.
 */

const RE_CURINGA_PREFIXO = /:\*$/;

/**
 * @typedef {object} Envelope
 * @property {string} id          identidade deste evento
 * @property {string} evento
 * @property {string} origem      qual módulo emitiu — o que falta na V1
 * @property {string} correlacao  a cadeia a que este evento pertence
 * @property {string|null} causa  o `id` do evento que causou este
 * @property {number} versao      do formato do payload, não do módulo
 * @property {string} em          ISO 8601
 * @property {Record<string, unknown>} [contexto]
 */

/**
 * Identificador curto e legível num log.
 *
 * Não é UUID de propósito: `crypto.randomUUID` exige contexto seguro e o valor
 * aparece em toda linha de diagnóstico — 36 caracteres por evento tornam o log
 * ilegível justamente quando se está a lê-lo com pressa. Doze caracteres de
 * base36 dão ~62 bits, folgado para distinguir cadeias de uma sessão.
 */
function novoId() {
  const bytes = new Uint8Array(8);
  /* `getRandomValues` existe no navegador e no Node moderno. O fallback não é
   * decorativo: sem ele, um ambiente sem `crypto` (um runner antigo, um teste
   * com global trocado) derrubaria o bus inteiro — e o bus não pode ser o que
   * quebra primeiro. */
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  let saida = '';
  for (const b of bytes) saida += b.toString(36).padStart(2, '0');
  return saida.slice(0, 12);
}

/**
 * O `meta` que continua a cadeia de um envelope, para quem emite fora do
 * despacho — tipicamente um handler `async`, depois de um `await`.
 */
/**
 * @param {unknown} envelope
 * @returns {{correlacao?: string, causa?: string|null}}
 */
export function derivar(envelope) {
  if (!envelope || typeof envelope !== 'object') return {};
  const { correlacao, id } = /** @type {Partial<Envelope>} */ (envelope);
  if (typeof correlacao !== 'string' || !correlacao) return {};
  return { correlacao, causa: typeof id === 'string' ? id : null };
}

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
   * O envelope que está a ser despachado AGORA, ou `null` fora de despacho.
   *
   * É o que torna a correlação automática. Funciona porque `emit` é síncrono e
   * o JavaScript tem uma thread só: enquanto os handlers de um evento correm,
   * qualquer `emit` que eles façam acontece dentro desta janela.
   *
   * @type {Envelope|null}
   */
  let emDespacho = null;

  /**
   * @param {string} evento
   * @param {any} [payload]
   * @param {{origem?: string, versao?: number, contexto?: Record<string, unknown>,
   *          correlacao?: string, causa?: string|null}} [meta]
   */
  function emit(evento, payload, meta = {}) {
    if (evento === '*' || RE_CURINGA_PREFIXO.test(evento)) {
      throw new Error(`[bus] "${evento}" é padrão de inscrição, não evento. Não dá pra emitir.`);
    }

    /* A precedência é explícito > herdado > cadeia nova. O explícito vem
     * primeiro porque é o único caminho de quem cruza uma fronteira assíncrona
     * ou de processo: se a herança ganhasse, `derivar()` não teria como
     * funcionar dentro de um handler. */
    const herdado = emDespacho;
    const correlacao = meta.correlacao ?? herdado?.correlacao ?? novoId();
    const causa = meta.causa !== undefined ? meta.causa : (herdado?.id ?? null);

    /** @type {Envelope} */
    const envelope = {
      id: novoId(),
      evento,
      /* `desconhecida` em vez de vazio: quem lê um log com origem vazia acha que
       * o campo quebrou; com "desconhecida" sabe que ninguém declarou. */
      origem: meta.origem ?? 'desconhecida',
      correlacao,
      causa,
      versao: meta.versao ?? 1,
      em: new Date().toISOString(),
      ...(meta.contexto ? { contexto: meta.contexto } : {})
    };

    contador.set(evento, (contador.get(evento) ?? 0) + 1);

    /* Guardar e restaurar o anterior, em vez de limpar: os despachos aninham
     * (A → handler emite B → handlers de B correm), e limpar no fim de B faria
     * o resto dos handlers de A emitirem já fora da cadeia. */
    const anterior = emDespacho;
    emDespacho = envelope;
    try {
      for (const fn of alvos(evento)) {
        try {
          fn(payload, envelope);
        } catch (err) {
          /* Isolamento: um handler ruim não impede os outros. Registrar é
           * obrigatório — engolir aqui seria criar o buraco negro clássico em que
           * eventos "somem" sem ninguém saber por quê. */
          deps.log?.erro?.('handler de evento levantou', err, {
            evento, origem: envelope.origem, correlacao: envelope.correlacao
          });
        }
      }
    } finally {
      /* `finally` e não o fim do bloco: `alvos()` percorre um Map e um erro ali
       * deixaria o bus preso na cadeia deste evento para sempre. */
      emDespacho = anterior;
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
