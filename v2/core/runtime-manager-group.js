/** Coordinates multiple Runtime-managed modules using dependency order. */
export function criarRuntimeManagerGroup({ manager, registry, dependencies } = {}) {
  if (!manager || typeof manager.start !== 'function' || typeof manager.stop !== 'function') throw new TypeError('manager inválido');
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');
  if (!dependencies || typeof dependencies.order !== 'function') throw new TypeError('dependencies inválido');

  async function startAll() {
    const started = [];
    try {
      for (const id of dependencies.order()) {
        await manager.start(id);
        started.push(id);
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
    for (const id of [...dependencies.order()].reverse()) {
      try { await manager.stop(id); } catch (error) { errors.push({ id, error }); }
    }
    if (errors.length) {
      const aggregate = new AggregateError(errors.map(item => item.error), 'Falha ao encerrar um ou mais módulos');
      aggregate.details = errors;
      throw aggregate;
    }
  }

  return { startAll, stopAll };
}
