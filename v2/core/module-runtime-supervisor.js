/**
 * Supervisor mínimo do ciclo módulo + Runtime.
 * Mantém o estado de execução fora do módulo e garante cleanup.
 */
/** @typedef {(id: string) => Promise<void>} RuntimeHook */
/** @typedef {{abrir: RuntimeHook, fechar: RuntimeHook}} RuntimeLifecycle */
/** @typedef {{init?: RuntimeHook, start?: RuntimeHook, stop?: RuntimeHook, dispose?: RuntimeHook}} RuntimeHooks */

/**
 * @param {RuntimeLifecycle} lifecycle
 * @param {RuntimeHooks} [hooks={}]
 */
export function criarModuleRuntimeSupervisor(lifecycle, hooks = {}) {
  if (!lifecycle || typeof lifecycle.abrir !== 'function' || typeof lifecycle.fechar !== 'function') {
    throw new TypeError('lifecycle Runtime inválido');
  }

  const estados = new Map();
  /** @param {'init'|'start'|'stop'|'dispose'} nome */
  const hook = (nome) => typeof hooks[nome] === 'function' ? hooks[nome] : async () => {};

  /** @param {string} id */
  async function iniciar(id) {
    const estado = estados.get(id);
    if (estado === 'running' || estado === 'starting') return;
    estados.set(id, 'starting');
    try {
      await lifecycle.abrir(id);
      await hook('init')(id);
      await hook('start')(id);
      estados.set(id, 'running');
    } catch (error) {
      estados.set(id, 'failed');
      try { await hook('dispose')(id); } finally { await lifecycle.fechar(id); }
      throw error;
    }
  }

  /** @param {string} id */
  async function parar(id) {
    if (!estados.has(id) || estados.get(id) === 'stopped') return;
    try {
      await hook('stop')(id);
    } finally {
      try {
        await hook('dispose')(id);
      } finally {
        await lifecycle.fechar(id);
        estados.set(id, 'stopped');
      }
    }
  }

  /** @param {string} id */
  function estado(id) { return estados.get(id) ?? 'stopped'; }

  return { iniciar, parar, estado };
}
