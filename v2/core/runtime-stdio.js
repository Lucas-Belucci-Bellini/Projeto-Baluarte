/**
 * Transporte concreto Core -> baluarte-runtime por stdin/stdout.
 *
 * O processo Rust recebe uma linha JSON e devolve uma linha JSON. Apenas uma
 * requisição fica em voo por processo; isso mantém o protocolo determinístico
 * enquanto o contrato de concorrência ainda está sendo fechado.
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

/** @typedef {import('./runtime-bridge.js').RuntimeEnvelope} RuntimeEnvelope */
/** @typedef {Record<string, unknown>} RespostaRuntime */
/** @typedef {{resolve: (value: RespostaRuntime) => void, reject: (error: unknown) => void, timer: ReturnType<typeof setTimeout>}} RequisicaoEmVoo */

/**
 * Teto por requisição.
 *
 * Runtime que aceita a linha e nunca responde pendura o chamador exatamente
 * como um `init` que trava pendura a subida — mesma família de defeito, mesma
 * defesa. O `ciclo.ts` tem o `comTeto` dele, mas só o caminho do lifecycle passa
 * por lá; `lerArquivo` não passava por nenhum.
 *
 * 5 s é o valor que o `scripts/v2-runtime-smoke.mjs` já usava na versão própria
 * do protocolo. Trazê-lo para cá é o que permite aquele script parar de
 * reimplementar o transporte sem perder a proteção que ele tinha.
 */
export const TETO_RUNTIME_MS = 5_000;

/** @param {string} message */
function respostaError(message) {
  return { status: 'error', message };
}

/** @param {string} line @returns {RespostaRuntime} */
function parseResposta(line) {
  try {
    const value = JSON.parse(line);
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new TypeError('resposta do Runtime deve ser objeto');
    }
    return value;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new TypeError(`resposta do Runtime inválida: ${message}`);
  }
}

/**
 * @param {{ executable: string, args?: string[], cwd?: string, root: string, tetoMs?: number, spawnFn?: typeof spawn }} options
 */
export function criarRuntimeStdio(options) {
  if (!options?.executable) throw new TypeError('executable é obrigatório');
  if (!options?.root) throw new TypeError('root é obrigatório');

  const spawnProcess = options.spawnFn ?? spawn;
  const teto = options.tetoMs ?? TETO_RUNTIME_MS;
  /** @type {import('node:child_process').ChildProcess|null} */
  let child = null;
  /** @type {import('node:readline').Interface|null} */
  let lines = null;
  /** @type {RequisicaoEmVoo|null} */
  let pending = null;

  /**
   * Tira a requisição de voo e mata o teto — num lugar só.
   *
   * São QUATRO os caminhos que assentam uma requisição: a resposta chegou, o
   * processo errou, o processo saiu, e a escrita falhou. Esquecer o
   * `clearTimeout` em qualquer um deles deixaria o teto disparar depois, sobre
   * uma requisição já respondida — um erro que aparece como falha aleatória na
   * requisição SEGUINTE, que é o pior lugar para procurar.
   *
   * @returns {RequisicaoEmVoo|null}
   */
  function retirarDeVoo() {
    const atual = pending;
    if (!atual) return null;
    pending = null;
    clearTimeout(atual.timer);
    return atual;
  }

  function iniciar() {
    if (child) return;
    /* O processo fica numa const antes de ir para `child`: dentro dos callbacks
     * abaixo `child` volta a ser anulável (o `exit` zera), e é este apelido que
     * mantém o tipo estreito onde ele é de fato usado. */
    const processo = spawnProcess(options.executable, options.args ?? [], {
      cwd: options.cwd,
      env: { ...process.env, BALUARTE_RUNTIME_ROOT: options.root },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    child = processo;

    /* `stdio: pipe` garante os três canais; a guarda existe porque o tipo de
     * `spawn` não sabe disso, e falhar com a causa dita é melhor que estourar
     * um TypeError sem nome três linhas adiante. */
    if (!processo.stdout) throw new TypeError('Runtime subiu sem stdout');

    lines = createInterface({ input: processo.stdout });
    lines.on('line', (line) => {
      const current = retirarDeVoo();
      if (!current) return;
      /* `parseResposta` lança em linha inválida, e este é um handler de evento:
       * sem o `try`, o erro sobe como exceção NÃO CAPTURADA — e, pior, `pending`
       * já foi zerado acima, então a promessa do chamador nunca assenta. Um
       * Runtime que respondesse lixo penduraria o Core em silêncio. Medido: sem
       * este `try` os dois testes de resposta inválida não falham, eles TRAVAM
       * até o teto do runner.
       *
       * O `pending = null` continua ANTES do parse de propósito: a requisição
       * saiu de voo assim que a linha dela chegou, tenha a linha sentido ou não.
       * Zerar depois deixaria a próxima resposta cair sobre uma requisição já
       * respondida. */
      try {
        current.resolve(parseResposta(line));
      } catch (error) {
        current.reject(error);
      }
    });

    processo.on('error', (error) => {
      retirarDeVoo()?.reject(error);
    });

    processo.on('exit', (code, signal) => {
      const reason = new Error(`Runtime encerrou (code=${code}, signal=${signal ?? 'none'})`);
      retirarDeVoo()?.reject(reason);
      child = null;
      lines = null;
    });
  }

  /** @param {Record<string, unknown>} request @returns {Promise<RespostaRuntime>} */
  function enviar(request) {
    iniciar();
    if (pending) return Promise.reject(new Error('Runtime Stdio já possui uma requisição em voo'));
    const entrada = child?.stdin;
    if (!entrada) return Promise.reject(new Error('Runtime Stdio sem stdin: o processo não está no ar'));
    return new Promise((resolve, reject) => {
      /* O teto começa a contar quando a requisição entra em voo, não quando a
       * escrita completa: o caso que ele existe para pegar é o Runtime que
       * ACEITA a linha e nunca responde — nesse caminho a escrita termina bem. */
      const timer = setTimeout(() => {
        retirarDeVoo()?.reject(new Error(`Runtime não respondeu em ${teto}ms`));
      }, teto);
      pending = { resolve, reject, timer };
      entrada.write(`${JSON.stringify(request)}\n`, (error) => {
        if (!error) return;
        retirarDeVoo()?.reject(error);
      });
    });
  }

  /** @param {RuntimeEnvelope} envelope */
  async function autorizar(envelope) {
    return enviar({ op: 'authorize', envelope });
  }

  /** @param {RuntimeEnvelope} envelope @param {string} modulo @param {string} path */
  async function lerArquivo(envelope, modulo, path) {
    return enviar({ op: 'read_file', envelope, modulo, path });
  }

  async function fechar() {
    const atual = child;
    if (!atual) return;
    child = null;
    lines?.close();
    lines = null;
    if (atual.stdin && !atual.stdin.destroyed) atual.stdin.end();
  }

  return { iniciar, autorizar, lerArquivo, fechar, respostaError };
}
