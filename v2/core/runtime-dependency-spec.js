/** Normalizes dependency declarations without applying recovery policy. */
export function criarRuntimeDependencySpec(registry) {
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');

  function spec(id) {
    const entry = registry.obter?.(id) ?? registry.listar().find(item => item.id === id);
    if (!entry) throw new Error(`Módulo inexistente: ${id}`);
    return (entry.dependsOn ?? []).map(dependency => {
      if (typeof dependency === 'string') return { id: dependency, required: true, failure: 'stop' };
      if (!dependency || typeof dependency.id !== 'string') throw new Error(`Dependência inválida em ${id}`);
      const failure = dependency.failure ?? (dependency.required === false ? 'degrade' : 'stop');
      if (!['stop', 'degrade', 'ignore'].includes(failure)) throw new Error(`Política de falha inválida: ${failure}`);
      return { id: dependency.id, required: dependency.required !== false, failure };
    });
  }

  return { spec };
}
