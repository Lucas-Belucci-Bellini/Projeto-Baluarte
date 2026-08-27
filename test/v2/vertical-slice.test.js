import test from 'node:test';
import assert from 'node:assert/strict';
import { criarVerticalSlice } from '../../v2/core/vertical-slice.js';

function registry() {
  return { selado: true, modulo: (id) => id === 'alpha' ? { id } : null };
}

function runtime(trace = null) {
  const calls = [];
  return {
    calls,
    abrir: async (_r, _p, id) => {
      calls.push(`open:${id}`);
      trace?.push(`open:${id}`);
    },
    fechar: async (id) => {
      calls.push(`close:${id}`);
      trace?.push(`close:${id}`);
    }
  };
}

test('vertical slice leva módulo até running e fecha Runtime no stop', async () => {
  const rt = runtime();
  const slice = criarVerticalSlice(registry(), {}, rt);
  const events = [];

  await slice.iniciar('alpha', {
    init: async () => events.push('init'),
    start: async () => events.push('start')
  });

  assert.equal(slice.estado('alpha'), 'running');
  assert.deepEqual(rt.calls, ['open:alpha']);
  assert.deepEqual(events, ['init', 'start']);

  await slice.parar('alpha', {
    stop: async () => events.push('stop'),
    dispose: async () => events.push('dispose')
  });

  assert.equal(slice.estado('alpha'), 'stopped');
  assert.deepEqual(rt.calls, ['open:alpha', 'close:alpha']);
  assert.deepEqual(events, ['init', 'start', 'stop', 'dispose']);
});

test('falha no start fecha Runtime e marca módulo como failed', async () => {
  const rt = runtime();
  const slice = criarVerticalSlice(registry(), {}, rt);
  const events = [];

  await assert.rejects(
    () => slice.iniciar('alpha', {
      init: async () => events.push('init'),
      start: async () => { throw new Error('boom'); },
      dispose: async () => events.push('dispose')
    }),
    /boom/
  );

  assert.equal(slice.estado('alpha'), 'failed');
  assert.deepEqual(events, ['init', 'dispose']);
  assert.deepEqual(rt.calls, ['open:alpha', 'close:alpha']);
});

test('vertical slice fecha Runtime antes de descartar o módulo', async () => {
  const trace = [];
  const rt = runtime(trace);
  const slice = criarVerticalSlice(registry(), {}, rt);

  await slice.iniciar('alpha', {
    init: async () => trace.push('init'),
    start: async () => trace.push('start')
  });
  trace.length = 0;

  await slice.parar('alpha', {
    stop: async () => trace.push('stop'),
    dispose: async () => trace.push('dispose')
  });

  assert.deepEqual(trace, ['stop', 'close:alpha', 'dispose']);
  assert.equal(slice.estado('alpha'), 'stopped');
});

test('não abre Runtime para módulo inexistente', async () => {
  const rt = runtime();
  const slice = criarVerticalSlice(registry(), {}, rt);
  await assert.rejects(() => slice.iniciar('missing'), /módulo não ativo/);
  assert.equal(slice.estado('missing'), 'failed');
  assert.deepEqual(rt.calls, []);
});
