/**
 * Store reativo simples do Baluarte.
 *
 * O store usa merge raso por substituição. A implementação TypeScript fica
 * disponível aos consumidores JavaScript pelo wrapper `state.js` enquanto a
 * migração acontece por ondas.
 */

export type StoreListener<State extends object> = (
  next: Readonly<State>,
  previous: Readonly<State>,
) => void;

export interface Store<State extends object> {
  get(): Readonly<State>;
  get<Key extends keyof State>(key: Key): State[Key];
  set(patch: Partial<State>): void;
  subscribe(listener: StoreListener<State>): () => boolean;
}

export function createStore<State extends object>(
  initial: State,
): Store<State> {
  let state: State = { ...initial };
  const listeners = new Set<StoreListener<State>>();

  function get(): Readonly<State>;
  function get<Key extends keyof State>(key: Key): State[Key];
  function get<Key extends keyof State>(key?: Key): Readonly<State> | State[Key] {
    return key === undefined ? { ...state } : state[key];
  }

  function set(patch: Partial<State>): void {
    const previous = { ...state };
    state = { ...state, ...patch };

    listeners.forEach((listener) => {
      try {
        listener(state, previous);
      } catch (error) {
        console.error('[store] Listener falhou:', error);
      }
    });
  }

  function subscribe(listener: StoreListener<State>): () => boolean {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { get, set, subscribe };
}

export interface AppState {
  route: string;
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  bootedAt: number | null;
  user: {
    name: string;
    clearance: string;
  };
}

export const appState = createStore<AppState>({
  route: '/home',
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  bootedAt: null,
  user: { name: 'Lucas Belucci Bellini', clearance: 'OMEGA' },
});
