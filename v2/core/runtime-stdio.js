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
/** @typedef {{resolve: (value: RespostaRuntime) => void, reject: (error: unknown) => void}} RequisicaoEmVoo */

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
 * @param {{ executable: string, args?: string[], cwd?: string, root: string, spawnFn?: typeof spawn }} options
 */
export function criarRuntimeStdio(options) {
  if (!options?.executable) throw new TypeError('executable é obrigatório');
  if (!options?.root) throw new TypeError('root é obrigatório');

  const spawnProcess = options.spawnFn ?? spawn;
  /** @type {import('node:child_process').ChildProcess|null} */
  let child = null;
  /** @type {import('node:readline').Interface|null} */
  let lines = null;
  /** @type {RequisicaoEmVoo|null} */
  let pending = null;

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
      if (!pending) return;
      const current = pending;
      pending = null;
      current.resolve(parseResposta(line));
    });

    processo.on('error', (error) => {
      if (pending) {
        const current = pending;
        pending = null;
        current.reject(error);
      }
    });

    processo.on('exit', (code, signal) => {
      const reason = new Error(`Runtime encerrou (code=${code}, signal=${signal ?? 'none'})`);
      if (pending) {
        const current = pending;
        pending = null;
        current.reject(reason);
      }
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
      pending = { resolve, reject };
      entrada.write(`${JSON.stringify(request)}\n`, (error) => {
        if (!error) return;
        if (!pending) return;
        pending = null;
        reject(error);
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
