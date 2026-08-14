/** Composes the existing group lifecycle with read-only observability hooks. */

/** @typedef {{startAll: () => Promise<string[]>, stopAll: () => Promise<void>}} RuntimeGroup */
/** @typedef {{emit: (event: Record<string, unknown>) => void}} RuntimeGroupEvents */
/** @typedef {{snapshot: () => unknown}} RuntimeGroupSupervisor */
/** @typedef {{group?: RuntimeGroup, events?: RuntimeGroupEvents, supervisor?: RuntimeGroupSupervisor}} RuntimeGroupLifecycleOptions */

/** @param {RuntimeGroupLifecycleOptions} [options] */
export function criarRuntimeGroupLifecycle(options = {}) {
  const { group, events, supervisor } = options;
  if (!group || typeof group.startAll !== 'function' || typeof group.stopAll !== 'function') throw new TypeError('group inválido');
  if (!events || typeof events.emit !== 'function') throw new TypeError('events inválidos');
  if (!supervisor || typeof supervisor.snapshot !== 'function') throw new TypeError('supervisor inválido');

  // Narrow once, after validation, so closures keep the proven contracts under strict/checkJs.
  const runtimeGroup = group;
  const runtimeEvents = events;
  const runtimeSupervisor = supervisor;

  async function startAll() {
    runtimeEvents.emit({ type: 'group.starting' });
    try {
      const started = await runtimeGroup.startAll();
      runtimeEvents.emit({ type: 'group.started', started: [...started] });
      return started;
    } catch (error) {
      runtimeEvents.emit({ type: 'group.failed', phase: 'start', error });
      throw error;
    }
  }

  async function stopAll() {
    runtimeEvents.emit({ type: 'group.stopping' });
    try {
      await runtimeGroup.stopAll();
      runtimeEvents.emit({ type: 'group.stopped' });
    } catch (error) {
      runtimeEvents.emit({ type: 'group.failed', phase: 'stop', error });
      throw error;
    }
  }

  return Object.freeze({ startAll, stopAll, snapshot: () => runtimeSupervisor.snapshot() });
}
