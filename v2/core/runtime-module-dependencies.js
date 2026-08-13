/** Dependency graph and deterministic topological startup order. */
export function criarRuntimeDependencyGraph(registry) {
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');

  function order() {
    const entries = registry.listar();
    const ids = new Set(entries.map(e => e.id));
    const deps = new Map(entries.map(e => [e.id, new Set(e.dependsOn ?? [])]));

    for (const [id, requirements] of deps) {
      for (const dependency of requirements) {
        if (!ids.has(dependency)) throw new Error(`Dependência inexistente: ${id} -> ${dependency}`);
        if (dependency === id) throw new Error(`Dependência circular: ${id} -> ${dependency}`);
      }
    }

    const result = [];
    const temporary = new Set();
    const permanent = new Set();

    function visit(id) {
      if (permanent.has(id)) return;
      if (temporary.has(id)) throw new Error(`Dependência circular envolvendo: ${id}`);
      temporary.add(id);
      for (const dependency of deps.get(id)) visit(dependency);
      temporary.delete(id);
      permanent.add(id);
      result.push(id);
    }

    for (const entry of entries) visit(entry.id);
    return result;
  }

  return { order };
}
