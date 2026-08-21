import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  observeServerObservation,
  projectServerObservationToRuntime,
} from '../src/layout/server-observation.ts';

const HEALTH = Object.freeze({
  contractVersion: 'server-health/v1',
  source: 'runtime-observed',
  connection: 'connected',
  health: 'healthy',
  severity: 'none',
  fallback: 'available',
  authority: 'not-authorized',
  ok: true,
  service: 'jarvis-backend',
  model: 'gemini-test',
  hasKey: true,
  detail: 'health observado',
});

const CLAIMS = Object.freeze({
  contractVersion: 'server-claims/v1',
  source: 'server-authority',
  identity: {
    issuerPresent: true,
    subjectPresent: true,
    audienceMatched: true,
    authenticated: true,
    trustedSource: true,
  },
  scopes: {
    requested: ['platform:observe', 'module:read'],
    accepted: ['platform:observe', 'module:read'],
    rejected: [],
  },
  validity: {
    issuedAt: 10_000,
    expiresAt: 20_000,
    ttlMs: 10_000,
    fresh: true,
  },
  requestIdPresent: true,
  decision: 'not-authorized',
  authority: 'not-authorized',
});

function envelope(overrides = {}) {
  return {
    contractVersion: 'server-observation/v1',
    source: 'server-observed',
    health: HEALTH,
    claims: CLAIMS,
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

test('server observation sanitiza campos desconhecidos e preserva autoridade negada', () => {
  const observation = observeServerObservation({
    ...envelope(),
    token: 'must-not-appear',
    claims: { ...CLAIMS, subject: 'must-not-appear' },
  });

  assert.equal(observation.contractVersion, 'server-observation/v1');
  assert.equal(observation.authority, 'not-authorized');
  assert.equal(observation.claims.authority, 'not-authorized');
  assert.equal(observation.claims.decision, 'not-authorized');
  assert.equal('token' in observation, false);
  assert.equal('subject' in observation.claims, false);
  assert.equal(observation.evidence.reasonCodes[0], 'observation-ready');
});

test('server observation ausente projeta runtime desconhecido e read-only', () => {
  const runtime = projectServerObservationToRuntime(null);
  assert.equal(runtime.source, 'runtime-observed');
  assert.equal(runtime.connection, 'unknown');
  assert.equal(runtime.health, 'unknown');
  assert.equal(runtime.severity, 'info');
  assert.equal(runtime.fallback, 'unknown');
  assert.equal(runtime.authority, 'not-authorized');
});

test('claims ausentes ou transporte limitado projetam estado degradado', () => {
  const observation = observeServerObservation(envelope({
    claims: {
      ...CLAIMS,
      identity: { ...CLAIMS.identity, authenticated: false, subjectPresent: false },
      validity: { ...CLAIMS.validity, fresh: false },
    },
    evidence: {
      healthObserved: true,
      claimsObserved: false,
      claimsFresh: false,
      severity: 'warning',
      fallback: 'degraded',
      reasonCodes: ['claims-absent', 'rate-limited', 'unknown'],
    },
    transport: { originAllowed: false, rateLimited: true },
  }));
  const runtime = projectServerObservationToRuntime(observation);
  assert.equal(observation.evidence.reasonCodes.includes('unknown'), false);
  assert.equal(runtime.health, 'degraded');
  assert.equal(runtime.severity, 'warning');
  assert.equal(runtime.fallback, 'degraded');
  assert.equal(runtime.authority, 'not-authorized');
  assert.equal(runtime.detail, 'claims-absent,rate-limited');
});
