/** Immutable point-in-time snapshot of the Runtime group. */
export function criarRuntimeGroupSnapshot({ registry, stateOf, now = () => Date.now() } = {}) {
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');
  if (typeof stateOf !== 'function') throw new TypeError('stateOf inválido');

  function snapshot() {
    const modules = registry.listar().map(entry => ({ id: entry.id, state: stateOf(entry.id) }));
    return Object.freeze({
      capturedAt: now(),
      modules: Object.freeze(modules.map(Object.freeze)),
    });
  }

  return { snapshot };
}
