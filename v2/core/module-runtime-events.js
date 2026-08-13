/** Structured supervisor events. */
export function criarRuntimeEvents({ clock = () => Date.now(), sink = () => {} } = {}) {
  const emit = (type, data = {}) => sink({ type, timestamp: clock(), ...data });
  return {
    opened: (id) => emit('runtime.opened', { id }),
    started: (id) => emit('module.started', { id }),
    stopped: (id) => emit('module.stopped', { id }),
    failed: (id, error) => emit('module.failed', { id, error: String(error?.message ?? error) }),
    restarting: (id, attempt, delayMs) => emit('module.restarting', { id, attempt, delayMs }),
    exhausted: (id) => emit('module.restart_exhausted', { id })
  };
}
