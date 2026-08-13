import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeManagerGroup } from '../../v2/core/runtime-manager-group.js';
import { criarRuntimeGroupLifecycle } from '../../v2/core/runtime-group-lifecycle.js';

function setup({ failStart, failReady } = {}) {
  const calls = [];
  const manager = {
    async start(id) {
      calls.push(`start:${id}`);
      if (id === failStart) throw new Error(`start ${id}`);
    },
    async stop(id) {
      calls.push(`stop:${id}`);
      return undefined;
    },
  };
  const batches = { batches: () => [['db'], ['api', 'worker']] };
  const group = criarRuntimeManagerGroup({
    manager,
    registry: { listar: () => [{ id: 'db' }, { id: 'api' }, { id: 'worker' }] },
    dependencies: { order: () => ['db', 'api', 'worker'] },
    batches,
    readinessWait: async id => {
      calls.push(`ready:${id}`);
      if (id === failReady) throw new Error(`ready ${id}`);
    },
  });
  return { group, calls };
}

function lifecycleFor(group, calls) {
  const emitted = [];
  return {
    lifecycle: criarRuntimeGroupLifecycle({
      group,
      events: { emit: event => emitted.push(event) },
      supervisor: { snapshot: () => ({ calls: [...calls] }) },
    }),
    emitted,
  };
}

test('integra startup real, batches, readiness e eventos', async () => {
  const { group, calls } = setup();
  const { lifecycle, emitted } = lifecycleFor(group, calls);
  assert.deepEqual(await lifecycle.startAll(), ['db', 'api', 'worker']);
  assert.deepEqual(calls, [
    'start:db', 'ready:db',
    'start:api', 'start:worker', 'ready:api', 'ready:worker',
  ]);
  assert.deepEqual(emitted.map(event => event.type), ['group.starting', 'group.started']);
});

test('readiness failure rolls back only what realmente iniciou', async () => {
  const { group, calls } = setup({ failReady: 'api' });
  const { lifecycle, emitted } = lifecycleFor(group, calls);
  await assert.rejects(() => lifecycle.startAll(), /ready api/);
  assert.deepEqual(calls, [
    'start:db', 'ready:db',
    'start:api', 'start:worker', 'ready:api', 'ready:worker',
    'stop:worker', 'stop:api', 'stop:db',
  ]);
  assert.equal(emitted.at(-1).type, 'group.failed');
});

test('shutdown usa a ordem reversa do agrupamento', async () => {
  const { group, calls } = setup();
  const { lifecycle, emitted } = lifecycleFor(group, calls);
  await lifecycle.stopAll();
  assert.deepEqual(calls, ['stop:worker', 'stop:api', 'stop:db']);
  assert.deepEqual(emitted.map(event => event.type), ['group.stopping', 'group.stopped']);
});
