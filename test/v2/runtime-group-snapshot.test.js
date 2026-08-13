import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeModuleRegistry } from '../../v2/core/runtime-module-registry.js';
import { criarRuntimeGroupSnapshot } from '../../v2/core/runtime-group-snapshot.js';

test('captura estados em um snapshot imutável', () => {
  const registry = criarRuntimeModuleRegistry();
  registry.registrar('db', {});
  registry.registrar('api', {});
  registry.selar();
  const states = new Map([['db', 'ready'], ['api', 'degraded']]);
  const snapshot = criarRuntimeGroupSnapshot({ registry, stateOf: id => states.get(id), now: () => 123 });
  const value = snapshot.snapshot();
  assert.equal(value.capturedAt, 123);
  assert.deepEqual(value.modules, [
    { id: 'db', state: 'ready' },
    { id: 'api', state: 'degraded' },
  ]);
  assert.throws(() => { value.modules.push({ id: 'x' }); }, TypeError);
});
