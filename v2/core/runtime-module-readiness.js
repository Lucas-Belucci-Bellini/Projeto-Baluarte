/** Dependency-aware readiness barrier for a Runtime module. */

/** @typedef {{lifecycle?: string, health?: {status?: string}}} RuntimeModuleStatus */
/** @typedef {{status: (id: string) => RuntimeModuleStatus | undefined}} RuntimeReadinessManager */
/** @typedef {{manager?: RuntimeReadinessManager}} RuntimeReadinessOptions */
/** @typedef {{ready: (id: string) => boolean, assertReady: (id: string) => true}} RuntimeReadiness */

/** @param {RuntimeReadinessOptions} [options] @returns {RuntimeReadiness} */
export function criarRuntimeReadiness({ manager } = {}) {
  if (!manager || typeof manager.status !== 'function') throw new TypeError('manager inválido');

  /* Ver `runtime-supervisor.js`: o estreitamento da guarda não atravessa a
   * fronteira da função declarada. */
  const fonte = manager;

  /** @param {string} id */
  function ready(id) {
    const status = fonte.status(id);
    return status?.lifecycle === 'running' && status?.health?.status === 'healthy';
  }

  /* `@returns {true}`: a função só devolve quando deu certo — o outro caminho
   * lança. Sem isto o TS infere `boolean` e o contrato `assertReady` some. */
  /** @param {string} id @returns {true} */
  function assertReady(id) {
    if (!ready(id)) throw new Error(`Módulo não está pronto: ${id}`);
    return true;
  }

  return { ready, assertReady };
}
