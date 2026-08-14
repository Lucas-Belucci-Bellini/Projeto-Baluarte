/** Read-only supervisor facade over runtime state, events and snapshots. */

/** @typedef {{listar: () => ReadonlyArray<{id: string}>}} RuntimeRegistry */
/** @typedef {{status: () => unknown}} RuntimeGroupStatus */
/** @typedef {{history: () => ReadonlyArray<unknown>}} RuntimeEventsHistory */
/** @typedef {(id: string) => unknown} RuntimeStateOf */
/** @typedef {() => number} RuntimeClock */
/** @typedef {{registry: RuntimeRegistry, stateOf: RuntimeStateOf, groupStatus: RuntimeGroupStatus, events: RuntimeEventsHistory, now?: RuntimeClock}} RuntimeSupervisorOptions */
/** @typedef {{snapshot: () => Readonly<{capturedAt: number, status: unknown, modules: ReadonlyArray<Readonly<{id: string, state: unknown}>>, lastEvent: unknown|null}>}} RuntimeSupervisor */

/** @param {RuntimeSupervisorOptions} [options] @returns {RuntimeSupervisor} */
export function criarRuntimeSupervisor(options = {}) {
  const { registry, stateOf, groupStatus, events, now = () => Date.now() } = options;
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');
  if (typeof stateOf !== 'function') throw new TypeError('stateOf inválido');
  if (!groupStatus || typeof groupStatus.status !== 'function') throw new TypeError('groupStatus inválido');
  if (!events || typeof events.history !== 'function') throw new TypeError('events inválido');
  const runtimeRegistry = registry;
  const runtimeStateOf = stateOf;
  const runtimeGroupStatus = groupStatus;
  const runtimeEvents = events;
  const runtimeNow = now;

  function snapshot() {
    const modules = runtimeRegistry.listar().map(entry => ({ id: entry.id, state: runtimeStateOf(entry.id) }));
    const history = runtimeEvents.history();
    const frozenModules = modules.map((module) => Object.freeze(module));
    return Object.freeze({
      capturedAt: runtimeNow(),
      status: runtimeGroupStatus.status(),
      modules: Object.freeze(frozenModules),
      lastEvent: history.length ? history[history.length - 1] : null,
    });
  }

  return Object.freeze({ snapshot });
}
