import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeEvents } from '../../v2/core/module-runtime-events.js';

test('eventos são estruturados, ordenáveis e não expõem stack trace', () => {
  const events = [];
  const api = criarRuntimeEvents({ clock: () => 123, sink: e => events.push(e) });
  api.opened('alpha');
  api.failed('alpha', new Error('boom'));
  api.restarting('alpha', 2, 200);
  api.exhausted('alpha');
  assert.deepEqual(events, [
    { type: 'runtime.opened', timestamp: 123, id: 'alpha' },
    { type: 'module.failed', timestamp: 123, id: 'alpha', error: 'boom' },
    { type: 'module.restarting', timestamp: 123, id: 'alpha', attempt: 2, delayMs: 200 },
    { type: 'module.restart_exhausted', timestamp: 123, id: 'alpha' }
  ]);
  assert.equal('stack' in events[1], false);
});

test('eventos de grupo registram batches, rollback e falhas de shutdown', () => {
  const events = [];
  const api = criarRuntimeEvents({ clock: () => 456, sink: e => events.push(e) });
  api.groupBatchStarted(0, ['a', 'b']);
  api.groupBatchReady(0, ['a', 'b']);
  api.groupStartupFailed(new Error('startup boom'));
  api.groupRollback(['b', 'a']);
  api.groupBatchStopped(0, ['b', 'a']);
  api.groupShutdownFailed([{ id: 'b', error: new Error('close boom') }]);

  assert.deepEqual(events, [
    { type: 'runtime.group_batch_started', timestamp: 456, index: 0, ids: ['a', 'b'] },
    { type: 'runtime.group_batch_ready', timestamp: 456, index: 0, ids: ['a', 'b'] },
    { type: 'runtime.group_startup_failed', timestamp: 456, error: 'startup boom' },
    { type: 'runtime.group_rollback', timestamp: 456, ids: ['b', 'a'] },
    { type: 'runtime.group_batch_stopped', timestamp: 456, index: 0, ids: ['b', 'a'] },
    { type: 'runtime.group_shutdown_failed', timestamp: 456, errors: [{ id: 'b', error: 'close boom' }] }
  ]);
});
