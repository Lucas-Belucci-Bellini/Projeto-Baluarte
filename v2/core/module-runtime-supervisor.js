/**
 * Supervisor mínimo do ciclo módulo + Runtime.
 * Mantém o estado de execução fora do módulo e garante cleanup.
 */

/** @typedef {'starting'|'running'|'failed'|'stopped'} RuntimeStatus */
/** @typedef {{abrir: (id: string) => Promise<void>, fechar: (id: string) => Promise<void>}} RuntimeLifecycle */
/** @typedef {(id: string) => Promise<void> | void} RuntimeHook */
/** @typedef {{init?: RuntimeHook, start?: RuntimeHook, stop?: RuntimeHook, dispose?: RuntimeHook}} RuntimeHooks */

/**
 * @param {RuntimeLifecycle} lifecycle
 * @param {RuntimeHooks} [hooks]
 */
export function criarModuleRuntimeSupervisor(lifecycle, hooks = {}) {
  if (!lifecycle || typeof lifecycle.abrir !== 'function' || typeof lifecycle.fechar !== 'function') {
    throw new TypeError('lifecycle Runtime inválido');
  }

  /** @type {Map<string, RuntimeStatus>} */
  const estados = new Map();
  /** @param {keyof RuntimeHooks} nome @returns {RuntimeHook} */
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
      try { await lifecycle.fechar(id); } finally { await hook('dispose')(id); }
      throw error;
    }
  }

  /** @param {string} id */
  async function parar(id) {
    if (!estados.has(id) || estados.get(id) === 'stopped') return;
    try {
      await hook('stop')(id);
    } finally {
      try { await lifecycle.fechar(id); } finally {
        await hook('dispose')(id);
        estados.set(id, 'stopped');
      }
    }
  }

  /** @param {string} id @returns {RuntimeStatus} */
  function estado(id) { return estados.get(id) ?? 'stopped'; }

  return { iniciar, parar, estado };
}
