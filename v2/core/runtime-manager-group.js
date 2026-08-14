/** Coordinates multiple Runtime-managed modules using dependency-safe parallel batches. */

/** @typedef {{start: (id: string) => Promise<unknown>, stop: (id: string) => Promise<unknown>}} RuntimeGroupManager */
/** @typedef {{listar: () => ReadonlyArray<{id: string}>}} RuntimeGroupRegistry */
/** @typedef {{order: () => ReadonlyArray<string>}} RuntimeDependencies */
/** @typedef {{batches: () => ReadonlyArray<ReadonlyArray<string>>}} RuntimeBatches */
/** @typedef {{groupBatchStarted?: (index: number, batch: ReadonlyArray<string>) => void, groupBatchReady?: (index: number, batch: ReadonlyArray<string>) => void, groupStartupFailed?: (error: unknown) => void, groupRollback?: (ids: ReadonlyArray<string>) => void, groupBatchStopped?: (index: number, ids: ReadonlyArray<string>) => void, groupShutdownFailed?: (errors: ReadonlyArray<{id: string, error: unknown}>) => void}} RuntimeGroupEvents */
/** @typedef {(id: string) => Promise<unknown>} RuntimeReadinessWait */
/** @typedef {{manager: RuntimeGroupManager, registry: RuntimeGroupRegistry, dependencies: RuntimeDependencies, batches: RuntimeBatches, readinessWait?: RuntimeReadinessWait, events?: RuntimeGroupEvents}} RuntimeManagerGroupOptions */
/** @typedef {{startAll: () => Promise<string[]>, stopAll: () => Promise<void>}} RuntimeManagerGroup */

/** @param {Partial<RuntimeManagerGroupOptions>} [options] @returns {RuntimeManagerGroup} */
export function criarRuntimeManagerGroup(options = {}) {
  const { manager, registry, dependencies, batches, readinessWait, events } = options;
  if (!manager || typeof manager.start !== 'function' || typeof manager.stop !== 'function') throw new TypeError('manager inválido');
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');
  if (!dependencies || typeof dependencies.order !== 'function') throw new TypeError('dependencies inválido');
  if (!batches || typeof batches.batches !== 'function') throw new TypeError('batches inválidos');
  if (readinessWait && typeof readinessWait !== 'function') throw new TypeError('readinessWait inválido');
  if (events && typeof events !== 'object') throw new TypeError('events inválido');

  const runtimeManager = manager;
  const runtimeBatches = batches;
  const runtimeReadinessWait = readinessWait;
  const runtimeEvents = events;

  async function startAll() {
    const started = [];
    try {
      for (const [index, batch] of runtimeBatches.batches().entries()) {
        runtimeEvents?.groupBatchStarted?.(index, batch);
        const results = await Promise.allSettled(batch.map(id => runtimeManager.start(id)));
        const failure = results.find((result) => result.status === 'rejected');
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          if (result.status === 'fulfilled') started.push(batch[i]);
        }
        if (failure?.status === 'rejected') throw failure.reason;
        if (runtimeReadinessWait) await Promise.all(batch.map(id => runtimeReadinessWait(id)));
        runtimeEvents?.groupBatchReady?.(index, batch);
      }
      return started;
    } catch (error) {
      runtimeEvents?.groupStartupFailed?.(error);
      const rollback = [...started].reverse();
      for (const id of rollback) {
        try { await runtimeManager.stop(id); } catch { /* original startup/readiness error wins */ }
      }
      if (rollback.length) runtimeEvents?.groupRollback?.(rollback);
      throw error;
    }
  }

  async function stopAll() {
    const errors = [];
    const batchesInReverse = [...runtimeBatches.batches()].reverse();
    for (let reverseIndex = 0; reverseIndex < batchesInReverse.length; reverseIndex++) {
      const batch = batchesInReverse[reverseIndex];
      const index = batchesInReverse.length - reverseIndex - 1;
      const ids = [...batch].reverse();
      const results = await Promise.allSettled(ids.map(id => runtimeManager.stop(id)));
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'rejected') errors.push({ id: ids[i], error: result.reason });
      }
      runtimeEvents?.groupBatchStopped?.(index, ids);
    }
    if (errors.length) {
      runtimeEvents?.groupShutdownFailed?.(errors);
      const aggregate = new AggregateError(errors.map(item => item.error), 'Falha ao encerrar um ou mais módulos');
      Object.defineProperty(aggregate, 'details', { value: errors, enumerable: true });
      throw aggregate;
    }
  }

  return { startAll, stopAll };
}
