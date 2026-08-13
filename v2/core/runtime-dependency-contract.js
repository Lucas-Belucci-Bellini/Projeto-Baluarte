/** Validates dependency specifications against the registered module graph. */
export function validarRuntimeDependencyContract({ registry, spec } = {}) {
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');
  if (!spec || typeof spec.spec !== 'function') throw new TypeError('spec inválido');

  const entries = registry.listar();
  const ids = new Set(entries.map(entry => entry.id));
  const errors = [];
  for (const entry of entries) {
    let dependencies;
    try { dependencies = spec.spec(entry.id); } catch (error) { errors.push({ module: entry.id, message: error.message }); continue; }
    for (const dependency of dependencies) {
      if (!ids.has(dependency.id)) errors.push({ module: entry.id, dependency: dependency.id, message: 'Dependência inexistente' });
      if (dependency.id === entry.id) errors.push({ module: entry.id, dependency: dependency.id, message: 'Auto-dependência não permitida' });
    }
  }
  if (errors.length) {
    const error = new Error('Contrato de dependências inválido');
    error.details = errors;
    throw error;
  }
  return true;
}
