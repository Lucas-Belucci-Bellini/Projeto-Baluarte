import assert from 'node:assert/strict';
import test from 'node:test';
import { observeServerClaims } from '../src/layout/server-claims-observation.ts';
import { projectIdentityRelease } from '../src/security/auth-identity-release.ts';

const NOW = 1_700_000_000_000;

function freshClaims(scopes = ['platform:observe']) {
  return observeServerClaims({
    issuer: 'https://auth.example',
    subject: 'subject-identity-test',
    audience: 'baluarte',
    scopes,
    issuedAt: NOW - 1_000,
    expiresAt: NOW + 30_000,
    requestId: 'request-identity-test',
    source: 'server-validated',
    authenticated: true,
  }, {
    expectedIssuer: 'https://auth.example',
    expectedAudience: 'baluarte',
    nowMs: NOW,
  });
}

function role(role, source = 'server-app_metadata') {
  return { role, source };
}

test('usuário com role app_metadata vê superfície normal de módulo saudável', () => {
  const result = projectIdentityRelease(freshClaims(), role('user'), { mode: 'healthy' });
  assert.equal(result.projection, 'normal-surface');
  assert.equal(result.role, 'user');
  assert.equal(result.moduleMode, 'healthy');
  assert.equal(result.decision, 'not-authorized');
  assert.equal(result.publicPromotionAllowed, false);
});

test('usuário comum não acessa módulo degraded ou quarantined', () => {
  for (const mode of ['degraded', 'quarantined', 'maintenance', 'disabled', 'unregistered']) {
    const result = projectIdentityRelease(freshClaims(), role('user'), { mode });
    assert.equal(result.projection, 'disabled');
    assert.ok(result.reasons.includes('module-degraded'));
    assert.ok(result.reasons.includes('user-module-disabled'));
  }
});

test('admin, dev e owner recebem somente revisão elevada com module:read', () => {
  for (const elevatedRole of ['admin', 'dev', 'owner']) {
    const result = projectIdentityRelease(freshClaims(['platform:observe', 'module:read']), role(elevatedRole), { mode: 'quarantined' });
    assert.equal(result.projection, 'elevated-review-only');
    assert.equal(result.role, elevatedRole);
    assert.equal(result.authority, 'not-authorized');
    assert.equal(result.publicPromotionAllowed, false);
  }
});

test('role elevada sem module:read continua desabilitada', () => {
  const result = projectIdentityRelease(freshClaims(), role('admin'), { mode: 'degraded' });
  assert.equal(result.projection, 'disabled');
  assert.ok(result.reasons.includes('module-read-scope-missing'));
});

test('user_metadata não concede role administrativa', () => {
  const result = projectIdentityRelease(freshClaims(['platform:observe', 'module:read']), {
    role: 'admin',
    source: 'user_metadata',
    userMetadataRole: 'admin',
  }, { mode: 'quarantined' });
  assert.equal(result.projection, 'disabled');
  assert.equal(result.role, 'unknown');
  assert.ok(result.reasons.includes('role-source-invalid'));
  assert.ok(result.reasons.includes('user-metadata-ignored'));
});

test('claims ausentes ou expiradas não liberam módulo saudável', () => {
  const absent = projectIdentityRelease(null, role('admin'), { mode: 'healthy' });
  assert.equal(absent.projection, 'disabled');
  assert.ok(absent.reasons.includes('claims-missing'));

  const expiredClaims = observeServerClaims({
    issuer: 'https://auth.example',
    subject: 'subject-identity-test',
    audience: 'baluarte',
    scopes: ['platform:observe'],
    issuedAt: NOW - 120_000,
    expiresAt: NOW - 60_000,
    source: 'server-validated',
    authenticated: true,
  }, { expectedIssuer: 'https://auth.example', expectedAudience: 'baluarte', nowMs: NOW });
  const expired = projectIdentityRelease(expiredClaims, role('admin'), { mode: 'healthy' });
  assert.equal(expired.projection, 'disabled');
  assert.ok(expired.reasons.includes('claims-stale'));
});

test('issuer ou audience incompatíveis não liberam módulo saudável', () => {
  const wrongIssuerClaims = observeServerClaims({
    issuer: 'https://attacker.example',
    subject: 'subject-identity-test',
    audience: 'baluarte',
    scopes: ['platform:observe'],
    issuedAt: NOW - 1_000,
    expiresAt: NOW + 30_000,
    requestId: 'request-wrong-issuer',
    source: 'server-validated',
    authenticated: true,
  }, {
    expectedIssuer: 'https://auth.example',
    expectedAudience: 'baluarte',
    nowMs: NOW,
  });
  const wrongIssuer = projectIdentityRelease(wrongIssuerClaims, role('admin'), { mode: 'healthy' });
  assert.equal(wrongIssuer.projection, 'disabled');
  assert.ok(wrongIssuer.reasons.includes('claims-untrusted'));
  assert.equal(wrongIssuer.publicPromotionAllowed, false);

  const wrongAudienceClaims = observeServerClaims({
    issuer: 'https://auth.example',
    subject: 'subject-identity-test',
    audience: 'other-service',
    scopes: ['platform:observe'],
    issuedAt: NOW - 1_000,
    expiresAt: NOW + 30_000,
    requestId: 'request-wrong-audience',
    source: 'server-validated',
    authenticated: true,
  }, {
    expectedIssuer: 'https://auth.example',
    expectedAudience: 'baluarte',
    nowMs: NOW,
  });
  const wrongAudience = projectIdentityRelease(wrongAudienceClaims, role('admin'), { mode: 'healthy' });
  assert.equal(wrongAudience.projection, 'disabled');
  assert.ok(wrongAudience.reasons.includes('claims-untrusted'));
  assert.equal(wrongAudience.publicPromotionAllowed, false);
});

test('modo desconhecido é tratado como disabled e a saída não expõe identidade', () => {
  const result = projectIdentityRelease(freshClaims(), role('user'), { mode: 'modo-secreto' });
  const serialized = JSON.stringify(result);
  assert.equal(result.projection, 'disabled');
  assert.equal(result.moduleMode, 'disabled');
  assert.ok(result.reasons.includes('module-mode-unknown'));
  assert.equal(serialized.includes('subject-identity-test'), false);
  assert.equal(serialized.includes('auth.example'), false);
  assert.equal(serialized.includes('server-app_metadata'), false);
  assert.equal(result.authority, 'not-authorized');
  assert.equal(result.publicPromotionAllowed, false);
});
