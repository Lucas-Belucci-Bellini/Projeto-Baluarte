/** Unified facade for module Runtime supervision. */

/** @typedef {{supervisor: {iniciar: (id: string) => Promise<unknown>, parar: (id: string) => Promise<unknown>, estado: (id: string) => string}, restart: {reiniciar: (id: string, error: Error) => Promise<{restarted: boolean, attempts: number, delayMs: number}>}, health: {estado: (id: string) => unknown, marcarSaudavel?: (id: string) => void}, events?: {started?: (id: string) => void, stopped?: (id: string) => void, failed?: (id: string, error: Error) => void, restarting?: (id: string, attempts: number, delayMs: number) => void, exhausted?: (id: string) => void}}} RuntimeManagerOptions */

/** @param {RuntimeManagerOptions} [options] */
export function criarRuntimeManager(options = {}) {
  const { supervisor, restart, health, events } = options;
  if (!supervisor || typeof supervisor.iniciar !== 'function' || typeof supervisor.parar !== 'function' || typeof supervisor.estado !== 'function') throw new TypeError('supervisor inválido');
  if (!restart || typeof restart.reiniciar !== 'function') throw new TypeError('restart inválido');
  if (!health || typeof health.estado !== 'function') throw new TypeError('health inválido');

  /** @param {string} id */
  async function start(id) {
    await supervisor.iniciar(id);
    health.marcarSaudavel?.(id);
    events?.started?.(id);
    return status(id);
  }

  /** @param {string} id */
  async function stop(id) {
    await supervisor.parar(id);
    events?.stopped?.(id);
    return status(id);
  }

  /** @param {string} id @param {Error} [error] */
  async function restartModule(id, error = new Error('restart requested')) {
    events?.failed?.(id, error);
    const result = await restart.reiniciar(id, error);
    if (result.restarted) events?.restarting?.(id, result.attempts, result.delayMs);
    else events?.exhausted?.(id);
    return { ...result, status: status(id) };
  }

  /** @param {string} id */
  function status(id) {
    return { id, lifecycle: supervisor.estado(id), health: health.estado(id) };
  }

  return { start, stop, restart: restartModule, status };
}
