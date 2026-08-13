import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeStateMachine } from '../../v2/core/runtime-state-machine.js';

test('permite ciclo operacional esperado', () => {
  const machine = criarRuntimeStateMachine();
  machine.transition('starting');
  machine.transition('ready');
  machine.transition('degraded');
  machine.transition('ready');
  machine.transition('stopping');
  machine.transition('stopped');
  assert.equal(machine.state(), 'stopped');
  assert.equal(machine.history().length, 6);
});

test('impede transição inválida', () => {
  const machine = criarRuntimeStateMachine();
  assert.throws(() => machine.transition('ready'), /Transição inválida/);
});

test('falha pode ser recuperada por novo startup', () => {
  const machine = criarRuntimeStateMachine();
  machine.transition('starting');
  machine.transition('failed', { reason: 'health-check' });
  machine.transition('starting');
  assert.equal(machine.state(), 'starting');
});
