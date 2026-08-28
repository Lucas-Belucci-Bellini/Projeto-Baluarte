/** Composes the existing RuntimeManagerGroup with its structured observability chain. */

import { criarRuntimeEvents } from './module-runtime-events.js';
import { criarRuntimeGroupLifecycle } from './runtime-group-lifecycle.js';
import { criarRuntimeManagerGroup } from './runtime-manager-group.js';
import { criarRuntimeStateEvents } from './runtime-state-events.js';

/** @typedef {{start: (id: string) => Promise<unknown>, stop: (id: string) => Promise<unknown>}} RuntimeObservedManager */
/** @typedef {{listar: () => ReadonlyArray<{id: string}>}} RuntimeObservedRegistry */
/** @typedef {{order: () => ReadonlyArray<string>}} RuntimeObservedDependencies */
/** @typedef {{batches: () => ReadonlyArray<ReadonlyArray<string>>}} RuntimeObservedBatches */
/** @typedef {(id: string) => Promise<unknown>} RuntimeObservedReadinessWait */
/** @typedef {{snapshot: () => unknown}} RuntimeObservedSupervisor */
/** @typedef {{emit: (event: Record<string, unknown>) => Readonly<Record<string, unknown>>, history: () => ReadonlyArray<Readonly<Record<string, unknown>>>}} RuntimeObservedStateEvents */
/** @typedef {(event: Readonly<Record<string, unknown>>) => void} RuntimeObservedSink */
/** @typedef {() => number} RuntimeObservedClock */
/**
 * @typedef {{
 *   manager: RuntimeObservedManager,
 *   registry: RuntimeObservedRegistry,
 *   dependencies: RuntimeObservedDependencies,
 *   batches: RuntimeObservedBatches,
 *   readinessWait?: RuntimeObservedReadinessWait,
 *   stateEvents: RuntimeObservedStateEvents,
 *   supervisor: RuntimeObservedSupervisor,
 *   clock?: RuntimeObservedClock,
 *   sink?: RuntimeObservedSink
 * }} RuntimeManagerGroupObservabilityOptions
 */
/**
 * @typedef {{
 *   managerGroup: {startAll: () => Promise<string[]>, stopAll: () => Promise<void>},
 *   lifecycle: {startAll: () => Promise<string[]>, stopAll: () => Promise<void>, snapshot: () => unknown},
 *   events: Record<string, unknown>,
 *   stateEvents: RuntimeObservedStateEvents,
 *   startAll: () => Promise<string[]>,
 *   stopAll: () => Promise<void>,
 *   snapshot: () => unknown
 * }} RuntimeManagerGroupObservability
 */

/**
 * Builds the group once, before injecting event hooks, then composes it with the
 * existing lifecycle wrapper. The state event stream is required so the
 * supervisor and the event sink observe the same immutable history.
 *
 * @param {Partial<RuntimeManagerGroupObservabilityOptions>} [options]
 * @returns {RuntimeManagerGroupObservability}
 */
export function criarRuntimeManagerGroupObservavel(options = {}) {
  const {
    manager,
    registry,
    dependencies,
    batches,
    readinessWait,
    stateEvents,
    supervisor,
    clock = () => Date.now(),
    sink = () => {},
  } = options;
  if (!stateEvents || typeof stateEvents.emit !== 'function' || typeof stateEvents.history !== 'function') {
    throw new TypeError('stateEvents inválidos');
  }
  if (!supervisor || typeof supervisor.snapshot !== 'function') throw new TypeError('supervisor inválido');
  if (typeof clock !== 'function') throw new TypeError('clock inválido');
  if (typeof sink !== 'function') throw new TypeError('sink inválido');

  const historico = stateEvents;
  const supervisao = supervisor;
  const agora = clock;
  const destino = sink;

  /** @param {unknown} error */
  function errorMessage(error) {
    return error instanceof Error ? error.message : String(error);
  }

  /** @param {Record<string, unknown>} event */
  function publicar(event) {
    const safeEvent = { ...event };
    if ('error' in safeEvent) safeEvent.error = errorMessage(safeEvent.error);
    const eventWithTimestamp = 'timestamp' in safeEvent
      ? safeEvent
      : { timestamp: agora(), ...safeEvent };
    const emitted = historico.emit(eventWithTimestamp);
    destino(emitted);
    return emitted;
  }

  const events = criarRuntimeEvents({ clock: agora, sink: publicar });
  const managerGroup = criarRuntimeManagerGroup({
    manager,
    registry,
    dependencies,
    batches,
    readinessWait,
    events,
  });
  const lifecycle = criarRuntimeGroupLifecycle({
    group: managerGroup,
    events: { emit: publicar },
    supervisor: supervisao,
  });

  return Object.freeze({
    managerGroup,
    lifecycle,
    events,
    stateEvents: historico,
    startAll: lifecycle.startAll,
    stopAll: lifecycle.stopAll,
    snapshot: lifecycle.snapshot,
  });
}

/** @returns {RuntimeObservedStateEvents} */
export function criarRuntimeObservedStateEvents() {
  return criarRuntimeStateEvents();
}
