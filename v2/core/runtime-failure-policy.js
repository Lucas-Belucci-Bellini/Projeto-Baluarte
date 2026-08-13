/**
 * @typedef {{id: string, dependsOn?: (string | {id: string})[]}} RuntimeFailureEntry
 * @typedef {{listar: () => RuntimeFailureEntry[]}} RuntimeFailureRegistry
 */

/** Resolves the impact of a failed module on its direct consumers. */
export function criarRuntimeFailurePolicy(/** @type {RuntimeFailureRegistry} */ registry) {
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');

  /** @param {string} id @returns {string[]} */
  function dependentsOf(id) {
    return registry.listar()
      .filter(entry => (entry.dependsOn ?? []).some(dependency => typeof dependency === 'string' ? dependency === id : dependency.id === id))
      .map(entry => entry.id)
      .sort();
  }

  /** @param {string} id @returns {string[]} */
  function impacto(id) {
    const affected = new Set();
    const queue = [id];
    while (queue.length) {
      const current = queue.shift();
      if (current === undefined) break;
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
