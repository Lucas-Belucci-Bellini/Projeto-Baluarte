/** Bounded restart orchestration with exponential backoff and single-flight per module. */

/** @typedef {{iniciar: (id: string) => Promise<void>, parar: (id: string) => Promise<void>}} RuntimeSupervisor */
/** @typedef {{estado: (id: string) => {restarts: number[]}, marcarFalha: (id: string, error: unknown) => boolean, podeReiniciar: (id: string) => boolean, marcarSaudavel: (id: string) => void}} RuntimeHealth */
/** @typedef {(ms: number) => Promise<void>} Sleep */
/**
 * @typedef {{
 *   supervisor?: RuntimeSupervisor,
 *   health?: RuntimeHealth,
 *   sleep?: Sleep,
 *   baseDelayMs?: number,
 *   maxDelayMs?: number
 * }} RuntimeRestartOptions
 */

/**
 * @param {RuntimeRestartOptions} [options]
 */
export function criarRuntimeRestart(options = {}) {
  const {
    supervisor,
    health,
    sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    baseDelayMs = 100,
    maxDelayMs = 5000,
  } = options;

  if (!supervisor || typeof supervisor.iniciar !== 'function' || typeof supervisor.parar !== 'function') throw new TypeError('supervisor inválido');
  if (!health || typeof health.marcarFalha !== 'function' || typeof health.podeReiniciar !== 'function') throw new TypeError('health inválido');

  const runtimeSupervisor = supervisor;
  const runtimeHealth = health;
  /** @type {Map<string, Promise<{restarted: boolean, attempts?: number, delayMs?: number, reason?: string}>>} */
  const emAndamento = new Map();

  /** @param {string} id @param {unknown} error */
  async function executar(id, error) {
    const permitido = runtimeHealth.marcarFalha(id, error);
    if (!permitido || !runtimeHealth.podeReiniciar(id)) return { restarted: false, reason: 'restart_budget_exhausted' };

    const tentativas = runtimeHealth.estado(id).restarts.length;
    const delay = Math.min(maxDelayMs, baseDelayMs * (2 ** Math.max(0, tentativas - 1)));
    await runtimeSupervisor.parar(id);
    await sleep(delay);
    await runtimeSupervisor.iniciar(id);
    runtimeHealth.marcarSaudavel(id);
    return { restarted: true, delayMs: delay, attempts: tentativas };
  }

  /**
   * A falha pode ser observada por mais de um consumidor. Uma única sequência
   * por módulo impede dois `stop → sleep → start` simultâneos e faz o segundo
   * consumidor observar o mesmo resultado bounded da operação em andamento.
   * @param {string} id @param {unknown} error
   */
  function reiniciar(id, error) {
    const atual = emAndamento.get(id);
    if (atual) return atual;

    const promessa = executar(id, error).finally(() => {
      if (emAndamento.get(id) === promessa) emAndamento.delete(id);
    });
    emAndamento.set(id, promessa);
    return promessa;
  }

  return { reiniciar };
}
