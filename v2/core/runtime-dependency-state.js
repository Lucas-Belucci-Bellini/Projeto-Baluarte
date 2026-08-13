/**
 * @typedef {{id: string, required: boolean, failure: 'stop'|'degrade'|'ignore'}} RuntimeDependency
 * @typedef {{spec: (id: string) => RuntimeDependency[]}} RuntimeDependencySpec
 * @typedef {'ready'|'blocked'|'degraded'|string} RuntimeModuleState
 */

/** Computes the effective state of a module from its own state and dependency states. */
export function criarRuntimeDependencyState(/** @type {{spec?: RuntimeDependencySpec}} */ { spec } = {}) {
  if (!spec || typeof spec.spec !== 'function') throw new TypeError('spec inválido');

  /** @param {string} id @param {RuntimeModuleState} selfState @param {Map<string, RuntimeModuleState>} dependencyStates */
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
