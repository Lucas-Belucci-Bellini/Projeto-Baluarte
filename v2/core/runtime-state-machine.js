/** Explicit lifecycle state machine for a Runtime module. */

/** @typedef {'created'|'stopped'|'starting'|'ready'|'failed'|'degraded'|'blocked'|'stopping'} RuntimeState */
/** @typedef {Record<string, unknown>} RuntimeStateMetadata */
/** @typedef {{previous: RuntimeState, current: RuntimeState, metadata: RuntimeStateMetadata, at: number}} RuntimeStateTransition */
/** @typedef {{state: () => RuntimeState, canTransition: (next: RuntimeState) => boolean, transition: (next: RuntimeState, metadata?: RuntimeStateMetadata) => RuntimeStateTransition, history: () => ReadonlyArray<RuntimeStateTransition>}} RuntimeStateMachine */

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

/** @param {RuntimeState} [initial] @returns {RuntimeStateMachine} */
export function criarRuntimeStateMachine(initial = 'created') {
  if (!TRANSITIONS.has(initial)) throw new Error(`Estado inicial inválido: ${initial}`);
  let current = initial;
  /** @type {RuntimeStateTransition[]} */
  const history = [];

  /** @param {RuntimeState} next @param {RuntimeStateMetadata} [metadata] */
  function transition(next, metadata = {}) {
    const allowed = TRANSITIONS.get(current);
    if (!allowed || !allowed.has(next)) {
      throw new Error(`Transição inválida: ${current} -> ${next}`);
    }
    const previous = current;
    current = next;
    const event = { previous, current, metadata, at: Date.now() };
    history.push(event);
    return event;
  }

  /** @param {RuntimeState} next */
  function canTransition(next) {
    return TRANSITIONS.get(current)?.has(next) ?? false;
  }

  return {
    state: () => current,
    canTransition,
    transition,
    history: () => history.slice(),
  };
}

export const RUNTIME_STATES = Object.freeze([...TRANSITIONS.keys()]);
