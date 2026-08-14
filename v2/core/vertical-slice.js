/** Vertical slice mínimo da V2: manifesto -> autorização -> Runtime -> lifecycle. */
import { criarLifecycleRuntime } from './module-runtime-lifecycle.js';

/** @typedef {{selado?: boolean, modulo: (id: string) => unknown}} VerticalRegistry */
/** @typedef {{exigir?: (id: string) => unknown}} VerticalPermissions */
/** @typedef {{abrir: (registry: VerticalRegistry, permissoes: unknown, id: string) => Promise<void>, fechar: (id: string) => Promise<void>, abertas: () => ReadonlyArray<string>}} VerticalRuntimeSession */
/** @typedef {(id: string) => void | Promise<void>} VerticalHook */
/** @typedef {{init?: VerticalHook, start?: VerticalHook, stop?: VerticalHook, dispose?: VerticalHook}} VerticalHooks */
/** @typedef {'registered'|'starting'|'running'|'stopping'|'stopped'|'failed'} VerticalState */

/** @param {VerticalRegistry} registry @param {VerticalPermissions} permissoes @param {VerticalRuntimeSession} runtimeSession */
export function criarVerticalSlice(registry, permissoes, runtimeSession) {
  const runtimeLifecycle = criarLifecycleRuntime(registry, runtimeSession, permissoes);
  /** @type {Map<string, VerticalState>} */ const estados = new Map();

  async function iniciar(id, hooks = {}) {
    if (estados.get(id) === 'running') return;
    estados.set(id, 'starting');
    try {
      await runtimeLifecycle.abrir(id);
      await hooks.init?.(id); await hooks.start?.(id);
      estados.set(id, 'running');
    } catch (erro) {
      estados.set(id, 'failed');
      try { await hooks.dispose?.(id); } finally { await runtimeLifecycle.fechar(id); }
      throw erro;
    }
  }

  async function parar(id, hooks = {}) {
    if (!estados.has(id) || estados.get(id) === 'stopped') return;
    estados.set(id, 'stopping'); let erro;
    try { await hooks.stop?.(id); } catch (e) { erro = e; }
    try { await hooks.dispose?.(id); } catch (e) { erro ??= e; }
    try { await runtimeLifecycle.fechar(id); } catch (e) { erro ??= e; }
    estados.set(id, 'stopped'); if (erro) throw erro;
  }

  /** @param {string} id @returns {VerticalState} */
  function estado(id) { return estados.get(id) ?? 'registered'; }
  return { iniciar, parar, estado, runtimeAbertos: () => runtimeLifecycle.abertas() };
}
