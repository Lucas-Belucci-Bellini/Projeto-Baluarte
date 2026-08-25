import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeGroupStatus } from '../../v2/core/runtime-group-status.js';
import { criarRuntimeManagerGroupObservavel, criarRuntimeObservedStateEvents } from '../../v2/core/runtime-manager-group-observability.js';
import { criarRuntimeModuleRegistry } from '../../v2/core/runtime-module-registry.js';
import { criarRuntimeSupervisor } from '../../v2/core/runtime-supervisor.js';

function setup({ failReady } = {}) {
  const calls = [];
  const states = new Map([
    ['db', 'created'],
    ['api', 'created'],
    ['worker', 'created'],
  ]);
  const manager = {
    async start(id) {
      calls.push(`start:${id}`);
      states.set(id, 'ready');
    },
    async stop(id) {
      calls.push(`stop:${id}`);
      states.set(id, 'stopped');
    },
  };
  const registry = criarRuntimeModuleRegistry();
  registry.registrar('db');
  registry.registrar('api');
  registry.registrar('worker');
  registry.selar();
  const batches = { batches: () => [['db'], ['api', 'worker']] };
  const groupStatus = criarRuntimeGroupStatus({ batches, states });
  const stateEvents = criarRuntimeObservedStateEvents();
  const supervisor = criarRuntimeSupervisor({
    registry,
    stateOf: id => states.get(id),
    groupStatus,
    events: stateEvents,
    now: () => 77,
  });
  const emitted = [];
  const observed = criarRuntimeManagerGroupObservavel({
    manager,
    registry,
    dependencies: { order: () => ['db', 'api', 'worker'] },
    batches,
    readinessWait: async id => {
      calls.push(`ready:${id}`);
      if (id === failReady) throw new Error(`ready ${id}`);
    },
    stateEvents,
    supervisor,
    clock: () => 77,
    sink: event => emitted.push(event),
  });
  return { calls, emitted, observed, supervisor, stateEvents };
}

test('integra manager group, lifecycle, eventos e supervisor reais', async () => {
  const { calls, emitted, observed, supervisor, stateEvents } = setup();

  assert.deepEqual(await observed.startAll(), ['db', 'api', 'worker']);
  assert.deepEqual(calls, [
    'start:db', 'ready:db',
    'start:api', 'start:worker', 'ready:api', 'ready:worker',
  ]);
  assert.deepEqual(emitted.map(event => event.type), [
    'group.starting',
    'runtime.group_batch_started',
    'runtime.group_batch_ready',
    'runtime.group_batch_started',
    'runtime.group_batch_ready',
    'group.started',
  ]);
  assert.equal(stateEvents.history().length, emitted.length);
  assert.equal(supervisor.snapshot().status, 'ready');
  assert.equal(supervisor.snapshot().lastEvent.type, 'group.started');
});

test('preserva shutdown reverso e publica somente eventos estruturados', async () => {
  const { calls, emitted, observed } = setup();

  await observed.stopAll();

  assert.deepEqual(calls, ['stop:worker', 'stop:api', 'stop:db']);
  assert.deepEqual(emitted.map(event => event.type), [
    'group.stopping',
    'runtime.group_batch_stopped',
    'runtime.group_batch_stopped',
    'group.stopped',
  ]);
  assert.equal(emitted.every(event => event.timestamp === 77), true);
});

test('mantém rollback e redige o erro no histórico compartilhado', async () => {
  const { calls, emitted, observed, stateEvents } = setup({ failReady: 'api' });

  await assert.rejects(() => observed.startAll(), /ready api/);

  assert.deepEqual(calls, [
    'start:db', 'ready:db',
    'start:api', 'start:worker', 'ready:api', 'ready:worker',
    'stop:worker', 'stop:api', 'stop:db',
  ]);
  assert.deepEqual(emitted.map(event => event.type), [
    'group.starting',
    'runtime.group_batch_started',
    'runtime.group_batch_ready',
    'runtime.group_batch_started',
    'runtime.group_startup_failed',
    'runtime.group_rollback',
    'group.failed',
  ]);
  assert.equal(emitted.find(event => event.type === 'runtime.group_startup_failed').error, 'ready api');
  assert.equal(emitted.at(-1).error, 'ready api');
  assert.equal(stateEvents.history().some(event => event.error instanceof Error), false);
});
