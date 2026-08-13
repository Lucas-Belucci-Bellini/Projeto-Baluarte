import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeRequestClient } from '../../v2/core/runtime-request-client.js';

test('request devolve a resposta do transporte', async () => {
  const client = criarRuntimeRequestClient({ request: async (p) => ({ ok: true, p }) });
  assert.deepEqual(await client.request({ op: 'ping' }), { ok: true, p: { op: 'ping' } });
});

test('timeout libera o cliente para uma próxima requisição', async () => {
  let chamadas = 0;
  const client = criarRuntimeRequestClient({ request: async () => {
    chamadas++;
    if (chamadas === 1) await new Promise(() => {});
    return 'ok';
  } }, { timeoutMs: 5 });

  await assert.rejects(() => client.request({ op: 'slow' }), /timeout/);
  assert.equal(client.ocupado(), false);
  assert.equal(await client.request({ op: 'fast' }), 'ok');
});

test('não permite requests concorrentes', async () => {
  let liberar;
  const client = criarRuntimeRequestClient({ request: () => new Promise(resolve => { liberar = resolve; }) });
  const primeira = client.request({ op: 'first' });
  await assert.rejects(() => client.request({ op: 'second' }), /concorrente/);
  liberar('done');
  assert.equal(await primeira, 'done');
  assert.equal(client.ocupado(), false);
});
