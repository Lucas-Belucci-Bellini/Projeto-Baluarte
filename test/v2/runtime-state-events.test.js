import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeStateEvents } from '../../v2/core/runtime-state-events.js';

test('publica transições e permite unsubscribe', () => {
  const events = criarRuntimeStateEvents();
  const received = [];
  const unsubscribe = events.subscribe(event => received.push(event));
  events.emit({ module: 'api', previous: 'starting', current: 'ready' });
  unsubscribe();
  events.emit({ module: 'api', previous: 'ready', current: 'stopping' });
  assert.equal(received.length, 1);
  assert.equal(received[0].current, 'ready');
  assert.equal(events.history().length, 2);
  assert.equal(events.listenerCount(), 0);
});

test('rejeita listener inválido', () => {
  assert.throws(() => criarRuntimeStateEvents().subscribe(null), /listener inválido/);
});
