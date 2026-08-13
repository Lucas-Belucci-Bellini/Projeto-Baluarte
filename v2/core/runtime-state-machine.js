/** Explicit lifecycle state machine for a Runtime module. */
const TRANSITIONS = new Map([
  ['created', new Set(['starting', 'stopped'])],
  ['stopped', new Set(['starting'])],
  ['starting', new Set(['ready', 'failed', 'stopped'])],
  ['ready', new Set(['degraded', 'blocked', 'stopping', 'failed'])],
  ['degraded', new Set(['ready', 'blocked', 'stopping', 'failed'])],
  ['blocked', new Set(['starting', 'stopping', 'failed'])],
  ['failed', new Set(['starting', 'stopped'])],
  ['stopping', new Set(['stopped', 'failed'])],
]);

export function criarRuntimeStateMachine(initial = 'created') {
  if (!TRANSITIONS.has(initial)) throw new Error(`Estado inicial inválido: ${initial}`);
  let current = initial;
  const history = [];

  function transition(next, metadata = {}) {
    if (!TRANSITIONS.get(current).has(next)) {
      throw new Error(`Transição inválida: ${current} -> ${next}`);
    }
    const previous = current;
    current = next;
    const event = { previous, current, metadata, at: Date.now() };
    history.push(event);
    return event;
  }

  return {
    state: () => current,
    canTransition: next => TRANSITIONS.get(current).has(next),
    transition,
    history: () => history.slice(),
  };
}

export const RUNTIME_STATES = Object.freeze([...TRANSITIONS.keys()]);
