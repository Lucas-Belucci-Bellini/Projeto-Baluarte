import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeGroupStatus } from '../../v2/core/runtime-group-status.js';
import { criarRuntimeModuleRegistry } from '../../v2/core/runtime-module-registry.js';
import { criarRuntimeStateEvents } from '../../v2/core/runtime-state-events.js';
import { criarRuntimeSupervisor } from '../../v2/core/runtime-supervisor.js';

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

test('status coletivo real alimenta o supervisor sem remover o snapshot legado', () => {
  const registry = criarRuntimeModuleRegistry();
  registry.registrar('db', { role: 'storage' });
  registry.registrar('api', { role: 'service' });
  registry.registrar('worker', { role: 'worker' });
  registry.selar();

  const states = new Map([
    ['db', 'ready'],
    ['api', 'ready'],
    ['worker', 'ready'],
  ]);
  const groupStatus = criarRuntimeGroupStatus({ batches, states });
  const events = criarRuntimeStateEvents();
  events.emit({ type: 'runtime.group.ready', group: 'core' });
  const supervisor = criarRuntimeSupervisor({
    registry,
    stateOf: id => states.get(id),
    groupStatus,
    events,
    now: () => 99,
  });

  assert.equal(groupStatus.status(), 'ready');
  assert.equal(groupStatus.snapshot().group, 'ready');
  assert.deepEqual(supervisor.snapshot(), {
    capturedAt: 99,
    status: 'ready',
    modules: [
      { id: 'db', state: 'ready' },
      { id: 'api', state: 'ready' },
      { id: 'worker', state: 'ready' },
    ],
    lastEvent: { type: 'runtime.group.ready', group: 'core' },
  });
});
