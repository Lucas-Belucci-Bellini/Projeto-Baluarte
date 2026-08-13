import test from 'node:test';
import assert from 'node:assert/strict';
import { criarModuleRuntimeSupervisor } from '../../v2/core/module-runtime-supervisor.js';

function setup(hooks = {}) {
  const events = [];
  const lifecycle = {
    abrir: async (id) => events.push(`runtime:open:${id}`),
    fechar: async (id) => events.push(`runtime:close:${id}`)
  };
  const merged = {};
  for (const name of ['init', 'start', 'stop', 'dispose']) {
    const fn = hooks[name];
    merged[name] = async (id) => {
      events.push(`${name}:${id}`);
      await fn?.(id);
    };
  }
  return { supervisor: criarModuleRuntimeSupervisor(lifecycle, merged), events };
}

test('iniciar executa Runtime, init e start nessa ordem', async () => {
  const { supervisor, events } = setup();
  await supervisor.iniciar('alpha');
  assert.deepEqual(events, ['runtime:open:alpha', 'init:alpha', 'start:alpha']);
  assert.equal(supervisor.estado('alpha'), 'running');
});

test('falha no start faz cleanup e marca failed', async () => {
  const { supervisor, events } = setup({ start: async () => { throw new Error('boom'); } });
  await assert.rejects(() => supervisor.iniciar('alpha'), /boom/);
  assert.deepEqual(events, ['runtime:open:alpha', 'init:alpha', 'start:alpha', 'runtime:close:alpha', 'dispose:alpha']);
  assert.equal(supervisor.estado('alpha'), 'failed');
});

test('parar executa stop, fecha Runtime e depois dispose', async () => {
  const { supervisor, events } = setup();
  await supervisor.iniciar('alpha');
  events.length = 0;
  await supervisor.parar('alpha');
  assert.deepEqual(events, ['stop:alpha', 'runtime:close:alpha', 'dispose:alpha']);
  assert.equal(supervisor.estado('alpha'), 'stopped');
});

test('iniciar repetido enquanto running não duplica lifecycle', async () => {
  const { supervisor, events } = setup();
  await supervisor.iniciar('alpha');
  await supervisor.iniciar('alpha');
  assert.equal(events.filter(e => e === 'runtime:open:alpha').length, 1);
});
