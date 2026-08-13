/** Dependency-aware readiness barrier for a Runtime module. */
export function criarRuntimeReadiness({ manager } = {}) {
  if (!manager || typeof manager.status !== 'function') throw new TypeError('manager inválido');

  function ready(id) {
    const status = manager.status(id);
    return status?.lifecycle === 'running' && status?.health?.status === 'healthy';
  }

  function assertReady(id) {
    if (!ready(id)) throw new Error(`Módulo não está pronto: ${id}`);
    return true;
  }

  return { ready, assertReady };
}
