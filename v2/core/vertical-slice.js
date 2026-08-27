/**
 * Vertical slice mínimo da V2: manifesto -> autorização -> Runtime -> lifecycle.
 * Mantém o transporte injetável para permitir testes sem IPC real.
 */
import { criarLifecycleRuntime } from './module-runtime-lifecycle.js';

/** @typedef {import('./module-runtime-lifecycle.js').RuntimeRegistry} RuntimeRegistry */
/** @typedef {import('./module-runtime-lifecycle.js').RuntimeSessions} RuntimeSessions */
/** @typedef {import('./module-runtime-supervisor.js').RuntimeHooks} RuntimeHooks */
/** @typedef {'starting'|'running'|'stopping'|'stopped'|'failed'} EstadoSlice */

/**
 * @param {RuntimeRegistry} registry
 * @param {unknown} permissoes
 * @param {RuntimeSessions} runtimeSession
 */
export function criarVerticalSlice(registry, permissoes, runtimeSession) {
  const runtimeLifecycle = criarLifecycleRuntime(registry, runtimeSession, permissoes);
  /** @type {Map<string, EstadoSlice>} */
  const estados = new Map();

  /** @param {string} id @param {RuntimeHooks} [hooks] */
  async function iniciar(id, hooks = {}) {
    if (estados.get(id) === 'running') return;
    estados.set(id, 'starting');
    try {
      await runtimeLifecycle.abrir(id);
      await hooks.init?.(id);
      await hooks.start?.(id);
      estados.set(id, 'running');
    } catch (erro) {
      estados.set(id, 'failed');
      try { await hooks.dispose?.(id); } finally { await runtimeLifecycle.fechar(id); }
      throw erro;
    }
  }

  /** @param {string} id @param {RuntimeHooks} [hooks] */
  async function parar(id, hooks = {}) {
    if (!estados.has(id) || estados.get(id) === 'stopped') return;
    estados.set(id, 'stopping');
    let erro;
    try { await hooks.stop?.(id); }
    catch (e) { erro = e; }
    try { await runtimeLifecycle.fechar(id); }
    catch (e) { erro ??= e; }
    try { await hooks.dispose?.(id); }
    catch (e) { erro ??= e; }
    estados.set(id, 'stopped');
    if (erro) throw erro;
  }

  return {
    iniciar,
    parar,
    /** @param {string} id */
    estado: (id) => estados.get(id) ?? 'registered',
    runtimeAbertos: () => runtimeLifecycle.abertas()
  };
}
