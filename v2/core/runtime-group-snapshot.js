/** Immutable point-in-time snapshot of the Runtime group. */

/** @typedef {{listar: () => ReadonlyArray<{id: string}>}} RuntimeSnapshotRegistry */
/** @typedef {(id: string) => unknown} RuntimeSnapshotStateOf */
/** @typedef {() => number} RuntimeSnapshotClock */
/** @typedef {{registry: RuntimeSnapshotRegistry, stateOf: RuntimeSnapshotStateOf, now?: RuntimeSnapshotClock}} RuntimeGroupSnapshotOptions */
/** @typedef {{snapshot: () => Readonly<{capturedAt: number, modules: ReadonlyArray<Readonly<{id: string, state: unknown}>>}>}} RuntimeGroupSnapshot */

/** @param {Partial<RuntimeGroupSnapshotOptions>} [options] @returns {RuntimeGroupSnapshot} */
export function criarRuntimeGroupSnapshot(options = {}) {
  const { registry, stateOf, now = () => Date.now() } = options;
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');
  if (typeof stateOf !== 'function') throw new TypeError('stateOf inválido');
  if (typeof now !== 'function') throw new TypeError('now inválido');
  const runtimeRegistry = registry;
  const runtimeStateOf = stateOf;
  const runtimeNow = now;

  function snapshot() {
    const modules = runtimeRegistry.listar().map(entry => ({ id: entry.id, state: runtimeStateOf(entry.id) }));
    const frozenModules = modules.map((module) => Object.freeze(module));
    return Object.freeze({
      capturedAt: runtimeNow(),
      modules: Object.freeze(frozenModules),
    });
  }

  return Object.freeze({ snapshot });
}
