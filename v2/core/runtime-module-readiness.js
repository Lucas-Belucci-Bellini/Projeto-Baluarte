/** Dependency-aware readiness barrier for a Runtime module. */

/** @typedef {{lifecycle?: string, health?: {status?: string}}} RuntimeModuleStatus */
/** @typedef {{status: (id: string) => RuntimeModuleStatus | undefined}} RuntimeReadinessManager */
/** @typedef {{manager?: RuntimeReadinessManager}} RuntimeReadinessOptions */
/** @typedef {{ready: (id: string) => boolean, assertReady: (id: string) => true}} RuntimeReadiness */

/** @param {RuntimeReadinessOptions} [options] @returns {RuntimeReadiness} */
export function criarRuntimeReadiness({ manager } = {}) {
  if (!manager || typeof manager.status !== 'function') throw new TypeError('manager inválido');
  const runtimeManager = manager;

  /** @param {string} id @returns {boolean} */
  function ready(id) {
    const status = runtimeManager.status(id);
    return status?.lifecycle === 'running' && status?.health?.status === 'healthy';
  }

  /** @param {string} id @returns {true} */
  function assertReady(id) {
    if (!ready(id)) throw new Error(`Módulo não está pronto: ${id}`);
    return true;
  }

  return { ready, assertReady };
}
