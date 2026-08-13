/** Resolves the impact of a failed module on its direct consumers. */
export function criarRuntimeFailurePolicy(registry) {
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');

  function dependentsOf(id) {
    return registry.listar()
      .filter(entry => (entry.dependsOn ?? []).includes(id))
      .map(entry => entry.id)
      .sort();
  }

  function impacto(id) {
    const affected = new Set();
    const queue = [id];
    while (queue.length) {
      const current = queue.shift();
      for (const dependent of dependentsOf(current)) {
        if (!affected.has(dependent)) {
          affected.add(dependent);
          queue.push(dependent);
        }
      }
    }
    return [...affected];
  }

  return { dependentsOf, impacto };
}
