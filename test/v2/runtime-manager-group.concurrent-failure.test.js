import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeManagerGroup } from '../../v2/core/runtime-manager-group.js';

function makeGroup({ failStarts = [], failStops = [] } = {}) {
  const calls = [];
  const manager = {
    async start(id) {
      calls.push(`start:${id}`);
      if (failStarts.includes(id)) throw new Error(`start ${id}`);
    },
    async stop(id) {
      calls.push(`stop:${id}`);
      if (failStops.includes(id)) throw new Error(`stop ${id}`);
    },
  };
  const group = criarRuntimeManagerGroup({
    manager,
    registry: { listar: () => [] },
    dependencies: { order: () => ['db', 'api', 'worker'] },
    batches: { batches: () => [['db'], ['api', 'worker']] },
  });
  return { group, calls };
}

test('falhas concorrentes no mesmo batch aguardam todos os resultados', async () => {
  const { group, calls } = makeGroup({ failStarts: ['api', 'worker'] });
  await assert.rejects(() => group.startAll(), /start api|start worker/);
  assert.deepEqual(calls, ['start:db', 'start:api', 'start:worker', 'stop:db']);
});

test('rollback continua preservando módulos que realmente iniciaram', async () => {
  const { group, calls } = makeGroup({ failStarts: ['worker'] });
  await assert.rejects(() => group.startAll(), /start worker/);
  assert.deepEqual(calls, ['start:db', 'start:api', 'start:worker', 'stop:api', 'stop:db']);
});

test('shutdown tenta todos os módulos mesmo quando um falha', async () => {
  const { group, calls } = makeGroup({ failStops: ['worker'] });
  await assert.rejects(() => group.stopAll(), /Falha ao encerrar/);
  assert.deepEqual(calls, ['stop:worker', 'stop:api', 'stop:db']);
});
