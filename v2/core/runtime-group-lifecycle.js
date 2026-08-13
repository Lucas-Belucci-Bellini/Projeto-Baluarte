/** Composes the existing group lifecycle with read-only observability hooks. */
export function criarRuntimeGroupLifecycle({ group, events, supervisor } = {}) {
  if (!group || typeof group.startAll !== 'function' || typeof group.stopAll !== 'function') throw new TypeError('group inválido');
  if (!events || typeof events.emit !== 'function') throw new TypeError('events inválidos');
  if (!supervisor || typeof supervisor.snapshot !== 'function') throw new TypeError('supervisor inválido');

  async function startAll() {
    events.emit({ type: 'group.starting' });
    try {
      const started = await group.startAll();
      events.emit({ type: 'group.started', started: [...started] });
      return started;
    } catch (error) {
      events.emit({ type: 'group.failed', phase: 'start', error });
      throw error;
    }
  }

  async function stopAll() {
    events.emit({ type: 'group.stopping' });
    try {
      await group.stopAll();
      events.emit({ type: 'group.stopped' });
    } catch (error) {
      events.emit({ type: 'group.failed', phase: 'stop', error });
      throw error;
    }
  }

  return Object.freeze({ startAll, stopAll, snapshot: () => supervisor.snapshot() });
}
