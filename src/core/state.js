/**
 * Store reativo simples baseado em Proxy + listeners.
 * Uso:
 *   const store = createStore({ count: 0 });
 *   store.subscribe((newState, oldState) => { ... });
 *   store.set({ count: 1 });
 *   const v = store.get('count');
 */

export function createStore(initial = {}) {
  let state = { ...initial };
  const listeners = new Set();

  function get(key) {
    return key === undefined ? { ...state } : state[key];
  }

  function set(patch) {
    const old = { ...state };
    state = { ...state, ...patch };
    listeners.forEach((fn) => {
      try {
        fn(state, old);
      } catch (err) {
        console.error('[store] Listener falhou:', err);
      }
    });
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return { get, set, subscribe };
}

/* Store global do app (pode crescer nas próximas fases). */
export const appState = createStore({
  route: '/home',
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  bootedAt: null,
  user: { name: 'Lucas Belucci Bellini', clearance: 'OMEGA' }
});
