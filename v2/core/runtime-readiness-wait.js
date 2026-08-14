/** Waits for a module to become ready without polling more often than configured. */

/** @typedef {{ready: (id: string) => boolean}} RuntimeReadiness */
/** @typedef {(ms: number) => Promise<void>} RuntimeSleep */
/** @typedef {() => number} RuntimeClock */
/** @typedef {{readiness: RuntimeReadiness, id: string, timeoutMs?: number, intervalMs?: number, sleep?: RuntimeSleep, now?: RuntimeClock}} RuntimeReadinessWaitOptions */
/** @typedef {{id: string, elapsedMs: number}} RuntimeReadinessResult */

/** @param {Partial<RuntimeReadinessWaitOptions>} [options] @returns {Promise<RuntimeReadinessResult>} */
export async function esperarRuntimeReady(options = {}) {
  const { readiness, id, timeoutMs = 5000, intervalMs = 25, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), now = () => Date.now() } = options;
  if (!readiness || typeof readiness.ready !== 'function') throw new TypeError('readiness inválido');
  if (!id) throw new TypeError('id inválido');
  if (!Number.isFinite(timeoutMs) || timeoutMs < 0) throw new RangeError('timeoutMs inválido');
  if (!Number.isFinite(intervalMs) || intervalMs <= 0) throw new RangeError('intervalMs inválido');
  if (typeof sleep !== 'function') throw new TypeError('sleep inválido');
  if (typeof now !== 'function') throw new TypeError('now inválido');

  const runtimeReadiness = readiness;
  const runtimeSleep = sleep;
  const runtimeNow = now;
  const startedAt = runtimeNow();
  while (true) {
    if (runtimeReadiness.ready(id)) return { id, elapsedMs: Math.max(0, runtimeNow() - startedAt) };
    const elapsed = runtimeNow() - startedAt;
    if (elapsed >= timeoutMs) throw new Error(`Timeout aguardando readiness: ${id}`);
    await runtimeSleep(Math.min(intervalMs, timeoutMs - elapsed));
  }
}
