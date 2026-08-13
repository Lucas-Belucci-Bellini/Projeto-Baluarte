/** Read-only supervisor facade over runtime state, events and snapshots. */
export function criarRuntimeSupervisor({ registry, stateOf, groupStatus, events, now = () => Date.now() } = {}) {
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');
  if (typeof stateOf !== 'function') throw new TypeError('stateOf inválido');
  if (!groupStatus || typeof groupStatus.status !== 'function') throw new TypeError('groupStatus inválido');
  if (!events || typeof events.history !== 'function') throw new TypeError('events inválido');

  function snapshot() {
    const modules = registry.listar().map(entry => ({ id: entry.id, state: stateOf(entry.id) }));
    const history = events.history();
    return Object.freeze({
      capturedAt: now(),
      status: groupStatus.status(),
      modules: Object.freeze(modules.map(Object.freeze)),
      lastEvent: history.length ? history[history.length - 1] : null,
    });
  }

  return Object.freeze({ snapshot });
}
