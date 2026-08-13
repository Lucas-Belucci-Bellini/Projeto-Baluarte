import test from 'node:test';
import assert from 'node:assert/strict';
import { esperarRuntimeReady } from '../../v2/core/runtime-readiness-wait.js';

test('espera até readiness sem exceder o timeout', async () => {
  let ready = false;
  let time = 0;
  const result = await esperarRuntimeReady({
    readiness: { ready: () => ready },
    id: 'alpha', timeoutMs: 100, intervalMs: 10,
    now: () => time,
    sleep: async ms => { time += ms; if (time >= 30) ready = true; }
  });
  assert.equal(result.id, 'alpha');
  assert.equal(result.elapsedMs, 30);
});

test('falha com timeout quando módulo nunca fica ready', async () => {
  let time = 0;
  await assert.rejects(
    () => esperarRuntimeReady({ readiness: { ready: () => false }, id: 'alpha', timeoutMs: 30, intervalMs: 10, now: () => time, sleep: async ms => { time += ms; } }),
    /Timeout aguardando readiness/
  );
});
