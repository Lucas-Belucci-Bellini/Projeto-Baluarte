/**
 * Contratos entre módulos — como um módulo chama outro.
 *
 * ── A ponta solta que este arquivo fecha ────────────────────────────────────
 * O manifesto declara `api: { … }` desde o primeiro rascunho e **nada
 * consumia**. Um módulo não tinha como chamar outro, então "comunicação por
 * contrato" era intenção, não mecanismo — e o caminho que sobrava era o mesmo
 * da V1: importar o arquivo do outro e mexer no que achasse.
 *
 * ── As quatro regras, e o que cada uma impede ───────────────────────────────
 *
 * **1. Chamar exige declarar.** `ctx.usar('editor')` só funciona se o módulo
 * declarou `dependencies: ['editor']`. Sem isso, dependência volta a ser
 * invisível: o Registry não teria como ordenar a subida nem cortar em cascata,
 * e o grafo de quem-depende-de-quem seria ficção.
 *
 * **2. Versão é negociada, não presumida.** Quem oferece declara `apiVersion`;
 * quem chama pode exigir. Duas versões incompatíveis falham **na resolução**,
 * com nome e números — não num `undefined is not a function` seis frames
 * adiante. É a Regra 15 (compatibilidade) virando mecânica.
 *
 * **3. A falha é atribuída ao DONO.** Uma API que levanta empacota o erro
 * dizendo de quem é: sem isso, o log culpa quem chamou, e a investigação começa
 * no módulo errado. Com centenas de módulos isso deixa de ser detalhe.
 *
 * **4. Chamada é observável.** Cada chamada conta. É o "qual módulo está
 * executando, quanto demorou" da Regra 35 — e o que permitirá, mais tarde,
 * responder "quem realmente usa esta API?" antes de mudá-la.
 *
 * ── O que isto NÃO é ────────────────────────────────────────────────────────
 * Não é RPC, não serializa, não cruza processo. É chamada de função no mesmo
 * runtime, com fronteira declarada. O dia em que um módulo morar noutro
 * processo — ou noutro repositório — o **contrato** já existe, e o transporte
 * entra por baixo sem o chamador saber. É essa a preparação para "integração
 * futura de outros repositórios": a fronteira nasce agora, o transporte depois.
 */

/** Erro de contrato. Tipo próprio para separar "não pode" de "quebrou". */
export class ErroContrato extends Error {
  /** @param {string} msg */
  constructor(msg) {
    super(msg);
    this.name = 'ErroContrato';
  }
}

/**
 * Erro que veio de DENTRO de uma API alheia.
 *
 * Existe para a pergunta "de quem é a culpa?" ter resposta. `causa` preserva o
 * original — envolver sem preservar troca um problema por outro.
 */
export class ErroApiModulo extends Error {
  /** @param {string} dono @param {string} metodo @param {unknown} causa */
  constructor(dono, metodo, causa) {
    const msg = causa instanceof Error ? causa.message : String(causa);
    super(`api "${dono}.${metodo}()" levantou: ${msg}`);
    this.name = 'ErroApiModulo';
    this.dono = dono;
    this.metodo = metodo;
    this.causa = causa;
  }
}

/**
 * Cria o resolvedor de APIs de um registro selado.
 *
 * @param {ReturnType<typeof import('./registry.js').criarRegistry>} registry
 * @param {{log?: {debug: Function, erro: Function}}} [deps]
 */
export function criarResolvedorApi(registry, deps = {}) {
  /** @type {Map<string, number>} chamadas por "dono.metodo" */
  const chamadas = new Map();

  /**
   * Devolve a API de `alvo` vista por `solicitante`.
   *
   * @param {string} solicitante id de quem chama
   * @param {string[]} declaradas as `dependencies` do solicitante
   * @param {string} alvo id de quem oferece
   * @param {{versao?: number}} [exigencia]
   */
  function usar(solicitante, declaradas, alvo, exigencia = {}) {
    return resolver(solicitante, declaradas, alvo, exigencia, 'dura');
  }

  /**
   * A versão FRACA: devolve `null` em vez de levantar quando o alvo não está
   * lá. É o par de `references.modules` — o módulo declarou que aponta para o
   * outro e que **funciona sem ele**.
   *
   * O que continua sendo erro, mesmo aqui: chamar sem ter declarado. A
   * declaração é o que torna a ligação visível ao Registry, e uma referência
   * invisível é o mesmo import disfarçado que a arquitetura combate — a
   * diferença entre dura e fraca é o que acontece na AUSÊNCIA, não se precisa
   * declarar.
   *
   * @param {string} solicitante
   * @param {string[]} declaradas as `references.modules` do solicitante
   * @param {string} alvo
   * @param {{versao?: number}} [exigencia]
   * @returns {Record<string, Function>|null}
   */
  function talvez(solicitante, declaradas, alvo, exigencia = {}) {
    return /** @type {Record<string, Function>|null} */ (
      resolver(solicitante, declaradas, alvo, exigencia, 'fraca')
    );
  }

  /**
   * @param {string} solicitante @param {string[]} declaradas @param {string} alvo
   * @param {{versao?: number}} exigencia @param {'dura'|'fraca'} forca
   */
  function resolver(solicitante, declaradas, alvo, exigencia, forca) {
    /** Ausência: erro na dura, `null` na fraca. @param {string} msg */
    const ausente = (msg) => {
      if (forca === 'dura') throw new ErroContrato(msg);
      deps.log?.debug?.('referência fraca sem alvo', { de: solicitante, alvo, motivo: msg });
      return null;
    };

    if (alvo === solicitante) {
      throw new ErroContrato(`módulo "${solicitante}" não precisa de usar() para a própria api`);
    }
    if (!declaradas.includes(alvo)) {
      /* Levanta nas DUAS forças: não declarar é sempre defeito. */
      throw new ErroContrato(
        `módulo "${solicitante}" não declarou ${forca === 'dura' ? 'depender de' : 'referenciar'} ` +
        `"${alvo}" — acrescente em ${forca === 'dura' ? 'dependencies[]' : 'references.modules[]'}`
      );
    }

    const m = registry.modulo(alvo);
    if (!m) {
      /* Na dura não deveria acontecer: o Registry corta em cascata quem depende
       * de módulo ausente. Se acontecer, é inconsistência de verdade e merece
       * erro alto em vez de `undefined`. Na fraca é o caso ESPERADO. */
      return ausente(`módulo "${alvo}" não está no ar (dependência de "${solicitante}")`);
    }

    const metodos = Object.keys(m.api ?? {});
    if (metodos.length === 0) {
      return ausente(`módulo "${alvo}" não oferece api — nada a usar`);
    }

    /* Versão: quem oferece declara; quem chama exige. O padrão é 1 dos dois
     * lados, então módulos que ainda não pensaram em versão simplesmente
     * funcionam — e o dia em que pensarem, o mecanismo já está lá. */
    const oferecida = m.apiVersion ?? 1;
    if (exigencia.versao !== undefined && exigencia.versao !== oferecida) {
      /* Também degrada na fraca: o alvo existe e não fala a versão pedida, o
       * que para quem referencia é o mesmo que não estar lá. Levantar aqui
       * derrubaria um módulo que declarou funcionar sem — e a incompatibilidade
       * de versão é exatamente quando isso acontece na vida real. */
      return ausente(
        `"${solicitante}" exige a api v${exigencia.versao} de "${alvo}", que oferece v${oferecida}`
      );
    }

    /* Um objeto novo, com cada método embrulhado. Devolver `m.api` cru deixaria
     * o chamador guardar referência e chamar depois do módulo ter parado — e
     * sem a atribuição de culpa nem a contagem. */
    /** @type {Record<string, Function>} */
    const superficie = {};
    for (const nome of metodos) {
      const fn = /** @type {any} */ (m.api)[nome];
      if (typeof fn !== 'function') continue;

      superficie[nome] = (/** @type {any[]} */ ...args) => {
        const chave = `${alvo}.${nome}`;
        chamadas.set(chave, (chamadas.get(chave) ?? 0) + 1);
        try {
          const r = fn(...args);
          /* Promessa também precisa da atribuição: sem o `catch` aqui, uma api
           * assíncrona que rejeita chega ao chamador como erro anônimo, e a
           * regra 3 valeria só para o caminho síncrono. */
          if (r && typeof r.then === 'function') {
            return r.catch((/** @type {unknown} */ err) => {
              deps.log?.erro?.('api de módulo rejeitou', err, { dono: alvo, metodo: nome, chamador: solicitante });
              throw new ErroApiModulo(alvo, nome, err);
            });
          }
          return r;
        } catch (err) {
          deps.log?.erro?.('api de módulo levantou', err, { dono: alvo, metodo: nome, chamador: solicitante });
          throw new ErroApiModulo(alvo, nome, err);
        }
      };
    }

    /* Congelado: o chamador não remenda a api de quem ofereceu. É a diferença
     * entre "usar o contrato" e "mexer no módulo alheio". */
    return Object.freeze(superficie);
  }

  /**
   * Quem oferece o quê. Complementa o grafo de dependências com a superfície
   * real — dependência declarada sem api usada é sinal de acoplamento morto.
   */
  function catalogo() {
    return registry.listar().map((id) => {
      const m = registry.modulo(id);
      const api = /** @type {Record<string, unknown>} */ (m?.api ?? {});
      return {
        modulo: id,
        versao: m?.apiVersion ?? 1,
        metodos: Object.keys(api).filter((k) => typeof api[k] === 'function')
      };
    }).filter((x) => x.metodos.length > 0);
  }

  /** Contagem por `dono.metodo`. Responde "quem usa isto?" antes de mudar. */
  function uso() {
    return Object.fromEntries(chamadas);
  }

  return { usar, talvez, catalogo, uso };
}
