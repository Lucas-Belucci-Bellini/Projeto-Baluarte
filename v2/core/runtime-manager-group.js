/** Coordinates multiple Runtime-managed modules using dependency-safe parallel batches. */

/** @typedef {{start: (id: string) => Promise<unknown>, stop: (id: string) => Promise<unknown>}} RuntimeGroupManager */
/** @typedef {{listar: () => ReadonlyArray<{id: string, dependsOn?: ReadonlyArray<string>}>}} RuntimeGroupRegistry */
/** @typedef {{order: () => ReadonlyArray<string>}} RuntimeDependencies */
/** @typedef {{batches: () => ReadonlyArray<ReadonlyArray<string>>}} RuntimeBatches */
/** @typedef {{groupBatchStarted?: (index: number, batch: ReadonlyArray<string>) => void, groupBatchReady?: (index: number, batch: ReadonlyArray<string>) => void, groupStartupFailed?: (error: unknown) => void, groupRollback?: (ids: ReadonlyArray<string>) => void, groupBatchStopped?: (index: number, ids: ReadonlyArray<string>) => void, groupShutdownFailed?: (errors: ReadonlyArray<{id: string, error: unknown}>) => void}} RuntimeGroupEvents */
/** @typedef {(id: string) => Promise<unknown>} RuntimeReadinessWait */
/**
 * @typedef {{
 *   manager: RuntimeGroupManager,
 *   registry: RuntimeGroupRegistry,
 *   dependencies: RuntimeDependencies,
 *   batches: RuntimeBatches,
 *   readinessWait?: RuntimeReadinessWait,
 *   events?: RuntimeGroupEvents
 * }} RuntimeManagerGroupOptions
 */
/** @typedef {{startAll: () => Promise<string[]>, stopAll: () => Promise<void>}} RuntimeManagerGroup */

/** @param {Partial<RuntimeManagerGroupOptions>} [options] @returns {RuntimeManagerGroup} */
export function criarRuntimeManagerGroup(options = {}) {
  const { manager, registry, dependencies, batches, readinessWait, events } = options;
  if (!manager || typeof manager.start !== 'function' || typeof manager.stop !== 'function') throw new TypeError('manager inválido');
  if (!registry || typeof registry.listar !== 'function') throw new TypeError('registry inválido');
  if (!dependencies || typeof dependencies.order !== 'function') throw new TypeError('dependencies inválido');
  if (!batches || typeof batches.batches !== 'function') throw new TypeError('batches inválidos');
  if (readinessWait && typeof readinessWait !== 'function') throw new TypeError('readinessWait inválido');
  if (events && typeof events !== 'object') throw new TypeError('events inválido');

  /* Ver `runtime-supervisor.js`: o estreitamento das guardas não atravessa a
   * fronteira das funções declaradas abaixo. */
  const gerente = manager;
  const catalogo = registry;
  const plano = dependencies;
  const lotes = batches;

  /** @returns {ReadonlyArray<ReadonlyArray<string>>} */
  function planoValidado() {
    const order = [...plano.order()];
    const plannedBatches = lotes.batches().map(batch => [...batch]);
    const flattened = plannedBatches.flat();
    const orderIds = new Set(order);
    const batchIds = new Set(flattened);
    const batchesAreNonEmpty = plannedBatches.every(batch => batch.length > 0);
    const sameMembership = order.length === flattened.length
      && orderIds.size === order.length
      && batchIds.size === flattened.length
      && orderIds.size === batchIds.size
      && [...orderIds].every(id => batchIds.has(id));

    const registryEntries = catalogo.listar();
    const registryIds = new Set(registryEntries.map(entry => entry.id));
    const registryIsDescribed = registryEntries.length > 0;
    const registryMembership = !registryIsDescribed
      || (registryEntries.length === registryIds.size
        && registryIds.size === orderIds.size
        && [...registryIds].every(id => orderIds.has(id)));

    const orderPosition = new Map(order.map((id, index) => [id, index]));
    const batchPosition = new Map();
    for (let index = 0; index < plannedBatches.length; index++) {
      for (const id of plannedBatches[index]) batchPosition.set(id, index);
    }

    let dependenciesAreCoherent = true;
    if (registryIsDescribed) {
      for (const entry of registryEntries) {
        for (const dependency of entry.dependsOn ?? []) {
          const dependencyOrder = orderPosition.get(dependency);
          const entryOrder = orderPosition.get(entry.id);
          const dependencyBatch = batchPosition.get(dependency);
          const entryBatch = batchPosition.get(entry.id);
          if (!registryIds.has(dependency)
            || dependencyOrder === undefined
            || entryOrder === undefined
            || dependencyOrder >= entryOrder
            || dependencyBatch === undefined
            || entryBatch === undefined
            || dependencyBatch >= entryBatch) {
            dependenciesAreCoherent = false;
          }
        }
      }
    }

    if (!(batchesAreNonEmpty && sameMembership && registryMembership && dependenciesAreCoherent)) {
      const error = new Error('Plano de dependências e batches divergentes');
      Object.assign(error, { details: { order, batches: plannedBatches } });
      throw error;
    }
    return plannedBatches;
  }

  async function startAll() {
    const started = [];
    try {
      const plannedBatches = planoValidado();
      for (const [index, batch] of plannedBatches.entries()) {
        events?.groupBatchStarted?.(index, batch);
        const results = await Promise.allSettled(batch.map(id => gerente.start(id)));
        const failure = results.find(result => result.status === 'rejected');
        for (let i = 0; i < results.length; i++) {
          if (results[i].status === 'fulfilled') started.push(batch[i]);
        }
        if (failure) throw failure.reason;
        if (readinessWait) await Promise.all(batch.map(id => readinessWait(id)));
        events?.groupBatchReady?.(index, batch);
      }
      return started;
    } catch (error) {
      events?.groupStartupFailed?.(error);
      const rollback = [...started].reverse();
      for (const id of rollback) {
        try { await gerente.stop(id); } catch { /* original startup/readiness error wins */ }
      }
      if (rollback.length) events?.groupRollback?.(rollback);
      throw error;
    }
  }

  async function stopAll() {
    const errors = [];
    const batchesInReverse = [...planoValidado()].reverse();
    for (let reverseIndex = 0; reverseIndex < batchesInReverse.length; reverseIndex++) {
      const batch = batchesInReverse[reverseIndex];
      const index = batchesInReverse.length - reverseIndex - 1;
      const ids = [...batch].reverse();
      const results = await Promise.allSettled(ids.map(id => gerente.stop(id)));
      for (let i = 0; i < results.length; i++) {
        /* Numa const: `results[i].status === 'rejected'` seguido de
         * `results[i].reason` indexa duas vezes, e o TS não carrega o
         * estreitamento de um acesso para o seguinte. */
        const resultado = results[i];
        if (resultado.status === 'rejected') errors.push({ id: ids[i], error: resultado.reason });
      }
      events?.groupBatchStopped?.(index, ids);
    }
    if (errors.length) {
      events?.groupShutdownFailed?.(errors);
      const aggregate = new AggregateError(errors.map(item => item.error), 'Falha ao encerrar um ou mais módulos');
      /* `details` é campo NOSSO, não do AggregateError padrão: leva o par
       * id↔erro para quem captura, sem obrigar a recompor a partir de
       * `errors[]`. `Object.assign` porque a atribuição direta não existe no
       * tipo — o campo é uma extensão deliberada, não um descuido. */
      Object.assign(aggregate, { details: errors });
      throw aggregate;
    }
  }

  return { startAll, stopAll };
}
