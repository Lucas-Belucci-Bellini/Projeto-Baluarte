/**
 * Store reativo simples: estado imutável por substituição (merge raso) + listeners.
 * `get()` sem chave devolve uma cópia do estado inteiro; com chave, o valor.
 * `set(patch)` faz merge raso e notifica os inscritos com (novoEstado, antigo).
 * `subscribe(fn)` devolve uma função para cancelar a inscrição.
 *
 * Uso:
 *   const store = createStore({ count: 0 });
 *   const off = store.subscribe((novo, antigo) => { ... });
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
    state = { ...state, ...patch };   // merge raso: cria um novo objeto de estado
    listeners.forEach((fn) => {       // notifica todos, isolando erros de cada um
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
