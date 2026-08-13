import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeGroupStatus } from '../../v2/core/runtime-group-status.js';

const batches = { batches: () => [['db'], ['api', 'worker']] };

test('resume grupo pronto quando todos os módulos estão ready', () => {
  const states = new Map([['db', 'ready'], ['api', 'ready'], ['worker', 'ready']]);
  const status = criarRuntimeGroupStatus({ batches, states }).snapshot();
  assert.equal(status.group, 'ready');
  assert.equal(status.modules.length, 3);
});

test('falha tem precedência sobre degradação', () => {
  const states = new Map([['db', 'failed'], ['api', 'degraded'], ['worker', 'ready']]);
  assert.equal(criarRuntimeGroupStatus({ batches, states }).snapshot().group, 'failed');
});

test('bloqueio tem precedência sobre degradação', () => {
  const states = new Map([['db', 'blocked'], ['api', 'degraded'], ['worker', 'ready']]);
  assert.equal(criarRuntimeGroupStatus({ batches, states }).snapshot().group, 'blocked');
});
