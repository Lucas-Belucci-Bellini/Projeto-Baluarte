/** Structured supervisor and group lifecycle events. */
/**
 * @param {{
 *   clock?: () => number,
 *   sink?: (event: Record<string, unknown>) => void
 * }} options
 */
export function criarRuntimeEvents({ clock = () => Date.now(), sink = () => {} } = {}) {
  /** @param {string} type @param {Record<string, unknown>} data */
  const emit = (type, data = {}) => sink({ type, timestamp: clock(), ...data });
  return {
    /** @param {string} id */
    opened: (id) => emit('runtime.opened', { id }),
    /** @param {string} id */
    started: (id) => emit('module.started', { id }),
    /** @param {string} id */
    stopped: (id) => emit('module.stopped', { id }),
    /** @param {string} id @param {Error | unknown} error */
    failed: (id, error) => emit('module.failed', { id, error: String(error?.message ?? error) }),
    /** @param {string} id @param {number} attempt @param {number} delayMs */
    restarting: (id, attempt, delayMs) => emit('module.restarting', { id, attempt, delayMs }),
    /** @param {string} id */
    exhausted: (id) => emit('module.restart_exhausted', { id }),
    /** @param {number} index @param {string[]} ids */
    groupBatchStarted: (index, ids) => emit('runtime.group_batch_started', { index, ids: [...ids] }),
    /** @param {number} index @param {string[]} ids */
    groupBatchReady: (index, ids) => emit('runtime.group_batch_ready', { index, ids: [...ids] }),
    /** @param {Error | unknown} error */
    groupStartupFailed: (error) => emit('runtime.group_startup_failed', { error: String(error?.message ?? error) }),
    /** @param {string[]} ids */
    groupRollback: (ids) => emit('runtime.group_rollback', { ids: [...ids] }),
    /** @param {number} index @param {string[]} ids */
    groupBatchStopped: (index, ids) => emit('runtime.group_batch_stopped', { index, ids: [...ids] }),
    /** @param {{id: string, error: unknown}[]} errors */
    groupShutdownFailed: (errors) => emit('runtime.group_shutdown_failed', { errors: errors.map(item => ({ id: item.id, error: String(item.error?.message ?? item.error) })) })
  };
}
