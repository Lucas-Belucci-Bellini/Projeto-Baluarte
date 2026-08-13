import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeModuleRegistry } from '../../v2/core/runtime-module-registry.js';
import { criarRuntimeDependencyBatches } from '../../v2/core/runtime-module-batches.js';
import { criarRuntimeManagerGroup } from '../../v2/core/runtime-manager-group.js';

function registry() {
  const r = criarRuntimeModuleRegistry();
  r.registrar('db');
  r.registrar('api', { dependsOn: ['db'] });
  r.selar();
  return r;
}

test('startAll só libera o próximo batch depois do readiness', async () => {
  const r = registry();
  const batches = criarRuntimeDependencyBatches(r);
  const events = [];
  const manager = {
    start: async id => events.push(`start:${id}`),
    stop: async id => events.push(`stop:${id}`)
  };
  const readinessWait = async id => { events.push(`ready:${id}`); };
  const group = criarRuntimeManagerGroup({ manager, registry: r, dependencies: { order: () => ['db', 'api'] }, batches, readinessWait });
  await group.startAll();
  assert.deepEqual(events, ['start:db', 'ready:db', 'start:api', 'ready:api']);
});

test('falha de readiness faz rollback', async () => {
  const r = registry();
  const batches = criarRuntimeDependencyBatches(r);
  const events = [];
  const manager = {
    start: async id => events.push(`start:${id}`),
    stop: async id => events.push(`stop:${id}`)
  };
  const readinessWait = async id => { events.push(`ready:${id}`); if (id === 'api') throw new Error('not ready'); };
  const group = criarRuntimeManagerGroup({ manager, registry: r, dependencies: { order: () => ['db', 'api'] }, batches, readinessWait });
  await assert.rejects(() => group.startAll(), /not ready/);
  assert.deepEqual(events, ['start:db', 'ready:db', 'start:api', 'ready:api', 'stop:api', 'stop:db']);
});
