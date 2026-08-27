import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  KNOWN_SERVER_CLAIM_SCOPES,
  MAX_SERVER_CLAIMS_TTL_MS,
  SERVER_VALIDATED_CLAIMS_SOURCE,
  observeServerClaims,
} from '../src/layout/server-claims-observation.ts';

const BASE_CLAIMS = Object.freeze({
  issuer: 'baluarte-auth',
  subject: 'operator-test',
  audience: 'baluarte-platform',
  scopes: ['platform:observe', 'module:read', 'module:execute'],
  issuedAt: 10_000,
  expiresAt: 20_000,
  requestId: 'claims-test-0001',
  source: SERVER_VALIDATED_CLAIMS_SOURCE,
  authenticated: true,
});

test('claims ausentes produzem observação negada por padrão', () => {
  const observation = observeServerClaims(null, { nowMs: 12_000 });

  assert.equal(observation.identity.authenticated, false);
  assert.equal(observation.identity.subjectPresent, false);
  assert.equal(observation.identity.trustedSource, false);
  assert.deepEqual(observation.scopes.accepted, []);
  assert.equal(observation.decision, 'not-authorized');
  assert.equal(observation.authority, 'not-authorized');
});

test('claims server-side válidas aceitam somente escopos conhecidos e read-only', () => {
  const observation = observeServerClaims(BASE_CLAIMS, {
    expectedIssuer: 'baluarte-auth',
    expectedAudience: 'baluarte-platform',
    nowMs: 12_000,
  });

  assert.equal(observation.identity.issuerPresent, true);
  assert.equal(observation.identity.issuerMatched, true);
  assert.equal(observation.identity.subjectPresent, true);
  assert.equal(observation.identity.audienceMatched, true);
  assert.equal(observation.identity.authenticated, true);
  assert.equal(observation.identity.trustedSource, true);
  assert.equal(observation.validity.fresh, true);
  assert.deepEqual(observation.scopes.accepted, ['platform:observe', 'module:read']);
  assert.deepEqual(observation.scopes.rejected, ['module:execute']);
  assert.equal(observation.decision, 'not-authorized');
});

test('issuer, audience, origem ou autenticação inválidos zeram os escopos aceitos', () => {
  const observation = observeServerClaims({
    ...BASE_CLAIMS,
    issuer: 'attacker',
    audience: 'other-app',
    source: 'client-input',
    authenticated: false,
  }, {
    expectedIssuer: 'baluarte-auth',
    expectedAudience: 'baluarte-platform',
    nowMs: 12_000,
  });

  assert.equal(observation.identity.issuerMatched, false);
  assert.equal(observation.identity.audienceMatched, false);
  assert.equal(observation.identity.authenticated, false);
  assert.equal(observation.identity.trustedSource, false);
  assert.deepEqual(observation.scopes.accepted, []);
  assert.deepEqual(observation.scopes.rejected, ['platform:observe', 'module:read', 'module:execute']);
});

test('claims futuras, expiradas ou com TTL acima do limite não são frescas', () => {
  const future = observeServerClaims({
    ...BASE_CLAIMS,
    issuedAt: 20_000,
    expiresAt: 30_000,
  }, { nowMs: 12_000 });
  const expired = observeServerClaims({
    ...BASE_CLAIMS,
    issuedAt: 1_000,
    expiresAt: 2_000,
  }, { nowMs: 12_000 });
  const longTtl = observeServerClaims({
    ...BASE_CLAIMS,
    issuedAt: 1_000,
    expiresAt: 1_000 + MAX_SERVER_CLAIMS_TTL_MS + 1,
  }, { nowMs: 12_000 });

  assert.equal(future.validity.fresh, false);
  assert.equal(expired.validity.fresh, false);
  assert.equal(longTtl.validity.fresh, false);
  assert.deepEqual(future.scopes.accepted, []);
  assert.deepEqual(expired.scopes.accepted, []);
  assert.deepEqual(longTtl.scopes.accepted, []);
});

test('lista de escopos é deduplicada e limitada ao catálogo conhecido', () => {
  const observation = observeServerClaims({
    ...BASE_CLAIMS,
    scopes: ['module:read', 'module:read', 'unknown', 'platform:observe'],
  }, { nowMs: 12_000 });

  assert.equal(KNOWN_SERVER_CLAIM_SCOPES.includes('module:read'), true);
  assert.deepEqual(observation.scopes.requested, ['module:read', 'unknown', 'platform:observe']);
  assert.deepEqual(observation.scopes.accepted, ['module:read', 'platform:observe']);
  assert.deepEqual(observation.scopes.rejected, ['unknown']);
});
