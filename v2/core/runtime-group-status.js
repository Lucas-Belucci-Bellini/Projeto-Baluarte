/** Tracks the collective lifecycle status without owning module state. */
export function criarRuntimeGroupStatus({ batches, states = new Map() } = {}) {
  if (!batches || typeof batches.batches !== 'function') throw new TypeError('batches inválidos');

  function snapshot() {
    const modules = batches.batches().flat().map(id => ({ id, state: states.get(id) ?? 'created' }));
    const values = modules.map(module => module.state);
    let group = 'created';
    if (values.some(state => state === 'failed')) group = 'failed';
    else if (values.some(state => state === 'blocked')) group = 'blocked';
    else if (values.some(state => state === 'degraded')) group = 'degraded';
    else if (values.length && values.every(state => state === 'stopped')) group = 'stopped';
    else if (values.length && values.every(state => state === 'ready')) group = 'ready';
    else if (values.some(state => state === 'starting')) group = 'starting';
    return Object.freeze({ group, modules });
  }

  return { snapshot };
}
