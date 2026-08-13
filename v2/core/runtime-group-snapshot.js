/** Immutable point-in-time snapshot of the Runtime group. */

/** @typedef {{listar: () => ReadonlyArray<{id: string}>}} RuntimeSnapshotRegistry */
/** @typedef {(id: string) => unknown} RuntimeSnapshotStateOf */
/** @typedef {() => number} RuntimeSnapshotClock */
/**
 * @typedef {{
 *   registry: RuntimeSnapshotRegistry,
 *   stateOf: RuntimeSnapshotStateOf,
 *   now?: RuntimeSnapshotClock
 * }} RuntimeGroupSnapshotOptions
 */
/** @typedef {{snapshot: () => Readonly<{capturedAt: number, modules: ReadonlyArray<Readonly<{id: string, state: unknown}>>}>}} RuntimeGroupSnapshot */

/** @param {RuntimeGroupSnapshotOptions} [options] @returns {RuntimeGroupSnapshot} */
export function criarRuntimeGroupSnapshot(options = {}) {
  const { registry, stateOf, now = () => Date.now() } = options;
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');
  if (typeof stateOf !== 'function') throw new TypeError('stateOf inválido');
  if (typeof now !== 'function') throw new TypeError('now inválido');

  function snapshot() {
    const modules = registry.listar().map(entry => ({ id: entry.id, state: stateOf(entry.id) }));
    return Object.freeze({
      capturedAt: now(),
      modules: Object.freeze(modules.map(Object.freeze)),
    });
  }

  return Object.freeze({ snapshot });
}
