import test from 'node:test';
import assert from 'node:assert/strict';
import { criarLifecycleRuntime } from '../../v2/core/module-runtime-lifecycle.js';

test('Runtime abre antes da subida e fecha depois do encerramento', async () => {
  const events = [];
  const registry = {
    selado: true,
    modulo: (id) => id === 'alpha' ? { id } : null
  };
  const runtime = {
    abrir: async (_registry, _permissions, id) => events.push(`runtime:open:${id}`),
    fechar: async (id) => events.push(`runtime:close:${id}`)
  };
  const lifecycle = criarLifecycleRuntime(registry, runtime, {});

  await lifecycle.abrir('alpha');
  events.push('module:init');
  events.push('module:start');
  events.push('module:stop');
  await lifecycle.fechar('alpha');
  events.push('module:dispose');

  assert.deepEqual(events, [
    'runtime:open:alpha',
    'module:init',
    'module:start',
    'module:stop',
    'runtime:close:alpha',
    'module:dispose'
  ]);
});

test('fechar é idempotente para módulo que não está aberto', async () => {
  let fechamentos = 0;
  const lifecycle = criarLifecycleRuntime(
    { selado: true, modulo: () => ({ id: 'alpha' }) },
    { abrir: async () => {}, fechar: async () => { fechamentos++; } },
    {}
  );
  await lifecycle.fechar('alpha');
  assert.equal(fechamentos, 0);
});
