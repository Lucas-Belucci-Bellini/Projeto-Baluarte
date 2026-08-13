/** Coordinates multiple Runtime-managed modules using dependency-safe parallel batches. */
export function criarRuntimeManagerGroup({ manager, registry, dependencies, batches } = {}) {
  if (!manager || typeof manager.start !== 'function' || typeof manager.stop !== 'function') throw new TypeError('manager inválido');
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');
  if (!dependencies || typeof dependencies.order !== 'function') throw new TypeError('dependencies inválido');
  if (!batches || typeof batches.batches !== 'function') throw new TypeError('batches inválido');

  async function startAll() {
    const started = [];
    try {
      for (const batch of batches.batches()) {
        const results = await Promise.allSettled(batch.map(id => manager.start(id)));
        const failure = results.find(result => result.status === 'rejected');
        for (let i = 0; i < results.length; i++) {
          if (results[i].status === 'fulfilled') started.push(batch[i]);
        }
        if (failure) throw failure.reason;
      }
      return started;
    } catch (error) {
      for (const id of [...started].reverse()) {
        try { await manager.stop(id); } catch { /* original startup error wins */ }
      }
      throw error;
    }
  }

  async function stopAll() {
    const errors = [];
    for (const batch of [...batches.batches()].reverse()) {
      const results = await Promise.allSettled([...batch].reverse().map(id => manager.stop(id)));
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === 'rejected') errors.push({ id: [...batch].reverse()[i], error: results[i].reason });
      }
    }
    if (errors.length) {
      const aggregate = new AggregateError(errors.map(item => item.error), 'Falha ao encerrar um ou mais módulos');
      aggregate.details = errors;
      throw aggregate;
    }
  }

  return { startAll, stopAll };
}
