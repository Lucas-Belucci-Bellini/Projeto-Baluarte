import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeGroupLifecycle } from '../../v2/core/runtime-group-lifecycle.js';

function makeGroup(outcome = 'ok') {
  return {
    async startAll() {
      if (outcome === 'start-fail') throw new Error('startup failed');
      return ['db', 'api'];
    },
    async stopAll() {
      if (outcome === 'stop-fail') throw new Error('shutdown failed');
    },
  };
}

function makeObservers() {
  const emitted = [];
  const events = { emit: event => emitted.push(event) };
  const supervisor = { snapshot: () => ({ status: 'ready' }) };
  return { emitted, events, supervisor };
}

test('preserva o contrato de startup e publica eventos', async () => {
  const { emitted, events, supervisor } = makeObservers();
  const lifecycle = criarRuntimeGroupLifecycle({ group: makeGroup(), events, supervisor });
  assert.deepEqual(await lifecycle.startAll(), ['db', 'api']);
  assert.deepEqual(emitted.map(event => event.type), ['group.starting', 'group.started']);
  assert.deepEqual(lifecycle.snapshot(), { status: 'ready' });
});

test('publica falha sem engolir o erro original', async () => {
  const { emitted, events, supervisor } = makeObservers();
  const lifecycle = criarRuntimeGroupLifecycle({ group: makeGroup('start-fail'), events, supervisor });
  await assert.rejects(() => lifecycle.startAll(), /startup failed/);
  assert.equal(emitted.at(-1).type, 'group.failed');
  assert.equal(emitted.at(-1).phase, 'start');
});

test('publica parada e falha de shutdown', async () => {
  const { emitted, events, supervisor } = makeObservers();
  const lifecycle = criarRuntimeGroupLifecycle({ group: makeGroup('stop-fail'), events, supervisor });
  await assert.rejects(() => lifecycle.stopAll(), /shutdown failed/);
  assert.deepEqual(emitted.map(event => event.type), ['group.stopping', 'group.failed']);
  assert.equal(emitted.at(-1).phase, 'stop');
});
