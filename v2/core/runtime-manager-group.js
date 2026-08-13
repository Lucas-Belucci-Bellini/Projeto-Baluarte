/** Coordinates multiple Runtime-managed modules using dependency-safe parallel batches. */
export function criarRuntimeManagerGroup({ manager, registry, dependencies, batches, readinessWait, events } = {}) {
  if (!manager || typeof manager.start !== 'function' || typeof manager.stop !== 'function') throw new TypeError('manager inválido');
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');
  if (!dependencies || typeof dependencies.order !== 'function') throw new TypeError('dependencies inválido');
  if (!batches || typeof batches.batches !== 'function') throw new TypeError('batches inválidos');
  if (readinessWait && typeof readinessWait !== 'function') throw new TypeError('readinessWait inválido');
  if (events && typeof events !== 'object') throw new TypeError('events inválido');

  async function startAll() {
    const started = [];
    try {
      for (const [index, batch] of batches.batches().entries()) {
        events?.groupBatchStarted?.(index, batch);
        const results = await Promise.allSettled(batch.map(id => manager.start(id)));
        const failure = results.find(result => result.status === 'rejected');
        for (let i = 0; i < results.length; i++) {
          if (results[i].status === 'fulfilled') started.push(batch[i]);
        }
        if (failure) throw failure.reason;
        if (readinessWait) await Promise.all(batch.map(id => readinessWait(id)));
        events?.groupBatchReady?.(index, batch);
      }
      return started;
    } catch (error) {
      events?.groupStartupFailed?.(error);
      const rollback = [...started].reverse();
      for (const id of rollback) {
        try { await manager.stop(id); } catch { /* original startup/readiness error wins */ }
      }
      if (rollback.length) events?.groupRollback?.(rollback);
      throw error;
    }
  }

  async function stopAll() {
    const errors = [];
    const batchesInReverse = [...batches.batches()].reverse();
    for (let reverseIndex = 0; reverseIndex < batchesInReverse.length; reverseIndex++) {
      const batch = batchesInReverse[reverseIndex];
      const index = batchesInReverse.length - reverseIndex - 1;
      const ids = [...batch].reverse();
      const results = await Promise.allSettled(ids.map(id => manager.stop(id)));
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === 'rejected') errors.push({ id: ids[i], error: results[i].reason });
      }
      events?.groupBatchStopped?.(index, ids);
    }
    if (errors.length) {
      events?.groupShutdownFailed?.(errors);
      const aggregate = new AggregateError(errors.map(item => item.error), 'Falha ao encerrar um ou mais módulos');
      aggregate.details = errors;
      throw aggregate;
    }
  }

  return { startAll, stopAll };
}
