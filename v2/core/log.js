/**
 * Log estruturado do Core.
 *
 * ── Por que não `console.log` ───────────────────────────────────────────────
 * A Regra 35 pede saber "qual módulo está executando, qual evento ocorreu,
 * quanto demorou, qual recurso consumiu, qual erro aconteceu, qual dependência
 * estava envolvida". Nada disso é respondível quando a informação é uma frase:
 * `console.log('erro ao salvar: ' + e)` perde o módulo, perde o tempo e perde o
 * erro original — sobra texto.
 *
 * Aqui um registro é **objeto**: `{ nivel, modulo, msg, ...campos }`. Formatar
 * para humano é decisão do destino, não de quem registra.
 *
 * ── O destino é trocável de propósito ───────────────────────────────────────
 * `definirDestino()` existe porque o mesmo Core roda no navegador (console), no
 * app (arquivo) e em teste (memória). Se o log escrevesse direto no console,
 * testar "isto registra o erro?" exigiria espionar `console.error` — que é
 * global, compartilhado e uma fonte clássica de teste instável.
 *
 * ── O que este arquivo NÃO faz ──────────────────────────────────────────────
 * Não decide política: não filtra por nível em produção, não amostra, não manda
 * para lugar nenhum. É o mínimo que os módulos precisam receber. Rotação,
 * amostragem e envio remoto são do destino, e entram quando houver destino real
 * — Regra 17, não implementar o futuro antes da hora.
 */

/** Ordem importa: o índice é a severidade. */
export const NIVEIS = /** @type {const} */ (['debug', 'info', 'aviso', 'erro']);

/**
 * @typedef {object} Registro
 * @property {string} nivel
 * @property {string} modulo
 * @property {string} msg
 * @property {string} em      ISO 8601
 * @property {Record<string, unknown>} [campos]
 */

/** @type {(r: Registro) => void} */
let destino = destinoConsole;

/** @type {number} índice em NIVEIS; abaixo disso não registra */
let minimo = 0;

/**
 * Destino padrão: console, formatado para leitura humana.
 * @param {Registro} r
 */
function destinoConsole(r) {
  const metodo = r.nivel === 'erro' ? 'error' : r.nivel === 'aviso' ? 'warn' : 'log';
  const campos = r.campos && Object.keys(r.campos).length ? r.campos : undefined;
  /* O módulo vai no prefixo em vez de diluído no objeto: quem lê console filtra
   * por texto, e `[militar]` é o filtro que a pessoa realmente digita. */
  console[metodo](`[${r.modulo}] ${r.msg}`, ...(campos ? [campos] : []));
}

/**
 * Troca o destino. Devolve o anterior — o chamador restaura sem guardar estado
 * global próprio, que é o que costuma vazar entre testes.
 * @param {(r: Registro) => void} novo
 */
export function definirDestino(novo) {
  const antes = destino;
  destino = novo;
  return antes;
}

/** @param {typeof NIVEIS[number]} nivel */
export function definirNivelMinimo(nivel) {
  const i = NIVEIS.indexOf(nivel);
  if (i < 0) throw new Error(`nível desconhecido: ${nivel}`);
  minimo = i;
}

/** Destino de memória, para teste e para o `/diagnostico`. */
export function coletor() {
  /** @type {Registro[]} */
  const registros = [];
  return {
    /** @param {Registro} r */
    destino: (r) => { registros.push(r); },
    registros,
    /** @param {string} nivel */
    de: (nivel) => registros.filter((r) => r.nivel === nivel),
    limpar: () => { registros.length = 0; }
  };
}

/**
 * Cria um logger amarrado a um módulo.
 *
 * O `modulo` é fixado na criação e **não** é parâmetro dos métodos: parâmetro
 * pode ser esquecido, e um registro sem dono é justamente o que torna um log
 * inútil quando há centenas de módulos.
 *
 * @param {string} modulo
 */
export function criarLog(modulo) {
  /**
   * @param {typeof NIVEIS[number]} nivel
   * @param {string} msg
   * @param {Record<string, unknown>} [campos]
   */
  function registrar(nivel, msg, campos) {
    if (NIVEIS.indexOf(nivel) < minimo) return;
    /** @type {Registro} */
    const r = { nivel, modulo, msg, em: new Date().toISOString() };
    if (campos && Object.keys(campos).length) r.campos = campos;
    try {
      destino(r);
    } catch {
      /* Destino que quebra não pode derrubar quem estava só registrando. É a
       * única exceção engolida deste arquivo, e ela é deliberada: a alternativa
       * é um erro de log mascarar o erro real que se tentava registrar. */
    }
  }

  return {
    modulo,
    /** @param {string} msg @param {Record<string, unknown>} [campos] */
    debug: (msg, campos) => registrar('debug', msg, campos),
    /** @param {string} msg @param {Record<string, unknown>} [campos] */
    info: (msg, campos) => registrar('info', msg, campos),
    /** @param {string} msg @param {Record<string, unknown>} [campos] */
    aviso: (msg, campos) => registrar('aviso', msg, campos),
    /**
     * @param {string} msg
     * @param {unknown} [erro] o erro original, preservado
     * @param {Record<string, unknown>} [campos]
     */
    erro: (msg, erro, campos) => {
      /* O erro é decomposto em vez de interpolado: `'falhou: ' + e` perde o
       * stack e o tipo, que são as duas coisas que fazem diferença às 3h. */
      const extra = erro instanceof Error
        ? { erroTipo: erro.name, erroMsg: erro.message, stack: erro.stack }
        : erro !== undefined ? { erro } : {};
      registrar('erro', msg, { ...campos, ...extra });
    },
    /**
     * Mede quanto durou. É o "quanto demorou" da Regra 35 — e registra mesmo
     * quando dá erro, porque operação lenta que falha é o caso que mais importa.
     * @template T
     * @param {string} msg
     * @param {() => Promise<T>} fn
     * @returns {Promise<T>}
     */
    async medir(msg, fn) {
      const t0 = Date.now();
      try {
        const r = await fn();
        registrar('debug', msg, { ms: Date.now() - t0, ok: true });
        return r;
      } catch (err) {
        registrar('aviso', msg, { ms: Date.now() - t0, ok: false });
        throw err;
      }
    }
  };
}

/** @typedef {ReturnType<typeof criarLog>} Log */
