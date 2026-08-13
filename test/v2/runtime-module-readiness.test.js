import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeReadiness } from '../../v2/core/runtime-module-readiness.js';

test('readiness exige lifecycle running e health healthy', () => {
  const states = new Map([['alpha', { lifecycle: 'running', health: { status: 'healthy' } }]]);
  const manager = { status: id => states.get(id) };
  const readiness = criarRuntimeReadiness({ manager });
  assert.equal(readiness.ready('alpha'), true);
  states.set('alpha', { lifecycle: 'running', health: { status: 'failed' } });
  assert.equal(readiness.ready('alpha'), false);
  assert.throws(() => readiness.assertReady('alpha'), /não está pronto/);
});
