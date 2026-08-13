import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeModuleRegistry } from '../../v2/core/runtime-module-registry.js';
import { criarRuntimeFailurePolicy } from '../../v2/core/runtime-failure-policy.js';

function makeRegistry(entries) {
  const registry = criarRuntimeModuleRegistry();
  for (const entry of entries) registry.registrar(entry.id, { dependsOn: entry.dependsOn ?? [] });
  registry.selar();
  return registry;
}

test('encontra consumidores diretos', () => {
  const registry = makeRegistry([
    { id: 'db' }, { id: 'api', dependsOn: ['db'] }, { id: 'worker', dependsOn: ['db'] }, { id: 'ui', dependsOn: ['api'] }
  ]);
  const policy = criarRuntimeFailurePolicy(registry);
  assert.deepEqual(policy.dependentsOf('db'), ['api', 'worker']);
});

test('calcula impacto transitivo de uma falha', () => {
  const registry = makeRegistry([
    { id: 'db' }, { id: 'api', dependsOn: ['db'] }, { id: 'worker', dependsOn: ['db'] }, { id: 'ui', dependsOn: ['api'] }
  ]);
  const policy = criarRuntimeFailurePolicy(registry);
  assert.deepEqual(policy.impacto('db').sort(), ['api', 'ui', 'worker']);
});
