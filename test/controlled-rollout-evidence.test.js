import { test } from 'node:test';
import assert from 'node:assert/strict';

import { evaluateControlledRolloutEvidence } from '../src/layout/controlled-rollout-evidence.ts';

const ALIGNMENT = Object.freeze({
  moduleId: 'editor',
  path: '/editor',
  outcome: 'promotion-candidate',
  allowPublicPromotion: true,
  normalUserAction: 'preserve-current-surface',
  reasons: [],
  evidence: {
    health: { mode: 'healthy', status: 'healthy', source: 'server-authority' },
    deepLink: 'verified',
    fallback: 'v1-preserved',
  },
});

const ROLLBACK = Object.freeze({
  reversible: true,
  fallbackPath: '/editor',
  rollbackReference: 'commit:editor-pilot-1',
});

const AUTHORITY = Object.freeze({
  source: 'server-claims',
  permitted: true,
  actorRole: 'developer',
  requestId: 'req-editor-1',
  auditId: 'audit-editor-1',
});

const READY_OBSERVATION = Object.freeze({
  contractVersion: 'server-observation/v1',
  source: 'server-observed',
  health: {
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
  },
  claims: {
    contractVersion: 'server-claims/v1',
    source: 'server-authority',
    identity: {
      issuerPresent: true,
      subjectPresent: true,
      audienceMatched: true,
      authenticated: true,
      trustedSource: true,
    },
    scopes: { requested: ['platform:observe'], accepted: ['platform:observe'], rejected: [] },
    validity: { issuedAt: 10_000, expiresAt: 20_000, ttlMs: 10_000, fresh: true },
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
  transport: { originAllowed: true, rateLimited: false },
  authority: 'not-authorized',
});

test('observação ausente bloqueia mesmo com autoridade e rollback válidos', () => {
  const decision = evaluateControlledRolloutEvidence({
    alignment: ALIGNMENT,
    observation: null,
    authority: AUTHORITY,
    rollback: ROLLBACK,
  });
  assert.equal(decision.observationReady, false);
  assert.equal(decision.status, 'blocked');
  assert.equal(decision.eligibleForControlledRollout, false);
  assert.equal(decision.publicPromotionAllowed, false);
  assert.equal(decision.normalUserAction, 'preserve-current-surface');
  assert.ok(decision.reasons.some((reason) => /server-observation ausente/.test(reason)));
});

test('observação pronta não substitui autoridade server-claims', () => {
  const decision = evaluateControlledRolloutEvidence({
    alignment: ALIGNMENT,
    observation: READY_OBSERVATION,
    authority: { ...AUTHORITY, source: 'unknown', permitted: false, actorRole: 'unknown', requestId: null, auditId: null },
    rollback: ROLLBACK,
  });
  assert.equal(decision.observationReady, true);
  assert.equal(decision.status, 'blocked');
  assert.equal(decision.eligibleForControlledRollout, false);
  assert.ok(decision.reasons.some((reason) => /claims server-side/.test(reason)));
});

test('autoridade válida não supera rollback inválido', () => {
  const decision = evaluateControlledRolloutEvidence({
    alignment: ALIGNMENT,
    observation: READY_OBSERVATION,
    authority: AUTHORITY,
    rollback: { ...ROLLBACK, reversible: false, fallbackPath: '', rollbackReference: '' },
  });
  assert.equal(decision.observationReady, true);
  assert.equal(decision.status, 'blocked');
  assert.equal(decision.eligibleForControlledRollout, false);
  assert.ok(decision.reasons.some((reason) => /rollback/.test(reason)));
});

test('todas as evidências permitem somente rollout controlado e nunca promoção pública', () => {
  const decision = evaluateControlledRolloutEvidence({
    alignment: ALIGNMENT,
    observation: READY_OBSERVATION,
    authority: AUTHORITY,
    rollback: ROLLBACK,
  });
  assert.equal(decision.observationReady, true);
  assert.equal(decision.status, 'eligible');
  assert.equal(decision.eligibleForControlledRollout, true);
  assert.equal(decision.publicPromotionAllowed, false);
  assert.equal(decision.normalUserAction, 'preserve-current-surface');
});
