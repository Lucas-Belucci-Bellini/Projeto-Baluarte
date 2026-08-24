/** Unified facade for module Runtime supervision. */

/** @typedef {{iniciar: (id: string) => Promise<unknown>, parar: (id: string) => Promise<unknown>, estado: (id: string) => string}} RuntimeManagerSupervisor */
/** @typedef {{reiniciar: (id: string, error: unknown) => Promise<{restarted: boolean, attempts?: number, delayMs?: number, reason?: string}>}} RuntimeManagerRestart */
/** @typedef {{estado: (id: string) => unknown, marcarSaudavel?: (id: string) => void}} RuntimeManagerHealth */
/** @typedef {{started?: (id: string) => void, stopped?: (id: string) => void, failed?: (id: string, error: unknown) => void, restarting?: (id: string, attempts: number, delayMs: number) => void, exhausted?: (id: string) => void}} RuntimeManagerEvents */
/** @typedef {{id: string, lifecycle: string, health: unknown}} RuntimeManagerStatus */
/** @typedef {{supervisor: RuntimeManagerSupervisor, restart: RuntimeManagerRestart, health: RuntimeManagerHealth, events?: RuntimeManagerEvents}} RuntimeManagerOptions */
/* O retorno de `restart` estava declarado como `RuntimeManagerStatus & {...}`,
 * ou seja, `id`/`lifecycle`/`health` no topo. O código nunca devolveu isso: ele
 * devolve o status ANINHADO em `status` (ver `restartModule`). Corrigido o
 * typedef, não o código — nenhum consumidor lia os campos planos, e mudar o
 * formato de retorno para casar com um contrato que nunca valeu seria trocar
 * uma mentira de documentação por uma quebra de comportamento. */
/** @typedef {{start: (id: string) => Promise<RuntimeManagerStatus>, stop: (id: string) => Promise<RuntimeManagerStatus>, restart: (id: string, error?: Error) => Promise<{restarted: boolean, attempts?: number, delayMs?: number, reason?: string, status: RuntimeManagerStatus}>, status: (id: string) => RuntimeManagerStatus}} RuntimeManager */

/** @param {Partial<RuntimeManagerOptions>} [options] @returns {RuntimeManager} */
export function criarRuntimeManager(options = {}) {
  const { supervisor, restart, health, events } = options;
  if (!supervisor || typeof supervisor.iniciar !== 'function' || typeof supervisor.parar !== 'function' || typeof supervisor.estado !== 'function') throw new TypeError('supervisor inválido');
  if (!restart || typeof restart.reiniciar !== 'function') throw new TypeError('restart inválido');
  if (!health || typeof health.estado !== 'function') throw new TypeError('health inválido');

  /* Ver `runtime-supervisor.js`: o estreitamento das guardas não atravessa a
   * fronteira das funções declaradas abaixo. */
  const supervisao = supervisor;
  const reinicio = restart;
  const saude = health;

  /** @param {string} id @returns {Promise<RuntimeManagerStatus>} */
  async function start(id) {
    await supervisao.iniciar(id);
    saude.marcarSaudavel?.(id);
    events?.started?.(id);
    return status(id);
  }

  /** @param {string} id @returns {Promise<RuntimeManagerStatus>} */
  async function stop(id) {
    await supervisao.parar(id);
    events?.stopped?.(id);
    return status(id);
  }

  /** @param {string} id @param {Error} [error] */
  async function restartModule(id, error = new Error('restart requested')) {
    events?.failed?.(id, error);
    const result = await reinicio.reiniciar(id, error);
    if (result.restarted) events?.restarting?.(id, result.attempts ?? 0, result.delayMs ?? 0);
    else events?.exhausted?.(id);
    return { ...result, status: status(id) };
  }

  /** @param {string} id @returns {RuntimeManagerStatus} */
  function status(id) {
    return { id, lifecycle: supervisao.estado(id), health: saude.estado(id) };
  }

  return { start, stop, restart: restartModule, status };
}
