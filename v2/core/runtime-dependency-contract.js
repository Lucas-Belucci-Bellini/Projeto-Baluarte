/**
 * @typedef {{id: string, dependsOn?: (string | {id: string, required?: boolean, failure?: 'stop'|'degrade'|'ignore'})[]}} RuntimeDependencyEntry
 * @typedef {{listar: () => RuntimeDependencyEntry[], obter?: (id: string) => RuntimeDependencyEntry | undefined}} RuntimeDependencyRegistry
 * @typedef {{id: string, required: boolean, failure: 'stop'|'degrade'|'ignore'}} RuntimeDependency
 * @typedef {{spec: (id: string) => RuntimeDependency[]}} RuntimeDependencySpec
 * @typedef {Error & {details?: unknown[]}} RuntimeDependencyContractError
 */

/** Validates dependency specifications against the registered module graph. */
export function validarRuntimeDependencyContract(/** @type {Partial<{registry: RuntimeDependencyRegistry, spec: RuntimeDependencySpec}>} */ { registry, spec } = {}) {
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');
  if (!spec || typeof spec.spec !== 'function') throw new TypeError('spec inválido');
  const entries = registry.listar();
  const ids = new Set(entries.map(entry => entry.id));
  const graph = new Map();
  const errors = [];
  for (const entry of entries) {
    let dependencies;
    try { dependencies = spec.spec(entry.id); } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ module: entry.id, message });
      continue;
    }
    graph.set(entry.id, dependencies.map(dependency => dependency.id));
    for (const dependency of dependencies) {
      if (!ids.has(dependency.id)) errors.push({ module: entry.id, dependency: dependency.id, message: 'Dependência inexistente' });
      if (dependency.id === entry.id) errors.push({ module: entry.id, dependency: dependency.id, message: 'Auto-dependência não permitida' });
    }
  }
  const temporary = new Set();
  const permanent = new Set();
  /** @param {string} id @param {string[]} path */
  function visit(id, path = []) {
    if (permanent.has(id)) return;
    if (temporary.has(id)) { errors.push({ module: id, message: `Ciclo de dependências: ${[...path, id].join(' -> ')}` }); return; }
    temporary.add(id);
    for (const dependency of graph.get(id) ?? []) if (ids.has(dependency)) visit(dependency, [...path, id]);
    temporary.delete(id);
    permanent.add(id);
  }
  for (const id of graph.keys()) visit(id);
  if (errors.length) {
    /** @type {RuntimeDependencyContractError} */
    const error = new Error('Contrato de dependências inválido');
    error.details = errors;
    throw error;
  }
  return true;
}
