/**
 * Event Bus simples (pub/sub).
 * Uso:
 *   bus.on('route:change', handler);
 *   bus.emit('route:change', { path: '/home' });
 *   bus.off('route:change', handler);
 */

function createBus() {
  const listeners = new Map();

  function on(event, handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
    return () => off(event, handler);   // devolve uma função para cancelar a inscrição
  }

  function once(event, handler) {
    const wrapped = (payload) => {
      off(event, wrapped);
      handler(payload);
    };
    return on(event, wrapped);
  }

  function off(event, handler) {
    const set = listeners.get(event);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) listeners.delete(event);
  }

  function emit(event, payload) {
    const set = listeners.get(event);
    if (!set) return;
    /* Itera sobre uma CÓPIA: um handler pode se desinscrever (ou inscrever
     * outro) durante o emit sem corromper o loop. Cada handler roda isolado —
     * um erro num deles não impede os demais. */
    for (const handler of [...set]) {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[bus] Erro no handler de "${event}":`, err);
      }
    }
  }

  function clear() {
    listeners.clear();
  }

  return { on, once, off, emit, clear };
}

export const bus = createBus();
export { createBus };
