import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeModuleRegistry } from '../../v2/core/runtime-module-registry.js';
import { criarRuntimeDependencySpec } from '../../v2/core/runtime-dependency-spec.js';

function registry(entry) {
  const r = criarRuntimeModuleRegistry();
  r.registrar(entry.id, entry);
  r.selar();
  return r;
}

test('string continua significando dependência obrigatória com stop', () => {
  const r = registry({ id: 'api', dependsOn: ['db'] });
  assert.deepEqual(criarRuntimeDependencySpec(r).spec('api'), [{ id: 'db', required: true, failure: 'stop' }]);
});

test('normaliza dependência opcional para degrade', () => {
  const r = registry({ id: 'api', dependsOn: [{ id: 'cache', required: false }] });
  assert.deepEqual(criarRuntimeDependencySpec(r).spec('api'), [{ id: 'cache', required: false, failure: 'degrade' }]);
});

test('aceita política ignore explicitamente', () => {
  const r = registry({ id: 'api', dependsOn: [{ id: 'telemetry', required: false, failure: 'ignore' }] });
  assert.deepEqual(criarRuntimeDependencySpec(r).spec('api'), [{ id: 'telemetry', required: false, failure: 'ignore' }]);
});

test('rejeita política desconhecida', () => {
  const r = registry({ id: 'api', dependsOn: [{ id: 'db', failure: 'restart-everything' }] });
  assert.throws(() => criarRuntimeDependencySpec(r).spec('api'), /Política de falha inválida/);
});
