/** Dependency graph and deterministic topological startup order. */

/** @typedef {{id: string, dependsOn?: string[]}} RuntimeDependencyEntry */
/** @typedef {{listar: () => ReadonlyArray<RuntimeDependencyEntry>}} RuntimeDependencyRegistry */
/** @typedef {{order: () => ReadonlyArray<string>}} RuntimeDependencyGraph */

/** @param {RuntimeDependencyRegistry} registry @returns {RuntimeDependencyGraph} */
export function criarRuntimeDependencyGraph(registry) {
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');

  function order() {
    const entries = registry.listar();
    const ids = new Set(entries.map(entry => entry.id));
    const deps = new Map(entries.map(entry => [entry.id, new Set(entry.dependsOn ?? [])]));

    for (const [id, requirements] of deps) {
      for (const dependency of requirements) {
        if (!ids.has(dependency)) throw new Error(`Dependência inexistente: ${id} -> ${dependency}`);
        if (dependency === id) throw new Error(`Dependência circular: ${id} -> ${dependency}`);
      }
    }

    /** @type {string[]} */
    const result = [];
    const temporary = new Set();
    const permanent = new Set();

    /** @param {string} id */
    function visit(id) {
      if (permanent.has(id)) return;
      if (temporary.has(id)) throw new Error(`Dependência circular envolvendo: ${id}`);
      temporary.add(id);
      for (const dependency of deps.get(id) ?? []) visit(dependency);
      temporary.delete(id);
      permanent.add(id);
      result.push(id);
    }

    for (const entry of entries) visit(entry.id);
    return result;
  }

  return { order };
}
