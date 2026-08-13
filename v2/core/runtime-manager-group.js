/** Coordinates multiple Runtime-managed modules using dependency-safe parallel batches. */
import { criarRuntimeDependencyGraph } from './runtime-module-dependencies.js';
import { criarRuntimeDependencyBatches } from './runtime-module-batches.js';

/** @typedef {{start: (id: string) => Promise<void>, stop: (id: string) => Promise<void>}} RuntimeManager */
/** @typedef {{listar: () => Array<{id: string, dependsOn?: string[]}>}} RuntimeModuleRegistry */
/** @typedef {{order: () => string[]}} RuntimeDependencyGraph */
/** @typedef {{batches: () => string[][]}} RuntimeDependencyBatches */
/** @typedef {{
 * manager: RuntimeManager,
 * registry: RuntimeModuleRegistry,
 * dependencies?: RuntimeDependencyGraph,
 * batches?: RuntimeDependencyBatches,
 * readinessWait?: (id: string) => Promise<void>
 * }} RuntimeManagerGroupOptions */

/**
 * @param {Partial<RuntimeManagerGroupOptions>} [options={}]
 */
export function criarRuntimeManagerGroup(options = {}) {
  const { manager, registry, dependencies, batches, readinessWait } = options;
  if (!manager || typeof manager.start !== 'function' || typeof manager.stop !== 'function') throw new TypeError('manager inválido');
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');
  const runtimeManager = /** @type {RuntimeManager} */ (manager);

  const dependencyGraph = dependencies ?? criarRuntimeDependencyGraph(registry);
  if (typeof dependencyGraph.order !== 'function') throw new TypeError('dependencies inválido');

  const dependencyBatches = batches ?? (dependencies
    ? { batches: () => dependencyGraph.order().map((id) => [id]) }
    : criarRuntimeDependencyBatches(registry));
  if (typeof dependencyBatches.batches !== 'function') throw new TypeError('batches inválido');
  if (readinessWait && typeof readinessWait !== 'function') throw new TypeError('readinessWait inválido');

  async function startAll() {
    const started = [];
    try {
      for (const batch of dependencyBatches.batches()) {
        const results = await Promise.allSettled(batch.map((id) => runtimeManager.start(id)));
        const failure = results.find((result) => result.status === 'rejected');
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          if (result.status === 'fulfilled') started.push(batch[i]);
        }
        if (failure?.status === 'rejected') throw failure.reason;
        if (readinessWait) await Promise.all(batch.map((id) => readinessWait(id)));
      }
      return started;
    } catch (error) {
      for (const id of [...started].reverse()) {
        try { await runtimeManager.stop(id); } catch { /* original startup/readiness error wins */ }
      }
      throw error;
    }
  }

  async function stopAll() {
    const errors = [];
    for (const batch of [...dependencyBatches.batches()].reverse()) {
      const ids = [...batch].reverse();
      const results = await Promise.allSettled(ids.map((id) => runtimeManager.stop(id)));
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'rejected') errors.push({ id: ids[i], error: result.reason });
      }
    }
    if (errors.length) {
      const aggregate = /** @type {AggregateError & {details: Array<{id: string, error: unknown}>}} */ (
        new AggregateError(errors.map((item) => item.error), 'Falha ao encerrar um ou mais módulos')
      );
      aggregate.details = errors;
      throw aggregate;
    }
  }

  return { startAll, stopAll };
}
