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
 * ── Health: o bus contava sucesso e perdia fracasso ────────────────────────
 *
 * `contagem()` sobe a cada `emit` — igual se os handlers todos funcionaram e
 * igual se todos levantaram. O handler que levanta era passado a
 * `deps.log?.erro?.()` e acabava ali; com `criarBus()` sem deps, que é o padrão,
 * desaparecia inteiro. Um bus cuja telemetria toda está partida ficava
 * indistinguível de um saudável.
 *
 * Então a falha passa a ser **contada por evento**, e as últimas ficam com a
 * cadeia junto. O log continua — a contagem não o substitui, é o que sobra
 * quando ninguém injetou log.
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
 * @typedef {object} FalhaBus
 * @property {string} evento
 * @property {string} origem
 * @property {string} correlacao  a cadeia — é o que liga a falha ao que a causou
 * @property {string|null} causa
 * @property {string} erro        a MENSAGEM, não o Error: guardar o objeto num
 *                                anel de 50 retém stack e closures vivas
 * @property {string} em
 */

/**
 * @typedef {object} ResumoLatenciaBus
 * @property {number} n              despachos medidos
 * @property {number} mediaMs        média em milissegundos
 * @property {number|null} minMs     menor despacho; null sem amostras
 * @property {number|null} maxMs     maior despacho; null sem amostras
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
 * @param {{log?: {aviso?: Function, erro?: Function}, tetoFalhas?: number,
 *          relogio?: () => number}} [deps]
 */
export function criarBus(deps = {}) {
  /** @type {Map<string, Set<Function>>} */
  const inscritos = new Map();
  /** @type {Map<string, number>} contagem por evento, para o diagnóstico */
  const contador = new Map();

  /** @type {Map<string, number>} falhas de handler por evento */
  const falhasPorEvento = new Map();
  /** @type {FalhaBus[]} as últimas, limitadas — histórico sem limite é vazamento */
  const ultimasFalhas = [];
  const TETO_FALHAS = deps.tetoFalhas ?? 50;

  /* O relógio é uma dependência de observabilidade, nunca uma dependência de
   * funcionamento. Se um ambiente o trocar ou fizer o relógio falhar, o bus
   * continua emitindo; uma métrica não pode ser o primeiro componente a cair. */
  const relogio = deps.relogio ?? (() => {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }
    return Date.now();
  });

  /** @type {{n: number, soma: number, minMs: number, maxMs: number}|null} */
  let latencia = null;

  /** @returns {number|null} */
  function agoraSeguro() {
    try {
      const valor = relogio();
      return Number.isFinite(valor) ? valor : null;
    } catch {
      return null;
    }
  }

  /** @param {number|null} inicio */
  function registrarLatencia(inicio) {
    if (inicio === null) return;
    const fim = agoraSeguro();
    if (fim === null) return;
    /* Relógios monotônicos são preferidos, mas o clamp torna a saída honesta
     * também em ambientes que injetam Date.now() e sofrem ajuste de relógio. */
    const duracao = Math.max(0, fim - inicio);
    if (!Number.isFinite(duracao)) return;
    if (!latencia) {
      latencia = { n: 1, soma: duracao, minMs: duracao, maxMs: duracao };
      return;
    }
    latencia.n += 1;
    latencia.soma += duracao;
    if (duracao < latencia.minMs) latencia.minMs = duracao;
    if (duracao > latencia.maxMs) latencia.maxMs = duracao;
  }

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
    const inicio = agoraSeguro();
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
          falhasPorEvento.set(evento, (falhasPorEvento.get(evento) ?? 0) + 1);
          ultimasFalhas.push({
            evento,
            origem: envelope.origem,
            correlacao: envelope.correlacao,
            causa: envelope.causa,
            erro: err instanceof Error ? err.message : String(err),
            em: envelope.em
          });
          /* O anel: sem teto, um handler que levanta em laço enche a memória —
           * e o histórico que se quer ler é o recente, não o de há uma hora. */
          if (ultimasFalhas.length > TETO_FALHAS) {
            ultimasFalhas.splice(0, ultimasFalhas.length - TETO_FALHAS);
          }
          deps.log?.erro?.('handler de evento levantou', err, {
            evento, origem: envelope.origem, correlacao: envelope.correlacao
          });
        }
      }
    } finally {
      /* `finally` e não o fim do bloco: `alvos()` percorre um Map e um erro ali
       * deixaria o bus preso na cadeia deste evento para sempre. */
      emDespacho = anterior;
      registrarLatencia(inicio);
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

  /**
   * A saúde do bus — o que `contagem()` sozinha não conta.
   *
   * ── Por que NÃO há `liveness` aqui ──────────────────────────────────────
   * `liveness` responde "o processo está vivo?". O bus é uma estrutura de
   * dados dentro do Core, e o Core já responde a isso em `saude.js`. Um campo
   * que só sabe dizer `healthy` não é sinal — é um carimbo, e um carimbo num
   * retrato de saúde acaba lido como garantia. Fica de fora de propósito.
   *
   * ── O que `readiness` responde, e por que é essa a pergunta ─────────────
   * Um bus sem nenhum inscrito **engole tudo em silêncio**: o `emit` sucede, o
   * contador sobe, e o evento não chega a ninguém. É o "evento órfão" que a
   * matriz da Fase 03 nomeia como risco, visto do lado do runtime. É a única
   * condição que impede o bus de fazer o seu trabalho, e por isso é a única
   * que vira `unhealthy`.
   *
   * ── O que NÃO vira `unhealthy`, e por quê ───────────────────────────────
   * Handler que levanta. O isolamento é decisão de desenho deste bus (está no
   * cabeçalho): um handler ruim não derruba os outros, então um handler a
   * levantar é o bus a funcionar como projetado. Degradar o veredito por isso
   * contradiria a mesma regra de isolamento que `saude.js` já segue para
   * falhas de módulo. A falha aparece nos motivos e na contagem — que é onde
   * ela é acionável — e não no veredito.
   */
  function saude() {
    let ouvintes = 0;
    for (const conjunto of inscritos.values()) ouvintes += conjunto.size;

    let emissoes = 0;
    for (const n of contador.values()) emissoes += n;
    let falhas = 0;
    for (const n of falhasPorEvento.values()) falhas += n;

    /** @type {Record<string, {emissoes: number, falhas: number}>} */
    const porEvento = {};
    for (const [evento, n] of contador) {
      porEvento[evento] = { emissoes: n, falhas: falhasPorEvento.get(evento) ?? 0 };
    }
    /* Um evento pode ter falha sem estar no contador se `limpar()` correu no
     * meio; incluir na mesma, para a soma bater com `contagem.falhas`. */
    for (const [evento, n] of falhasPorEvento) {
      if (!porEvento[evento]) porEvento[evento] = { emissoes: 0, falhas: n };
    }

    const motivos = [];
    if (ouvintes === 0) motivos.push('nenhum inscrito: todo evento emitido cai no vazio');
    if (falhas) motivos.push(`${falhas} falha(s) de handler`);
    /* O sinal que vale a pena ler primeiro: um evento cujos handlers falham
     * SEMPRE é um handler que nunca funcionou, não um que oscila. */
    for (const [evento, { emissoes: e, falhas: f }] of Object.entries(porEvento)) {
      if (f > 0 && e > 0 && f >= e) motivos.push(`"${evento}": handler falha em toda emissão (${f}/${e})`);
    }

    return {
      readiness: ouvintes > 0 ? 'healthy' : 'unhealthy',
      motivos,
      contagem: { emissoes, falhas, padroes: inscritos.size, ouvintes },
      porEvento,
      latencia: latencia
        ? {
            n: latencia.n,
            mediaMs: +(latencia.soma / latencia.n).toFixed(2),
            minMs: latencia.minMs,
            maxMs: latencia.maxMs
          }
        : { n: 0, mediaMs: 0, minMs: null, maxMs: null },
      ultimasFalhas: ultimasFalhas.map((f) => ({ ...f }))
    };
  }

  function limpar() {
    inscritos.clear();
    contador.clear();
    falhasPorEvento.clear();
    ultimasFalhas.length = 0;
    latencia = null;
  }

  return { on, emit, inscricoes, contagem, saude, limpar };
}

/** @typedef {ReturnType<typeof criarBus>} Bus */
