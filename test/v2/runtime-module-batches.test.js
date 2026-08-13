import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeModuleRegistry } from '../../v2/core/runtime-module-registry.js';
import { criarRuntimeDependencyBatches } from '../../v2/core/runtime-module-batches.js';
import { criarRuntimeManagerGroup } from '../../v2/core/runtime-manager-group.js';

function makeRegistry(entries) {
  const registry = criarRuntimeModuleRegistry();
  for (const entry of entries) registry.registrar(entry.id, { dependsOn: entry.dependsOn ?? [] });
  registry.selar();
  return registry;
}

test('independentes compartilham o mesmo batch', () => {
  const registry = makeRegistry([
    { id: 'c', dependsOn: ['a'] }, { id: 'b', dependsOn: ['a'] }, { id: 'a' }
  ]);
  assert.deepEqual(criarRuntimeDependencyBatches(registry).batches(), [['a'], ['b', 'c']]);
});

test('startup paralelo preserva dependências', async () => {
  const registry = makeRegistry([
    { id: 'c', dependsOn: ['a'] }, { id: 'b', dependsOn: ['a'] }, { id: 'a' }
  ]);
  const dependencies = { order: () => ['a', 'b', 'c'] };
  const batches = criarRuntimeDependencyBatches(registry);
  const active = new Set();
  let maxActive = 0;
  const events = [];
  const manager = {
    start: async id => {
      active.add(id); maxActive = Math.max(maxActive, active.size); events.push(`start:${id}`);
      await new Promise(resolve => setTimeout(resolve, 1)); active.delete(id);
    },
    stop: async id => events.push(`stop:${id}`)
  };
  const group = criarRuntimeManagerGroup({ manager, registry, dependencies, batches });
  await group.startAll();
  assert.equal(maxActive, 2);
  assert.deepEqual(events.slice(0, 3).sort(), ['start:a', 'start:b', 'start:c'].sort());
});
