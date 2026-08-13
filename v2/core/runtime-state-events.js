/** Small event stream for lifecycle transitions; no external broker required. */

/** @typedef {Record<string, unknown>} RuntimeStateEvent */
/** @typedef {(event: RuntimeStateEvent) => void} RuntimeStateListener */
/** @typedef {{emit: (event: RuntimeStateEvent) => Readonly<RuntimeStateEvent>, subscribe: (listener: RuntimeStateListener) => () => boolean, history: () => ReadonlyArray<Readonly<RuntimeStateEvent>>, listenerCount: () => number}} RuntimeStateEvents */

/** @returns {RuntimeStateEvents} */
export function criarRuntimeStateEvents() {
  /** @type {Set<RuntimeStateListener>} */
  const listeners = new Set();
  /** @type {ReadonlyArray<Readonly<RuntimeStateEvent>>} */
  const history = [];

  /** @param {RuntimeStateEvent} event */
  function emit(event) {
    const normalized = Object.freeze({ ...event });
    history.push(normalized);
    for (const listener of listeners) listener(normalized);
    return normalized;
  }

  /** @param {RuntimeStateListener} listener */
  function subscribe(listener) {
    if (typeof listener !== 'function') throw new TypeError('listener inválido');
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    emit,
    subscribe,
    history: () => history.slice(),
    listenerCount: () => listeners.size,
  };
}
