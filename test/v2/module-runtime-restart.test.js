import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeRestart } from '../../v2/core/module-runtime-restart.js';

function make() {
  const events = [];
  let state = 'running';
  const supervisor = {
    iniciar: async (id) => { events.push(`start:${id}`); state = 'running'; },
    parar: async (id) => { events.push(`stop:${id}`); state = 'stopped'; }
  };
  const healthState = { status: 'healthy', restarts: [] };
  const health = {
    estado: () => healthState,
    marcarFalha: (_id, error) => {
      healthState.restarts.push(Date.now());
      healthState.status = healthState.restarts.length > 3 ? 'exhausted' : 'failed';
      healthState.lastError = error;
      return healthState.status !== 'exhausted';
    },
    podeReiniciar: () => healthState.status !== 'exhausted',
    marcarSaudavel: () => { healthState.status = 'healthy'; }
  };
  return { events, supervisor, health, state: () => state };
}

test('restart faz cleanup, aplica backoff e inicia novamente', async () => {
  const ctx = make();
  const delays = [];
  const restart = criarRuntimeRestart({ ...ctx, sleep: async ms => delays.push(ms), baseDelayMs: 10 });
  const result = await restart.reiniciar('alpha', new Error('boom'));
  assert.deepEqual(ctx.events, ['stop:alpha', 'start:alpha']);
  assert.deepEqual(delays, [10]);
  assert.equal(result.restarted, true);
  assert.equal(ctx.state(), 'running');
  assert.equal(ctx.health.estado().status, 'healthy');
});

test('backoff cresce com as tentativas', async () => {
  const ctx = make();
  const delays = [];
  const restart = criarRuntimeRestart({ ...ctx, sleep: async ms => delays.push(ms), baseDelayMs: 10 });
  await restart.reiniciar('alpha', new Error('1'));
  await restart.reiniciar('alpha', new Error('2'));
  assert.deepEqual(delays, [10, 20]);
});
