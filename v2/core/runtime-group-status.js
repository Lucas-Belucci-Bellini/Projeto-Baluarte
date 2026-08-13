/** Tracks the collective lifecycle status without owning module state. */

/** @typedef {{batches: () => ReadonlyArray<ReadonlyArray<string>>}} RuntimeStatusBatches */
/** @typedef {'created'|'starting'|'ready'|'degraded'|'blocked'|'stopped'|'failed'} RuntimeGroupState */
/** @typedef {Map<string, RuntimeGroupState>} RuntimeStateMap */
/**
 * @typedef {{
 *   batches: RuntimeStatusBatches,
 *   states?: RuntimeStateMap
 * }} RuntimeGroupStatusOptions
 */
/**
 * @typedef {{
 *   snapshot: () => Readonly<{group: RuntimeGroupState, modules: ReadonlyArray<Readonly<{id: string, state: RuntimeGroupState}>>}>
 * }} RuntimeGroupStatus
 */

/** @param {RuntimeGroupStatusOptions} [options] @returns {RuntimeGroupStatus} */
export function criarRuntimeGroupStatus(options = {}) {
  const { batches, states = new Map() } = options;
  if (!batches || typeof batches.batches !== 'function') throw new TypeError('batches inválidos');

  /** @returns {Readonly<{group: RuntimeGroupState, modules: ReadonlyArray<Readonly<{id: string, state: RuntimeGroupState}>>}>} */
  function snapshot() {
    const modules = batches.batches().flat().map(id => ({ id, state: states.get(id) ?? 'created' }));
    const values = modules.map(module => module.state);
    let group = /** @type {RuntimeGroupState} */ ('created');
    if (values.some(state => state === 'failed')) group = 'failed';
    else if (values.some(state => state === 'blocked')) group = 'blocked';
    else if (values.some(state => state === 'degraded')) group = 'degraded';
    else if (values.length && values.every(state => state === 'stopped')) group = 'stopped';
    else if (values.length && values.every(state => state === 'ready')) group = 'ready';
    else if (values.some(state => state === 'starting')) group = 'starting';
    return Object.freeze({ group, modules: Object.freeze(modules.map(Object.freeze)) });
  }

  return Object.freeze({ snapshot });
}
