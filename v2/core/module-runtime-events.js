/** Structured supervisor and group lifecycle events. */
export function criarRuntimeEvents({ clock = () => Date.now(), sink = () => {} } = {}) {
  const emit = (type, data = {}) => sink({ type, timestamp: clock(), ...data });
  return {
    opened: (id) => emit('runtime.opened', { id }),
    started: (id) => emit('module.started', { id }),
    stopped: (id) => emit('module.stopped', { id }),
    failed: (id, error) => emit('module.failed', { id, error: String(error?.message ?? error) }),
    restarting: (id, attempt, delayMs) => emit('module.restarting', { id, attempt, delayMs }),
    exhausted: (id) => emit('module.restart_exhausted', { id }),
    groupBatchStarted: (index, ids) => emit('runtime.group_batch_started', { index, ids: [...ids] }),
    groupBatchReady: (index, ids) => emit('runtime.group_batch_ready', { index, ids: [...ids] }),
    groupStartupFailed: (error) => emit('runtime.group_startup_failed', { error: String(error?.message ?? error) }),
    groupRollback: (ids) => emit('runtime.group_rollback', { ids: [...ids] }),
    groupBatchStopped: (index, ids) => emit('runtime.group_batch_stopped', { index, ids: [...ids] }),
    groupShutdownFailed: (errors) => emit('runtime.group_shutdown_failed', { errors: errors.map(item => ({ id: item.id, error: String(item.error?.message ?? item.error) })) })
  };
}
