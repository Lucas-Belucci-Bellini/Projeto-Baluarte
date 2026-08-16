/** Read-only supervisor facade over runtime state, events and snapshots. */

/** @typedef {{listar: () => ReadonlyArray<{id: string}>}} RuntimeRegistry */
/** @typedef {{status: () => unknown}} RuntimeGroupStatus */
/** @typedef {{history: () => ReadonlyArray<unknown>}} RuntimeEventsHistory */
/* O `stateOf` sempre foi chamado com o id do módulo (ver `snapshot`); o typedef
 * é que dizia `() => unknown`. Corrigido o contrato, não a chamada. */
/** @typedef {(id: string) => unknown} RuntimeStateOf */
/** @typedef {() => number} RuntimeClock */
/**
 * @typedef {{
 *   registry: RuntimeRegistry,
 *   stateOf: RuntimeStateOf,
 *   groupStatus: RuntimeGroupStatus,
 *   events: RuntimeEventsHistory,
 *   now?: RuntimeClock
 * }} RuntimeSupervisorOptions
 */
/**
 * @typedef {{
 *   snapshot: () => Readonly<{capturedAt: unknown, status: unknown, modules: ReadonlyArray<Readonly<{id: string, state: unknown}>>, lastEvent: unknown|null}>
 * }} RuntimeSupervisor
 */

/** @param {Partial<RuntimeSupervisorOptions>} [options] @returns {RuntimeSupervisor} */
export function criarRuntimeSupervisor(options = {}) {
  const { registry, stateOf, groupStatus, events, now = () => Date.now() } = options;
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');
  if (typeof stateOf !== 'function') throw new TypeError('stateOf inválido');
  if (!groupStatus || typeof groupStatus.status !== 'function') throw new TypeError('groupStatus inválido');
  if (!events || typeof events.history !== 'function') throw new TypeError('events inválido');

  /* Reancorar depois das guardas: o TS não leva o estreitamento de uma variável
   * capturada para dentro de função declarada, então sem estas consts o
   * `snapshot` volta a ver tudo como possivelmente indefinido. */
  const fonte = registry;
  const estadoDe = stateOf;
  const grupo = groupStatus;
  const historico = events;

  function snapshot() {
    const modules = fonte.listar().map(entry => ({ id: entry.id, state: estadoDe(entry.id) }));
    const history = historico.history();
    return Object.freeze({
      capturedAt: now(),
      status: grupo.status(),
      /* Arrow em vez de passar `Object.freeze` direto: como referência ela
       * resolve para a sobrecarga genérica errada e o elemento vira
       * `Readonly<unknown>`, quebrando o contrato do retorno. */
      modules: Object.freeze(modules.map((m) => Object.freeze(m))),
      lastEvent: history.length ? history[history.length - 1] : null,
    });
  }

  return Object.freeze({ snapshot });
}
