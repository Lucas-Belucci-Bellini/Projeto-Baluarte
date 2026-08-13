import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeModuleRegistry } from '../../v2/core/runtime-module-registry.js';
import { criarRuntimeDependencyGraph } from '../../v2/core/runtime-module-dependencies.js';
import { criarRuntimeManagerGroup } from '../../v2/core/runtime-manager-group.js';

function makeRegistry(entries) {
  const registry = criarRuntimeModuleRegistry();
  for (const entry of entries) registry.registrar(entry.id, { dependsOn: entry.dependsOn ?? [] });
  registry.selar();
  return registry;
}

test('ordena dependências antes dos consumidores', () => {
  const registry = makeRegistry([
    { id: 'app', dependsOn: ['service'] },
    { id: 'service', dependsOn: ['db'] },
    { id: 'db' }
  ]);
  assert.deepEqual(criarRuntimeDependencyGraph(registry).order(), ['db', 'service', 'app']);
});

test('detecta dependência inexistente', () => {
  const registry = makeRegistry([{ id: 'app', dependsOn: ['missing'] }]);
  assert.throws(() => criarRuntimeDependencyGraph(registry).order(), /Dependência inexistente/);
});

test('detecta ciclo de dependências', () => {
  const registry = makeRegistry([
    { id: 'a', dependsOn: ['b'] },
    { id: 'b', dependsOn: ['a'] }
  ]);
  assert.throws(() => criarRuntimeDependencyGraph(registry).order(), /Dependência circular/);
});

test('group inicia e encerra segundo o grafo', async () => {
  const registry = makeRegistry([
    { id: 'app', dependsOn: ['service'] },
    { id: 'service', dependsOn: ['db'] },
    { id: 'db' }
  ]);
  const dependencies = criarRuntimeDependencyGraph(registry);
  const events = [];
  const manager = {
    start: async id => events.push(`start:${id}`),
    stop: async id => events.push(`stop:${id}`)
  };
  const group = criarRuntimeManagerGroup({ manager, registry, dependencies });
  await group.startAll();
  await group.stopAll();
  assert.deepEqual(events, [
    'start:db', 'start:service', 'start:app',
    'stop:app', 'stop:service', 'stop:db'
  ]);
});
