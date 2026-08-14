/** Unified facade for module Runtime supervision. */

/** @typedef {{iniciar: (id: string) => Promise<unknown>, parar: (id: string) => Promise<unknown>, estado: (id: string) => string}} RuntimeManagerSupervisor */
/** @typedef {{reiniciar: (id: string, error: unknown) => Promise<{restarted: boolean, attempts?: number, delayMs?: number, reason?: string}>}} RuntimeManagerRestart */
/** @typedef {{estado: (id: string) => unknown, marcarSaudavel?: (id: string) => void}} RuntimeManagerHealth */
/** @typedef {{started?: (id: string) => void, stopped?: (id: string) => void, failed?: (id: string, error: unknown) => void, restarting?: (id: string, attempts: number, delayMs: number) => void, exhausted?: (id: string) => void}} RuntimeManagerEvents */
/** @typedef {{id: string, lifecycle: string, health: unknown}} RuntimeManagerStatus */
/** @typedef {{restarted: boolean, attempts?: number, delayMs?: number, reason?: string, status: RuntimeManagerStatus}} RuntimeManagerRestartResult */
/** @typedef {{supervisor: RuntimeManagerSupervisor, restart: RuntimeManagerRestart, health: RuntimeManagerHealth, events?: RuntimeManagerEvents}} RuntimeManagerOptions */
/** @typedef {{start: (id: string) => Promise<RuntimeManagerStatus>, stop: (id: string) => Promise<RuntimeManagerStatus>, restart: (id: string, error?: Error) => Promise<RuntimeManagerRestartResult>, status: (id: string) => RuntimeManagerStatus}} RuntimeManager */

/** @param {RuntimeManagerOptions} [options] @returns {RuntimeManager} */
export function criarRuntimeManager(options = {}) {
  const { supervisor, restart, health, events } = options;
  if (!supervisor || typeof supervisor.iniciar !== 'function' || typeof supervisor.parar !== 'function' || typeof supervisor.estado !== 'function') throw new TypeError('supervisor inválido');
  if (!restart || typeof restart.reiniciar !== 'function') throw new TypeError('restart inválido');
  if (!health || typeof health.estado !== 'function') throw new TypeError('health inválido');

  /** @param {string} id @returns {Promise<RuntimeManagerStatus>} */
  async function start(id) {
    await supervisor.iniciar(id);
    health.marcarSaudavel?.(id);
    events?.started?.(id);
    return status(id);
  }

  /** @param {string} id @returns {Promise<RuntimeManagerStatus>} */
  async function stop(id) {
    await supervisor.parar(id);
    events?.stopped?.(id);
    return status(id);
  }

  /** @param {string} id @param {Error} [error] @returns {Promise<RuntimeManagerRestartResult>} */
  async function restartModule(id, error = new Error('restart requested')) {
    events?.failed?.(id, error);
    const result = await restart.reiniciar(id, error);
    if (result.restarted) events?.restarting?.(id, result.attempts ?? 0, result.delayMs ?? 0);
    else events?.exhausted?.(id);
    return { ...result, status: status(id) };
  }

  /** @param {string} id @returns {RuntimeManagerStatus} */
  function status(id) {
    return { id, lifecycle: supervisor.estado(id), health: health.estado(id) };
  }

  return { start, stop, restart: restartModule, status };
}
