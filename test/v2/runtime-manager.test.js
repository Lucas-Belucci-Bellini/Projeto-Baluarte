import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeManager } from '../../v2/core/runtime-manager.js';

test('Manager expõe start, stop e status em uma única fachada', async () => {
  const events = [];
  const state = new Map();
  const healthState = new Map();
  const supervisor = {
    iniciar: async id => state.set(id, 'running'),
    parar: async id => state.set(id, 'stopped'),
    estado: id => state.get(id) ?? 'stopped'
  };
  const health = {
    marcarSaudavel: id => healthState.set(id, { status: 'healthy' }),
    estado: id => healthState.get(id) ?? { status: 'unknown' }
  };
  const restart = { reiniciar: async id => { state.set(id, 'running'); return { restarted: true, attempts: 1, delayMs: 10 }; } };
  const api = criarRuntimeManager({ supervisor, restart, health, events: {
    started: id => events.push(`started:${id}`),
    stopped: id => events.push(`stopped:${id}`),
    restarting: id => events.push(`restarting:${id}`),
    failed: id => events.push(`failed:${id}`)
  }});

  await api.start('alpha');
  assert.deepEqual(api.status('alpha'), { id: 'alpha', lifecycle: 'running', health: { status: 'healthy' } });
  await api.stop('alpha');
  assert.equal(api.status('alpha').lifecycle, 'stopped');
  await api.restart('alpha');
  assert.deepEqual(events, ['started:alpha', 'stopped:alpha', 'failed:alpha', 'restarting:alpha']);
});
