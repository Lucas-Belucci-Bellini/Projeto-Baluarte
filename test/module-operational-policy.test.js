import test from 'node:test';
import assert from 'node:assert/strict';
import { observeServerClaims } from '../src/layout/server-claims-observation.ts';
import { projectModuleOperationalPolicy, projectModuleOperationalPolicyMap } from '../src/layout/module-operational-policy.ts';

const nowMs = 100_000;

function health(mode, status = mode === 'healthy' ? 'healthy' : 'failed') {
  return {
    id: 'alpha',
    mode,
    status,
    restarts: mode === 'quarantined' ? 4 : 0,
    podeReiniciar: mode !== 'quarantined' && mode !== 'disabled',
  };
}

function validClaims(scopes = ['module:read']) {
  return observeServerClaims({
    issuer: 'baluarte-auth',
    subject: 'operator-test',
    audience: 'baluarte-platform',
    scopes,
    issuedAt: nowMs - 1_000,
    expiresAt: nowMs + 10_000,
    requestId: 'claims-test',
    source: 'server-validated',
    authenticated: true,
  }, {
    expectedIssuer: 'baluarte-auth',
    expectedAudience: 'baluarte-platform',
    nowMs,
  });
}

test('módulo saudável habilita o botão, mas continua sem revisão elevada sem claims', () => {
  const decision = projectModuleOperationalPolicy({ moduleId: 'alpha', health: health('healthy') });
  assert.equal(decision.button, 'enabled');
  assert.equal(decision.elevatedReview, 'unavailable');
  assert.ok(decision.reasons.includes('module-healthy'));
  assert.ok(decision.reasons.includes('claims-missing'));
  assert.equal(decision.normalUserAction, 'preserve-current-surface');
  assert.equal(decision.fallback, 'v1-preserved');
});

test('degraded, quarantined, maintenance and disabled modules disable the normal button', () => {
  for (const [mode, status, reason] of [
    ['degraded', 'failed', 'module-degraded'],
    ['quarantined', 'exhausted', 'module-quarantined'],
    ['maintenance', 'healthy', 'module-maintenance'],
    ['disabled', 'healthy', 'module-disabled'],
  ]) {
    const decision = projectModuleOperationalPolicy({ moduleId: 'alpha', health: health(mode, status) });
    assert.equal(decision.button, 'disabled', mode);
    assert.ok(decision.reasons.includes(reason), mode);
    assert.equal(decision.fallback, 'v1-preserved');
    assert.equal(decision.publicPromotionAllowed, false);
  }
});

test('registered, unregistered and inconsistent health stay disabled', () => {
  assert.equal(projectModuleOperationalPolicy({ moduleId: 'alpha', health: health('registered', 'unknown') }).button, 'disabled');
  assert.ok(projectModuleOperationalPolicy({ moduleId: 'alpha', health: health('unregistered', 'unregistered') }).reasons.includes('module-unregistered'));
  assert.ok(projectModuleOperationalPolicy({ moduleId: 'alpha', health: health('healthy', 'failed') }).reasons.includes('module-not-ready'));
  assert.ok(projectModuleOperationalPolicy({ moduleId: 'alpha', health: null }).reasons.includes('module-not-ready'));
});

test('fresh server-validated module:read is only review-only evidence, never authorization', () => {
  const decision = projectModuleOperationalPolicy({ moduleId: 'alpha', health: health('quarantined', 'exhausted'), claims: validClaims() });
  assert.equal(decision.button, 'disabled');
  assert.equal(decision.elevatedReview, 'review-only');
  assert.ok(decision.reasons.includes('review-only-observation'));
  assert.equal(decision.authority, 'not-authorized');
  assert.equal(decision.publicPromotionAllowed, false);
});

test('stale, untrusted or scope-less claims cannot produce elevated review', () => {
  const stale = observeServerClaims({
    issuer: 'baluarte-auth', subject: 'operator-test', audience: 'baluarte-platform',
    scopes: ['module:read'], issuedAt: 1, expiresAt: 2,
    source: 'server-validated', authenticated: true,
  }, { expectedIssuer: 'baluarte-auth', expectedAudience: 'baluarte-platform', nowMs });
  const untrusted = observeServerClaims({
    issuer: 'baluarte-auth', subject: 'operator-test', audience: 'baluarte-platform',
    scopes: ['module:read'], issuedAt: nowMs - 1_000, expiresAt: nowMs + 10_000,
    source: 'client-input', authenticated: true,
  }, { expectedIssuer: 'baluarte-auth', expectedAudience: 'baluarte-platform', nowMs });
  const scopeLess = validClaims(['platform:observe']);
  for (const claims of [stale, untrusted, scopeLess]) {
    const decision = projectModuleOperationalPolicy({ moduleId: 'alpha', health: health('degraded'), claims });
    assert.equal(decision.elevatedReview, 'unavailable');
    assert.equal(decision.button, 'disabled');
    assert.equal(decision.authority, 'not-authorized');
  }
  assert.ok(projectModuleOperationalPolicy({ moduleId: 'alpha', health: health('degraded'), claims: stale }).reasons.includes('claims-stale'));
  assert.ok(projectModuleOperationalPolicy({ moduleId: 'alpha', health: health('degraded'), claims: untrusted }).reasons.includes('claims-untrusted'));
  assert.ok(projectModuleOperationalPolicy({ moduleId: 'alpha', health: health('degraded'), claims: scopeLess }).reasons.includes('module-read-scope-missing'));
});

test('policy map preserves order and never leaks claims identifiers into reasons', () => {
  const decisions = projectModuleOperationalPolicyMap([
    { moduleId: 'alpha', health: health('healthy'), claims: validClaims() },
    { moduleId: 'beta', health: health('disabled'), claims: null },
  ]);
  assert.deepEqual(decisions.map((decision) => decision.moduleId), ['alpha', 'beta']);
  assert.equal(decisions[0].elevatedReview, 'review-only');
  assert.equal(decisions[1].button, 'disabled');
  assert.ok(!JSON.stringify(decisions.map((decision) => decision.reasons)).includes('operator-test'));
  assert.ok(!JSON.stringify(decisions.map((decision) => decision.reasons)).includes('claims-test'));
});
