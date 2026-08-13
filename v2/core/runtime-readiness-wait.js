/** Waits for a module to become ready without polling more often than configured. */
export async function esperarRuntimeReady({ readiness, id, timeoutMs = 5000, intervalMs = 25, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), now = () => Date.now() } = {}) {
  if (!readiness || typeof readiness.ready !== 'function') throw new TypeError('readiness inválido');
  if (!id) throw new TypeError('id inválido');
  if (!Number.isFinite(timeoutMs) || timeoutMs < 0) throw new RangeError('timeoutMs inválido');
  if (!Number.isFinite(intervalMs) || intervalMs <= 0) throw new RangeError('intervalMs inválido');

  const startedAt = now();
  while (true) {
    if (readiness.ready(id)) return { id, elapsedMs: Math.max(0, now() - startedAt) };
    const elapsed = now() - startedAt;
    if (elapsed >= timeoutMs) throw new Error(`Timeout aguardando readiness: ${id}`);
    await sleep(Math.min(intervalMs, timeoutMs - elapsed));
  }
}
