import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchServerObservation } from '../../src/security/server-observation-http.ts';

function observation() {
  return {
    contractVersion: 'server-observation/v1',
    source: 'server-observed',
    health: {
      health: 'healthy',
      severity: 'none',
      fallback: 'available',
      connection: 'connected',
      authority: 'not-authorized',
      ok: true,
      service: 'jarvis-backend',
      model: 'test-model',
      hasKey: false,
      detail: 'health observado',
    },
    claims: {
      identity: {
        authenticated: true,
        issuerPresent: true,
        subjectPresent: true,
        audienceMatched: true,
        trustedSource: true,
      },
      scopes: {
        requested: ['platform:observe'],
        accepted: ['platform:observe'],
        rejected: [],
      },
      validity: {
        issuedAt: 1_000,
        expiresAt: 61_000,
        ttlMs: 60_000,
        fresh: true,
      },
      requestIdPresent: true,
      decision: 'not-authorized',
      authority: 'not-authorized',
    },
    evidence: {
      healthObserved: true,
      claimsObserved: true,
      claimsFresh: true,
      severity: 'none',
      fallback: 'available',
      reasonCodes: ['observation-ready'],
    },
    transport: {
      originAllowed: true,
      rateLimited: false,
    },
    authority: 'not-authorized',
  };
}

function response(status, payload, jsonError = false) {
  return {
    status,
    ok: status >= 200 && status < 300,
    async json() {
      if (jsonError) throw new Error('provider body must not escape');
      return payload;
    },
  };
}

test('HTTP observation: ausência ou endpoint inválido não executa rede', async () => {
  let calls = 0;
  const fetcher = async () => {
    calls += 1;
    return response(200, observation());
  };
  const missing = await fetchServerObservation({ fetcher });
  const invalid = await fetchServerObservation({ endpoint: 'javascript:alert(1)', fetcher });
  const query = await fetchServerObservation({ endpoint: 'https://example.test/observe?token=secret', fetcher });
  assert.equal(missing.transport.reasonCode, 'configuration-missing');
  assert.equal(invalid.transport.reasonCode, 'invalid-endpoint');
  assert.equal(query.transport.reasonCode, 'invalid-endpoint');
  assert.equal(calls, 0);
});

test('HTTP observation: usa GET sem body e headers opcionais', async () => {
  let captured;
  const result = await fetchServerObservation({
    endpoint: 'https://example.test/observability/observe',
    accessToken: 'user-token-secret',
    requestId: 'request-42',
    origin: 'https://app.example.test',
    fetcher: async (input, init) => {
      captured = { input, init };
      return response(200, observation());
    },
  });
  assert.equal(result.outcome, 'observed');
  assert.equal(result.transport.reasonCode, 'observed');
  assert.equal(result.transport.statusCode, 200);
  assert.equal(result.projection.state, 'authenticated');
  assert.equal(captured.input.toString(), 'https://example.test/observability/observe');
  assert.equal(captured.init.method, 'GET');
  assert.equal(captured.init.body, undefined);
  assert.equal(captured.init.headers.get('Authorization'), 'Bearer user-token-secret');
  assert.equal(captured.init.headers.get('X-Request-ID'), 'request-42');
  assert.equal(captured.init.headers.get('Origin'), 'https://app.example.test');
  assert.equal(result.authority, 'not-authorized');
  assert.equal(result.publicPromotionAllowed, false);
  assert.equal(JSON.stringify(result).includes('user-token-secret'), false);
});

test('HTTP observation: resposta 429 vira server-rate-limited', async () => {
  const result = await fetchServerObservation({
    endpoint: 'https://example.test/observability/observe',
    fetcher: async () => response(429, { detail: 'secret provider detail' }),
  });
  assert.deepEqual(result.transport, {
    attempted: true,
    statusCode: 429,
    reasonCode: 'server-rate-limited',
  });
  assert.equal(result.outcome, 'unavailable');
  assert.equal(JSON.stringify(result).includes('secret provider detail'), false);
});

test('HTTP observation: outros status HTTP viram http-error sem corpo externo', async () => {
  const result = await fetchServerObservation({
    endpoint: 'https://example.test/observability/observe',
    fetcher: async () => response(503, { detail: 'database password' }),
  });
  assert.equal(result.transport.reasonCode, 'http-error');
  assert.equal(result.transport.statusCode, 503);
  assert.equal(JSON.stringify(result).includes('database password'), false);
});

test('HTTP observation: JSON inválido ou envelope incompatível é invalid-response', async () => {
  const invalidJson = await fetchServerObservation({
    endpoint: 'https://example.test/observability/observe',
    fetcher: async () => response(200, null, true),
  });
  const invalidEnvelope = await fetchServerObservation({
    endpoint: 'https://example.test/observability/observe',
    fetcher: async () => response(200, { contractVersion: 'other/v1' }),
  });
  assert.equal(invalidJson.transport.reasonCode, 'invalid-response');
  assert.equal(invalidEnvelope.transport.reasonCode, 'invalid-response');
  assert.equal(invalidJson.projection.authority, 'not-authorized');
});

test('HTTP observation: erro de rede é redigido e não vaza mensagem', async () => {
  const result = await fetchServerObservation({
    endpoint: 'https://example.test/observability/observe',
    fetcher: async () => {
      throw new Error('socket token=secret-password');
    },
  });
  assert.equal(result.transport.reasonCode, 'network-error');
  assert.equal(result.transport.statusCode, null);
  assert.equal(JSON.stringify(result).includes('secret-password'), false);
});

test('HTTP observation: timeout usa AbortSignal e retorna estado bounded', async () => {
  const started = Date.now();
  const result = await fetchServerObservation({
    endpoint: 'https://example.test/observability/observe',
    timeoutMs: 100,
    fetcher: (_input, init) => new Promise((resolve, reject) => {
      init.signal.addEventListener('abort', () => {
        const error = new Error('raw abort detail');
        error.name = 'AbortError';
        reject(error);
      }, { once: true });
    }),
  });
  assert.equal(result.transport.reasonCode, 'timeout');
  assert.equal(result.outcome, 'unavailable');
  assert.equal(result.transport.attempted, true);
  assert.equal(Date.now() - started >= 90, true);
  assert.equal(JSON.stringify(result).includes('raw abort detail'), false);
});
