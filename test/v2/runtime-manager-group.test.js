import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeModuleRegistry } from '../../v2/core/runtime-module-registry.js';
import { criarRuntimeDependencyGraph } from '../../v2/core/runtime-module-dependencies.js';
import { criarRuntimeDependencyBatches } from '../../v2/core/runtime-module-batches.js';
import { criarRuntimeManagerGroup } from '../../v2/core/runtime-manager-group.js';

function registry(entries) {
  const r = criarRuntimeModuleRegistry();
  for (const entry of entries) {
    if (typeof entry === 'string') r.registrar(entry);
    else r.registrar(entry.id, { dependsOn: entry.dependsOn ?? [] });
  }
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

test('recusa precedência divergente antes de iniciar ou encerrar módulos', async () => {
  const r = registry([{ id: 'a' }, { id: 'b', dependsOn: ['a'] }]);
  let starts = 0;
  let stops = 0;
  const group = criarRuntimeManagerGroup({
    manager: {
      start: async () => { starts += 1; },
      stop: async () => { stops += 1; }
    },
    registry: r,
    dependencies: { order: () => ['b', 'a'] },
    batches: { batches: () => [['a'], ['b']] }
  });
  await assert.rejects(() => group.startAll(), error => {
    assert.match(error.message, /Plano de dependências e batches divergentes/);
    assert.deepEqual(error.details, { order: ['b', 'a'], batches: [['a'], ['b']] });
    return true;
  });
  await assert.rejects(() => group.stopAll(), /Plano de dependências e batches divergentes/);
  assert.equal(starts, 0);
  assert.equal(stops, 0);
});

test('aceita independentes registrados em ordem diferente da ordenação do batch', async () => {
  const r = registry(['b', 'a']);
  const calls = [];
  const group = groupFor(r, {
    start: async id => calls.push(`start:${id}`),
    stop: async id => calls.push(`stop:${id}`)
  });
  await group.startAll();
  await group.stopAll();
  assert.deepEqual(calls, ['start:a', 'start:b', 'stop:b', 'stop:a']);
});

test('recusa IDs repetidos no plano antes de iniciar módulos', async () => {
  const r = registry(['a', 'b']);
  let starts = 0;
  const group = criarRuntimeManagerGroup({
    manager: { start: async () => { starts += 1; }, stop: async () => {} },
    registry: r,
    dependencies: { order: () => ['a', 'b'] },
    batches: { batches: () => [['a'], ['a', 'b']] }
  });
  await assert.rejects(() => group.startAll(), error => {
    assert.match(error.message, /Plano de dependências e batches divergentes/);
    assert.deepEqual(error.details, { order: ['a', 'b'], batches: [['a'], ['a', 'b']] });
    return true;
  });
  assert.equal(starts, 0);
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
