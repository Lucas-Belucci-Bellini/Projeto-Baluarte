/** Bounded restart orchestration with exponential backoff. */

/** @typedef {{iniciar: (id: string) => Promise<void>, parar: (id: string) => Promise<void>}} RuntimeSupervisor */
/** @typedef {{estado: (id: string) => {restarts: number[]}, marcarFalha: (id: string, error: unknown) => boolean, podeReiniciar: (id: string) => boolean, marcarSaudavel: (id: string) => void}} RuntimeHealth */
/** @typedef {(ms: number) => Promise<void>} Sleep */
/**
 * @typedef {{
 *   supervisor: RuntimeSupervisor,
 *   health: RuntimeHealth,
 *   sleep?: Sleep,
 *   baseDelayMs?: number,
 *   maxDelayMs?: number
 * }} RuntimeRestartOptions
 */

/**
 * @param {RuntimeRestartOptions} [options]
 */
export function criarRuntimeRestart({ supervisor, health, sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms)), baseDelayMs = 100, maxDelayMs = 5000 } = {}) {
  if (!supervisor || typeof supervisor.iniciar !== 'function' || typeof supervisor.parar !== 'function') throw new TypeError('supervisor inválido');
  if (!health || typeof health.marcarFalha !== 'function' || typeof health.podeReiniciar !== 'function') throw new TypeError('health inválido');

  /** @param {string} id @param {unknown} error */
  async function reiniciar(id, error) {
    const permitido = health.marcarFalha(id, error);
    if (!permitido || !health.podeReiniciar(id)) return { restarted: false, reason: 'restart_budget_exhausted' };

    const tentativas = health.estado(id).restarts.length;
    const delay = Math.min(maxDelayMs, baseDelayMs * (2 ** Math.max(0, tentativas - 1)));
    await supervisor.parar(id);
    await sleep(delay);
    await supervisor.iniciar(id);
    health.marcarSaudavel(id);
    return { restarted: true, delayMs: delay, attempts: tentativas };
  }

  return { reiniciar };
}
