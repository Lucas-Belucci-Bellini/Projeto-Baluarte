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

/** @param {Partial<RuntimeGroupSnapshotOptions>} [options] @returns {RuntimeGroupSnapshot} */
export function criarRuntimeGroupSnapshot(options = {}) {
  const { registry, stateOf, now = () => Date.now() } = options;
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');
  if (typeof stateOf !== 'function') throw new TypeError('stateOf inválido');
  if (typeof now !== 'function') throw new TypeError('now inválido');

  /* Ver `runtime-supervisor.js`: o estreitamento das guardas não atravessa a
   * fronteira da função declarada; estas consts é que o carregam. */
  const fonte = registry;
  const estadoDe = stateOf;

  function snapshot() {
    const modules = fonte.listar().map(entry => ({ id: entry.id, state: estadoDe(entry.id) }));
    return Object.freeze({
      capturedAt: now(),
      modules: Object.freeze(modules.map((m) => Object.freeze(m))),
    });
  }

  return Object.freeze({ snapshot });
}
