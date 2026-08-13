/** Coordinates multiple Runtime-managed modules and ordered shutdown. */
export function criarRuntimeManagerGroup({ manager, registry } = {}) {
  if (!manager || typeof manager.start !== 'function' || typeof manager.stop !== 'function') throw new TypeError('manager inválido');
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');

  async function startAll() {
    const started = [];
    try {
      for (const entry of registry.listar()) {
        await manager.start(entry.id);
        started.push(entry.id);
      }
      return started;
    } catch (error) {
      for (const id of [...started].reverse()) {
        try { await manager.stop(id); } catch { /* cleanup best-effort; original error wins */ }
      }
      throw error;
    }
  }

  async function stopAll() {
    const errors = [];
    for (const entry of [...registry.listar()].reverse()) {
      try { await manager.stop(entry.id); } catch (error) { errors.push({ id: entry.id, error }); }
    }
    if (errors.length) {
      const aggregate = new AggregateError(errors.map(item => item.error), 'Falha ao encerrar um ou mais módulos');
      aggregate.details = errors;
      throw aggregate;
    }
  }

  return { startAll, stopAll };
}
