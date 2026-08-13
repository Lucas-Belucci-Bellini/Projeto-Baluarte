/** Small event stream for lifecycle transitions; no external broker required. */
export function criarRuntimeStateEvents() {
  const listeners = new Set();
  const history = [];

  function emit(event) {
    const normalized = Object.freeze({ ...event });
    history.push(normalized);
    for (const listener of listeners) listener(normalized);
    return normalized;
  }

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
