import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import { createOpenClawHarnessBridge } from '../scripts/openclaw-bridge.mjs';

function listen(server) {
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address())));
}

function close(server) {
  return new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

test('factory harness exige token e rejeita upstream externo', () => {
  assert.throws(() => createOpenClawHarnessBridge({ gatewayUrl: 'https://evil.example', bridgeToken: 'secret' }), /loopback/);
  assert.throws(() => createOpenClawHarnessBridge({ gatewayUrl: 'http://127.0.0.1:18789' }), /token/);
  assert.throws(() => createOpenClawHarnessBridge({ gatewayUrl: 'http://user:pass@127.0.0.1:18789', bridgeToken: 'secret' }), /loopback/);
});

test('harness protege health, CORS e chat sem encaminhar o token', async () => {
  let received = null;
  const upstream = http.createServer((request, response) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', () => {
      received = { headers: request.headers, body: JSON.parse(body) };
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({ choices: [{ message: { content: 'resposta harness' } }] }));
    });
  });
  const upstreamAddress = await listen(upstream);
  const secret = 'harness-secret-123';
  const bridge = createOpenClawHarnessBridge({
    gatewayUrl: `http://127.0.0.1:${upstreamAddress.port}`,
    bridgeToken: secret,
    allowedOrigin: 'http://localhost:5173',
    timeoutMs: 1000,
  });
  const bridgeAddress = await bridge.listen(0);
  const base = `http://127.0.0.1:${bridgeAddress.port}`;

  try {
    const health = await fetch(`${base}/health`, { headers: { origin: 'http://localhost:5173' } });
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { ok: true, mode: 'harness-only', authority: 'not-authorized' });
    assert.equal(health.headers.get('access-control-allow-origin'), 'http://localhost:5173');

    const preflight = await fetch(`${base}/v1/chat/completions`, {
      method: 'OPTIONS',
      headers: { origin: 'http://localhost:5173' },
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), 'http://localhost:5173');

    const missing = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: { origin: 'http://localhost:5173', 'content-type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    });
    assert.equal(missing.status, 401);
    assert.equal((await missing.json()).error, 'bridge_token_required');

    const invalid = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        origin: 'http://localhost:5173',
        'content-type': 'application/json',
        'x-baluarte-bridge-token': 'wrong',
      },
      body: JSON.stringify({ messages: [] }),
    });
    assert.equal(invalid.status, 401);
    assert.equal((await invalid.json()).error, 'bridge_token_invalid');
    assert.equal(received, null);

    const blockedOrigin = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        origin: 'https://evil.example',
        'content-type': 'application/json',
        'x-baluarte-bridge-token': secret,
      },
      body: JSON.stringify({ messages: [] }),
    });
    assert.equal(blockedOrigin.status, 403);

    const invalidPayload = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        origin: 'http://localhost:5173',
        'content-type': 'application/json',
        'x-baluarte-bridge-token': secret,
      },
      body: JSON.stringify({ prompt: 'não aceito' }),
    });
    assert.equal(invalidPayload.status, 400);
    assert.equal((await invalidPayload.json()).error, 'messages_required');

    const response = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        origin: 'http://localhost:5173',
        'content-type': 'application/json',
        'x-baluarte-bridge-token': secret,
      },
      body: JSON.stringify({ model: 'fake', messages: [{ role: 'user', content: 'teste harness' }], secret: 'não encaminhar' }),
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).choices[0].message.content, 'resposta harness');
    assert.equal(received.body.model, 'fake');
    assert.deepEqual(received.body.messages, [{ role: 'user', content: 'teste harness' }]);
    assert.equal(received.body.secret, undefined);
    assert.equal(received.headers['x-baluarte-bridge-token'], undefined);
    assert.equal(JSON.stringify(received).includes(secret), false);
  } finally {
    await bridge.close();
    await close(upstream);
  }
});

test('harness redige erro do upstream e não expõe o token', async () => {
  const bridge = createOpenClawHarnessBridge({
    gatewayUrl: 'http://127.0.0.1:18789',
    bridgeToken: 'harness-secret-456',
    fetchImpl: async () => { throw new Error('segredo interno do upstream'); },
  });
  const bridgeAddress = await bridge.listen(0);
  try {
    const response = await fetch(`http://127.0.0.1:${bridgeAddress.port}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-baluarte-bridge-token': 'harness-secret-456',
      },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'erro' }] }),
    });
    const text = await response.text();
    assert.equal(response.status, 502);
    assert.equal(text.includes('segredo interno'), false);
    assert.equal(text.includes('harness-secret-456'), false);
    assert.equal(text.includes('OpenClaw indisponível'), true);
  } finally {
    await bridge.close();
  }
});
