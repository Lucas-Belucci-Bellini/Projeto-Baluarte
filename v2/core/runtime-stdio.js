/**
 * Transporte concreto Core -> baluarte-runtime por stdin/stdout.
 *
 * O processo Rust recebe uma linha JSON e devolve uma linha JSON. Apenas uma
 * requisição fica em voo por processo; isso mantém o protocolo determinístico
 * enquanto o contrato de concorrência ainda está sendo fechado.
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

/** @typedef {{status: string, [key: string]: unknown}} RuntimeStdioResponse */
/** @typedef {{resolve: (value: RuntimeStdioResponse) => void, reject: (error: unknown) => void}} RuntimePending */
/** @typedef {{executable: string, args?: string[], cwd?: string, root: string, spawnFn?: typeof spawn}} RuntimeStdioOptions */

/** @param {string} message @returns {{status: 'error', message: string}} */
function respostaError(message) {
  return { status: 'error', message };
}

/** @param {string} line @returns {RuntimeStdioResponse} */
function parseResposta(line) {
  try {
    const value = JSON.parse(line);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('resposta do Runtime deve ser objeto');
    return /** @type {RuntimeStdioResponse} */ (value);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new TypeError(`resposta do Runtime inválida: ${message}`);
  }
}

/** @param {RuntimeStdioOptions} options */
export function criarRuntimeStdio(options) {
  if (!options?.executable) throw new TypeError('executable é obrigatório');
  if (!options?.root) throw new TypeError('root é obrigatório');

  const spawnProcess = options.spawnFn ?? spawn;
  /** @type {import('node:child_process').ChildProcess | null} */
  let child = null;
  /** @type {import('node:readline').ReadlineInterface | null} */
  let lines = null;
  /** @type {RuntimePending | null} */
  let pending = null;

  function iniciar() {
    if (child) return;
    child = spawnProcess(options.executable, options.args ?? [], {
      cwd: options.cwd,
      env: { ...process.env, BALUARTE_RUNTIME_ROOT: options.root },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const runtimeChild = child;
    lines = createInterface({ input: runtimeChild.stdout });
    lines.on('line', (line) => {
      if (!pending) return;
      const current = pending;
      pending = null;
      current.resolve(parseResposta(line));
    });

    runtimeChild.on('error', (error) => {
      if (!pending) return;
      const current = pending;
      pending = null;
      current.reject(error);
    });

    runtimeChild.on('exit', (code, signal) => {
      const reason = new Error(`Runtime encerrou (code=${code}, signal=${signal ?? 'none'})`);
      if (pending) {
        const current = pending;
        pending = null;
        current.reject(reason);
      }
      if (child === runtimeChild) child = null;
      lines = null;
    });
  }

  /** @param {unknown} request @returns {Promise<RuntimeStdioResponse>} */
  function enviar(request) {
    iniciar();
    if (!child) return Promise.reject(new Error('Runtime Stdio não iniciou'));
    if (pending) return Promise.reject(new Error('Runtime Stdio já possui uma requisição em voo'));
    const runtimeChild = child;
    return new Promise((resolve, reject) => {
      pending = { resolve, reject };
      runtimeChild.stdin.write(`${JSON.stringify(request)}\n`, (error) => {
        if (!error) return;
        if (!pending) return;
        pending = null;
        reject(error);
      });
    });
  }

  /** @param {unknown} envelope @returns {Promise<RuntimeStdioResponse>} */
  async function autorizar(envelope) {
    return enviar({ op: 'authorize', envelope });
  }

  /** @param {unknown} envelope @param {string} modulo @param {string} path @returns {Promise<RuntimeStdioResponse>} */
  async function lerArquivo(envelope, modulo, path) {
    return enviar({ op: 'read_file', envelope, modulo, path });
  }

  async function fechar() {
    if (!child) return;
    const atual = child;
    child = null;
    lines?.close();
    lines = null;
    if (!atual.stdin.destroyed) atual.stdin.end();
  }

  return { iniciar, autorizar, lerArquivo, fechar, respostaError };
}
