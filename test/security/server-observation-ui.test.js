import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchServerObservationForUi,
  projectServerObservationHttpToRuntime,
  resolveServerObservationEndpoint,
} from '../../src/security/server-observation-ui.ts';
import { fetchServerObservation } from '../../src/security/server-observation-http.js';

function envelope(overrides = {}) {
  return {
    contractVersion: 'server-observation/v1',
    source: 'server-observed',
    authority: 'not-authorized',
    health: {
      health: 'healthy',
      severity: 'none',
      fallback: 'available',
      connection: 'connected',
      authority: 'not-authorized',
      ok: true,
      service: 'jarvis-backend',
      model: 'redacted-model',
      hasKey: true,
      detail: 'health observed',
    },
    claims: {
      identity: {
        authenticated: true,
        issuerPresent: true,
        subjectPresent: true,
        audienceMatched: true,
        trustedSource: true,
      },
      scopes: { requested: [], accepted: [], rejected: [] },
      validity: { issuedAt: 100, expiresAt: 200, ttlMs: 100000, fresh: true },
      requestIdPresent: false,
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
    transport: { originAllowed: true, rateLimited: false },
    ...overrides,
  };
}

test('wrapper JavaScript expõe o cliente HTTP canônico para Node nativo', async () => {
  const result = await fetchServerObservation({});
  assert.equal(result.contractVersion, 'server-observation-http/v1');
  assert.equal(result.transport.reasonCode, 'configuration-missing');
  assert.equal(result.authority, 'not-authorized');
});

test('resolve endpoint respeita same-origin e servidor local explícito', () => {
  assert.equal(
    resolveServerObservationEndpoint('', 'https://baluarte.example'),
    'https://baluarte.example/api/observability',
  );
  assert.equal(
    resolveServerObservationEndpoint('', 'http://localhost:5173'),
    'http://127.0.0.1:8000/observability/observe',
  );
  assert.equal(
    resolveServerObservationEndpoint('https://api.example/api'),
    'https://api.example/api/observability',
  );
  assert.equal(
    resolveServerObservationEndpoint('https://api.example'),
    'https://api.example/observability/observe',
  );
  assert.equal(resolveServerObservationEndpoint('https://api.example/observe?token=secret'), null);
});

test('observação UI faz GET e projeta somente estado read-only', async () => {
  let captured;
  const result = await fetchServerObservationForUi({
    serverUrl: 'https://api.example/api',
    accessToken: 'secret-token',
    requestId: 'request-1',
    locationOrigin: 'https://baluarte.example',
    fetcher: async (input, init) => {
      captured = { input: input.toString(), init };
      return new Response(JSON.stringify(envelope()), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    },
  });

  assert.equal(captured.input, 'https://api.example/api/observability');
  assert.equal(captured.init.method, 'GET');
  assert.equal(captured.init.body, undefined);
  assert.equal(captured.init.headers.get('Authorization'), 'Bearer secret-token');
  assert.equal(result.result.outcome, 'observed');
  assert.equal(result.observation.health, 'healthy');
  assert.equal(result.observation.authority, 'not-authorized');
  assert.equal(result.observation.detail.includes('secret-token'), false);
  assert.equal(result.result.authority, 'not-authorized');
  assert.equal(result.result.publicPromotionAllowed, false);
});

test('ausência de endpoint não tenta rede e fica em estado desconhecido', async () => {
  let called = false;
  const result = await fetchServerObservationForUi({
    serverUrl: 'javascript:alert(1)',
    fetcher: async () => {
      called = true;
      throw new Error('não deveria chamar');
    },
  });

  assert.equal(called, false);
  assert.equal(result.result.transport.reasonCode, 'configuration-missing');
  assert.equal(result.observation.connection, 'unknown');
  assert.equal(result.observation.health, 'unknown');
  assert.equal(result.observation.authority, 'not-authorized');
});

test('resultado HTTP indisponível projeta falha sem autoridade', () => {
  const observation = projectServerObservationHttpToRuntime({
    contractVersion: 'server-observation-http/v1',
    outcome: 'unavailable',
    projection: {
      contractVersion: 'server-validated-session/v1',
      state: 'unavailable',
      claimsObserved: false,
      claimsFresh: false,
      authenticated: false,
      health: 'unknown',
      fallback: 'unknown',
      acceptedScopes: [],
      rejectedScopes: [],
      reasonCodes: ['observation-unavailable'],
      authority: 'not-authorized',
      publicPromotionAllowed: false,
    },
    transport: { attempted: true, statusCode: 503, reasonCode: 'http-error' },
    authority: 'not-authorized',
    publicPromotionAllowed: false,
  });

  assert.deepEqual(observation, {
    source: 'runtime-observed',
    connection: 'disconnected',
    health: 'failed',
    severity: 'critical',
    fallback: 'blocked',
    authority: 'not-authorized',
    detail: 'server-observation=http-error',
  });
});
