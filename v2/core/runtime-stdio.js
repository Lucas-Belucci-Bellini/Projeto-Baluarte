/**
 * Transporte concreto Core -> baluarte-runtime por stdin/stdout.
 *
 * O processo Rust recebe uma linha JSON e devolve uma linha JSON. Apenas uma
 * requisição fica em voo por processo; isso mantém o protocolo determinístico
 * enquanto o contrato de concorrência ainda está sendo fechado.
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

function respostaError(message) {
  return { status: 'error', message };
}

function parseResposta(line) {
  try {
    const value = JSON.parse(line);
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new TypeError('resposta do Runtime deve ser objeto');
    }
    return value;
  } catch (error) {
    throw new TypeError(`resposta do Runtime inválida: ${error.message}`);
  }
}

/**
 * @param {{ executable: string, args?: string[], cwd?: string, root: string, spawnFn?: typeof spawn }} options
 */
export function criarRuntimeStdio(options) {
  if (!options?.executable) throw new TypeError('executable é obrigatório');
  if (!options?.root) throw new TypeError('root é obrigatório');

  const spawnProcess = options.spawnFn ?? spawn;
  let child = null;
  let lines = null;
  let pending = null;

  function iniciar() {
    if (child) return;
    child = spawnProcess(options.executable, options.args ?? [], {
      cwd: options.cwd,
      env: { ...process.env, BALUARTE_RUNTIME_ROOT: options.root },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    lines = createInterface({ input: child.stdout });
    lines.on('line', (line) => {
      if (!pending) return;
      const current = pending;
      pending = null;
      current.resolve(parseResposta(line));
    });

    child.on('error', (error) => {
      if (pending) {
        const current = pending;
        pending = null;
        current.reject(error);
      }
    });

    child.on('exit', (code, signal) => {
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

  function enviar(request) {
    iniciar();
    if (pending) return Promise.reject(new Error('Runtime Stdio já possui uma requisição em voo'));
    return new Promise((resolve, reject) => {
      pending = { resolve, reject };
      child.stdin.write(`${JSON.stringify(request)}\n`, (error) => {
        if (!error) return;
        if (!pending) return;
        pending = null;
        reject(error);
      });
    });
  }

  async function autorizar(envelope) {
    return enviar({ op: 'authorize', envelope });
  }

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
