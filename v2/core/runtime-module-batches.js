/** Groups independent modules into dependency-safe startup batches. */

/** @typedef {{id: string, dependsOn?: string[]}} RuntimeBatchEntry */
/** @typedef {{listar: () => RuntimeBatchEntry[]}} RuntimeBatchRegistry */

/**
 * @param {RuntimeBatchRegistry} registry
 */
export function criarRuntimeDependencyBatches(registry) {
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');

  function batches() {
    const entries = registry.listar();
    const ids = new Set(entries.map((/** @type {RuntimeBatchEntry} */ e) => e.id));
    const deps = new Map(entries.map((/** @type {RuntimeBatchEntry} */ e) => [e.id, new Set(e.dependsOn ?? [])]));
    for (const [id, requirements] of deps) {
      for (const dependency of requirements) {
        if (!ids.has(dependency)) throw new Error(`Dependência inexistente: ${id} -> ${dependency}`);
        if (dependency === id) throw new Error(`Dependência circular: ${id} -> ${dependency}`);
      }
    }

    const remaining = new Map([...deps].map(([id, requirements]) => [id, new Set(requirements)]));
    const result = [];
    while (remaining.size) {
      const ready = [...remaining.entries()]
        .filter(([, requirements]) => requirements.size === 0)
        .map(([id]) => id);
      if (!ready.length) throw new Error('Dependência circular: não foi possível encontrar um módulo pronto');
      ready.sort();
      result.push(ready);
      for (const id of ready) remaining.delete(id);
      for (const requirements of remaining.values()) for (const id of ready) requirements.delete(id);
    }
    return result;
  }

  return { batches };
}
