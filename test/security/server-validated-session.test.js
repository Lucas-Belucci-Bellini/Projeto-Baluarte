import assert from 'node:assert/strict';
import test from 'node:test';
import { projectServerValidatedSession } from '../../src/security/server-validated-session.ts';

function observation(overrides = {}) {
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
        requested: ['platform:observe', 'module:read', 'unknown:scope'],
        accepted: ['platform:observe', 'module:read'],
        rejected: ['unknown:scope'],
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
    ...overrides,
  };
}

test('server session: projeta identidade server-validated sem credenciais', () => {
  const result = projectServerValidatedSession(observation());
  assert.equal(result.contractVersion, 'server-validated-session/v1');
  assert.equal(result.state, 'authenticated');
  assert.equal(result.authenticated, true);
  assert.deepEqual(result.acceptedScopes, ['platform:observe', 'module:read']);
  assert.deepEqual(result.rejectedScopes, []);
  assert.deepEqual(result.reasonCodes, ['session-observed']);
  assert.equal(result.authority, 'not-authorized');
  assert.equal(result.publicPromotionAllowed, false);
  assert.equal('access_token' in result, false);
  assert.equal('subject' in result, false);
  assert.equal('role' in result, false);
});

test('server session: claims não observados caem em unavailable', () => {
  const value = observation({
    claims: {
      ...observation().claims,
      identity: { ...observation().claims.identity, authenticated: false },
    },
    evidence: { ...observation().evidence, claimsObserved: false, claimsFresh: false },
  });
  const result = projectServerValidatedSession(value);
  assert.equal(result.state, 'unavailable');
  assert.equal(result.authenticated, false);
  assert.deepEqual(result.reasonCodes, ['claims-unobserved']);
});

test('server session: identidade anônima observada não vira authenticated', () => {
  const base = observation();
  const result = projectServerValidatedSession({
    ...base,
    claims: {
      ...base.claims,
      identity: { ...base.claims.identity, authenticated: false },
    },
  });
  assert.equal(result.state, 'anonymous');
  assert.equal(result.authenticated, false);
  assert.deepEqual(result.reasonCodes, ['anonymous-identity']);
});

test('server session: claims stale exigem nova observação', () => {
  const base = observation();
  const result = projectServerValidatedSession({
    ...base,
    claims: { ...base.claims, validity: { ...base.claims.validity, fresh: false } },
    evidence: { ...base.evidence, claimsFresh: false },
  });
  assert.equal(result.state, 'stale');
  assert.equal(result.claimsFresh, false);
  assert.deepEqual(result.reasonCodes, ['claims-stale']);
});

test('server session: health degraded nunca promove a sessão', () => {
  const base = observation();
  const result = projectServerValidatedSession({
    ...base,
    health: { ...base.health, health: 'degraded', severity: 'warning', fallback: 'degraded' },
    evidence: { ...base.evidence, fallback: 'degraded', severity: 'warning' },
  });
  assert.equal(result.state, 'degraded');
  assert.equal(result.authenticated, true);
  assert.deepEqual(result.reasonCodes, ['health-degraded', 'fallback-degraded']);
  assert.equal(result.publicPromotionAllowed, false);
});

test('server session: rate limit cai em unavailable e não aceita scopes', () => {
  const base = observation();
  const result = projectServerValidatedSession({
    ...base,
    transport: { ...base.transport, rateLimited: true },
  });
  assert.equal(result.state, 'unavailable');
  assert.deepEqual(result.reasonCodes, ['rate-limited']);
  assert.deepEqual(result.acceptedScopes, ['platform:observe', 'module:read']);
  assert.equal(result.authority, 'not-authorized');
});

test('server session: fallback blocked permanece neutro', () => {
  const base = observation();
  const result = projectServerValidatedSession({
    ...base,
    evidence: { ...base.evidence, fallback: 'blocked' },
  });
  assert.equal(result.state, 'unavailable');
  assert.deepEqual(result.reasonCodes, ['fallback-blocked']);
});

test('server session: payload ausente, malformado ou com autoridade divergente é rejeitado', () => {
  assert.equal(projectServerValidatedSession(null).state, 'unavailable');
  assert.deepEqual(projectServerValidatedSession({}).reasonCodes, ['observation-unavailable']);
  assert.deepEqual(
    projectServerValidatedSession({ ...observation(), authority: 'authorized' }).reasonCodes,
    ['authority-mismatch'],
  );
});
