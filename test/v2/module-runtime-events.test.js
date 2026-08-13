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
