import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeModuleRegistry } from '../../v2/core/runtime-module-registry.js';
import { criarRuntimeStateEvents } from '../../v2/core/runtime-state-events.js';
import { criarRuntimeSupervisor } from '../../v2/core/runtime-supervisor.js';

test('supervisor expõe snapshot sem permitir mutação interna', () => {
  const registry = criarRuntimeModuleRegistry();
  registry.registrar('db', {});
  registry.registrar('api', {});
  registry.selar();
  const states = new Map([['db', 'ready'], ['api', 'degraded']]);
  const events = criarRuntimeStateEvents();
  events.emit({ module: 'api', previous: 'ready', current: 'degraded' });
  const supervisor = criarRuntimeSupervisor({
    registry,
    stateOf: id => states.get(id),
    groupStatus: { status: () => 'degraded' },
    events,
    now: () => 42,
  });
  const snapshot = supervisor.snapshot();
  assert.equal(snapshot.capturedAt, 42);
  assert.equal(snapshot.status, 'degraded');
  assert.equal(snapshot.lastEvent.current, 'degraded');
  assert.deepEqual(snapshot.modules, [
    { id: 'db', state: 'ready' },
    { id: 'api', state: 'degraded' },
  ]);
  assert.throws(() => { snapshot.modules.push({ id: 'x', state: 'ready' }); }, TypeError);
});
