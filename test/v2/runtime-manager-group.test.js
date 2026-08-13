import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeModuleRegistry } from '../../v2/core/runtime-module-registry.js';
import { criarRuntimeDependencyGraph } from '../../v2/core/runtime-module-dependencies.js';
import { criarRuntimeDependencyBatches } from '../../v2/core/runtime-module-batches.js';
import { criarRuntimeManagerGroup } from '../../v2/core/runtime-manager-group.js';

function registry(ids) {
  const r = criarRuntimeModuleRegistry();
  for (const id of ids) r.registrar(id);
  r.selar();
  return r;
}

function groupFor(r, manager) {
  return criarRuntimeManagerGroup({
    manager,
    registry: r,
    dependencies: criarRuntimeDependencyGraph(r),
    batches: criarRuntimeDependencyBatches(r)
  });
}

test('registry sela e impede novos módulos', () => {
  const r = registry(['a']);
  assert.equal(r.listar().length, 1);
  assert.throws(() => r.registrar('b'), /selado/);
});

test('startAll inicia a ordem do batch e stopAll encerra na ordem reversa', async () => {
  const events = [];
  const r = registry(['a', 'b', 'c']);
  const manager = {
    start: async id => events.push(`start:${id}`),
    stop: async id => events.push(`stop:${id}`)
  };
  const group = groupFor(r, manager);
  await group.startAll();
  await group.stopAll();
  assert.deepEqual(events, ['start:a', 'start:b', 'start:c', 'stop:c', 'stop:b', 'stop:a']);
});

test('falha no startup faz rollback dos módulos já iniciados', async () => {
  const events = [];
  const r = registry(['a', 'b', 'c']);
  const manager = {
    start: async id => { events.push(`start:${id}`); if (id === 'c') throw new Error('boom'); },
    stop: async id => events.push(`stop:${id}`)
  };
  const group = groupFor(r, manager);
  await assert.rejects(() => group.startAll(), /boom/);
  assert.deepEqual(events, ['start:a', 'start:b', 'start:c', 'stop:b', 'stop:a']);
});

test('stopAll tenta todos e agrega falhas', async () => {
  const r = registry(['a', 'b']);
  const manager = {
    start: async () => {},
    stop: async id => { if (id === 'b') throw new Error('close failed'); }
  };
  const group = groupFor(r, manager);
  await assert.rejects(() => group.stopAll(), error => error instanceof AggregateError && error.details[0].id === 'b');
});
