/** Computes the effective state of a module from its own state and dependency states. */
export function criarRuntimeDependencyState({ spec } = {}) {
  if (!spec || typeof spec.spec !== 'function') throw new TypeError('spec inválido');

  function state(id, selfState, dependencyStates = new Map()) {
    const dependencies = spec.spec(id);
    const affected = dependencies.filter(dependency => {
      const dependencyState = dependencyStates.get(dependency.id);
      return dependencyState && dependencyState !== 'ready';
    });

    if (!affected.length) return selfState;
    if (affected.some(dependency => dependency.failure === 'stop')) return 'blocked';
    if (affected.some(dependency => dependency.failure === 'degrade')) return 'degraded';
    return selfState;
  }

  return { state };
}
