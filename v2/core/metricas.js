/**
 * Métricas — o que o log sozinho não responde.
 *
 * ── A diferença entre log e métrica, e por que as duas existem ──────────────
 * O log responde *"o que aconteceu nesta vez"*. Com dezenas de agentes em
 * paralelo, as perguntas que importam são outras: *quantas vezes*, *quanto
 * tempo em geral*, *piorou desde ontem*. Nenhuma delas se responde lendo linhas
 * — e "grep no log e conta" é o antipadrão que faz alguém desligar o log em
 * produção justamente quando precisa dele.
 *
 * ── A armadilha que este arquivo trata de frente: cardinalidade ─────────────
 * Métrica com rótulo vindo de entrada — url, id de tarefa, nome de arquivo —
 * cresce sem limite. `coletas{url="…"}` com dez mil urls são dez mil séries na
 * memória, e o processo morre lentamente sem ninguém ligar o efeito à causa.
 *
 * É falha **silenciosa e adiada**, que é o pior par. Por isso há teto e o
 * excedente cai num balde `«outros»` **explícito** em vez de ser ignorado: o
 * operador precisa saber que está vendo um resumo truncado, não a verdade.
 *
 * ── Sem dependência ─────────────────────────────────────────────────────────
 * Nada de Prometheus, OpenTelemetry ou coletor externo agora. A Regra 5 exige
 * justificar dependência, e a 19 exige medir antes de afirmar ganho — não há o
 * que medir ainda. O formato de saída é um objeto simples; o dia em que houver
 * um coletor de verdade, ele lê isto sem que ninguém reescreva as chamadas.
 */

/** Teto de séries por métrica. Passou disso, o resto vira «outros». */
export const TETO_SERIES = 100;

const CHAVE_EXCEDENTE = '«outros»';

/**
 * Ordena os rótulos para `{a:1,b:2}` e `{b:2,a:1}` darem a mesma série.
 * Sem isso a mesma medida se parte em duas por ordem de digitação.
 * @param {Record<string, string|number>} [rotulos]
 */
function serie(rotulos) {
  if (!rotulos) return '';
  return Object.keys(rotulos).sort().map((k) => `${k}=${rotulos[k]}`).join(',');
}

export function criarMetricas() {
  /** @type {Map<string, Map<string, number>>} contadores: nome → série → valor */
  const contadores = new Map();
  /** @type {Map<string, Map<string, {n: number, soma: number, min: number, max: number}>>} */
  const medidas = new Map();
  /** @type {Set<string>} métricas que já estouraram o teto — para avisar uma vez */
  const truncadas = new Set();

  /**
   * @param {Map<string, Map<string, any>>} mapa
   * @param {string} nome
   * @param {Record<string, string|number>} [rotulos]
   */
  function alvo(mapa, nome, rotulos) {
    let series = mapa.get(nome);
    if (!series) { series = new Map(); mapa.set(nome, series); }

    const chave = serie(rotulos);
    if (series.has(chave)) return { series, chave };

    /* O teto conta séries NOVAS. Uma que já existe continua sendo atualizada
     * mesmo depois do estouro — senão a métrica congelaria no momento errado. */
    if (series.size >= TETO_SERIES) {
      truncadas.add(nome);
      return { series, chave: CHAVE_EXCEDENTE };
    }
    return { series, chave };
  }

  /**
   * Soma 1 (ou `quanto`) num contador.
   * @param {string} nome
   * @param {Record<string, string|number>} [rotulos]
   * @param {number} [quanto]
   */
  function contar(nome, rotulos, quanto = 1) {
    const { series, chave } = alvo(contadores, nome, rotulos);
    series.set(chave, (series.get(chave) ?? 0) + quanto);
  }

  /**
   * Registra uma duração (ou qualquer valor contínuo).
   *
   * Guarda `n`, `soma`, `min` e `max` — não o histograma completo. Percentil
   * exato exigiria guardar as amostras, e amostra guardada é memória que cresce;
   * média com extremos responde "está pior?" sem esse custo. Quando faltar
   * precisão, o lugar de resolver é um coletor de verdade, não aqui.
   *
   * @param {string} nome
   * @param {number} valor
   * @param {Record<string, string|number>} [rotulos]
   */
  function medir(nome, valor, rotulos) {
    if (!Number.isFinite(valor)) return;   // NaN envenenaria min/max para sempre
    const { series, chave } = alvo(medidas, nome, rotulos);
    const atual = series.get(chave);
    if (!atual) {
      series.set(chave, { n: 1, soma: valor, min: valor, max: valor });
      return;
    }
    atual.n += 1;
    atual.soma += valor;
    if (valor < atual.min) atual.min = valor;
    if (valor > atual.max) atual.max = valor;
  }

  /**
   * Cronometra uma função e registra a duração — inclusive quando ela falha.
   *
   * O rótulo `ok` separa as duas populações: sem ele, uma operação que falha
   * rápido puxa a média para baixo e esconde que o caminho feliz piorou.
   *
   * @template T
   * @param {string} nome
   * @param {() => T | Promise<T>} fn
   * @param {Record<string, string|number>} [rotulos]
   * @returns {T | Promise<T>}
   */
  function cronometrar(nome, fn, rotulos) {
    const t0 = Date.now();
    const fim = (/** @type {boolean} */ ok) => medir(nome, Date.now() - t0, { ...rotulos, ok: String(ok) });
    try {
      const r = fn();
      if (r && typeof (/** @type {any} */ (r).then) === 'function') {
        return /** @type {any} */ (r).then(
          (/** @type {any} */ v) => { fim(true); return v; },
          (/** @type {any} */ e) => { fim(false); throw e; }
        );
      }
      fim(true);
      return r;
    } catch (err) {
      fim(false);
      throw err;
    }
  }

  /** Retrato para o `/diagnostico`. Média calculada na leitura, não guardada. */
  function retrato() {
    /** @type {Record<string, Record<string, number>>} */
    const c = {};
    for (const [nome, series] of contadores) c[nome] = Object.fromEntries(series);

    /** @type {Record<string, Record<string, {n:number,media:number,min:number,max:number}>>} */
    const m = {};
    for (const [nome, series] of medidas) {
      m[nome] = {};
      for (const [chave, v] of series) {
        m[nome][chave] = { n: v.n, media: +(v.soma / v.n).toFixed(2), min: v.min, max: v.max };
      }
    }

    return {
      contadores: c,
      medidas: m,
      /* Explícito: quem lê precisa saber que está vendo resumo truncado. */
      truncadas: [...truncadas]
    };
  }

  /** Recorta por módulo, como storage e config. O rótulo é carimbado, não pedido. */
  function paraModulo(/** @type {string} */ id) {
    return {
      /** @param {string} nome @param {Record<string, string|number>} [rotulos] @param {number} [quanto] */
      contar: (nome, rotulos, quanto) => contar(nome, { ...rotulos, modulo: id }, quanto),
      /** @param {string} nome @param {number} valor @param {Record<string, string|number>} [rotulos] */
      medir: (nome, valor, rotulos) => medir(nome, valor, { ...rotulos, modulo: id }),
      /** @param {string} nome @param {() => any} fn @param {Record<string, string|number>} [rotulos] */
      cronometrar: (nome, fn, rotulos) => cronometrar(nome, fn, { ...rotulos, modulo: id })
    };
  }

  function limpar() {
    contadores.clear();
    medidas.clear();
    truncadas.clear();
  }

  return { contar, medir, cronometrar, retrato, paraModulo, limpar };
}

/** @typedef {ReturnType<typeof criarMetricas>} Metricas */
