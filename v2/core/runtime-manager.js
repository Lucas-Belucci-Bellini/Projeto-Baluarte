/** Unified facade for module Runtime supervision. */
export function criarRuntimeManager({ supervisor, restart, health, events } = {}) {
  if (!supervisor || typeof supervisor.iniciar !== 'function' || typeof supervisor.parar !== 'function' || typeof supervisor.estado !== 'function') throw new TypeError('supervisor inválido');
  if (!restart || typeof restart.reiniciar !== 'function') throw new TypeError('restart inválido');
  if (!health || typeof health.estado !== 'function') throw new TypeError('health inválido');

  async function start(id) {
    await supervisor.iniciar(id);
    health.marcarSaudavel?.(id);
    events?.started?.(id);
    return status(id);
  }

  async function stop(id) {
    await supervisor.parar(id);
    events?.stopped?.(id);
    return status(id);
  }

  async function restartModule(id, error = new Error('restart requested')) {
    events?.failed?.(id, error);
    const result = await restart.reiniciar(id, error);
    if (result.restarted) events?.restarting?.(id, result.attempts, result.delayMs);
    else events?.exhausted?.(id);
    return { ...result, status: status(id) };
  }

  function status(id) {
    return { id, lifecycle: supervisor.estado(id), health: health.estado(id) };
  }

  return { start, stop, restart: restartModule, status };
}
