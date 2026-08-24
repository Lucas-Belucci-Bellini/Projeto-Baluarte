import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  availabilityForObservedModule,
  projectModuleObservationVisual,
} from '../src/layout/module-observation-visual.ts';

const HEALTHY_OBSERVATION = Object.freeze({
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

function degradedObservation() {
  return {
    ...HEALTHY_OBSERVATION,
    evidence: {
      ...HEALTHY_OBSERVATION.evidence,
      claimsObserved: false,
      claimsFresh: false,
      severity: 'warning',
      fallback: 'degraded',
      reasonCodes: ['claims-absent'],
    },
    transport: { originAllowed: false, rateLimited: false },
  };
}

test('evidência saudável apenas observa e mantém promoção pública bloqueada', () => {
  const decision = projectModuleObservationVisual('editor', HEALTHY_OBSERVATION);
  assert.equal(decision.moduleId, 'editor');
  assert.equal(decision.availability, 'enabled');
  assert.equal(decision.outcome, 'observe-only');
  assert.equal(decision.fallback, 'v1-preserved');
  assert.deepEqual(decision.reasons, ['observation-ready']);
  assert.equal(decision.authority, 'not-authorized');
  assert.equal(decision.publicPromotionAllowed, false);
});

test('claims ausentes projetam degraded sem esconder a superfície V1', () => {
  const decision = projectModuleObservationVisual('editor', degradedObservation());
  assert.equal(decision.availability, 'degraded');
  assert.equal(decision.outcome, 'observe-only');
  assert.equal(decision.fallback, 'v1-preserved');
  assert.deepEqual(decision.reasons, ['claims-absent']);
  assert.equal(decision.publicPromotionAllowed, false);
});

test('observação ausente preserva V1 e não fabrica estado de health', () => {
  const decision = projectModuleObservationVisual('editor', null);
  assert.equal(decision.availability, 'degraded');
  assert.equal(decision.outcome, 'preserve-v1');
  assert.deepEqual(decision.reasons, ['observation-missing']);
  assert.equal(decision.fallback, 'v1-preserved');
  assert.equal(decision.publicPromotionAllowed, false);
});

test('callback de disponibilidade por módulo é explícito e conservador', () => {
  const availability = availabilityForObservedModule({
    editor: HEALTHY_OBSERVATION,
    wiki: degradedObservation(),
  });
  assert.equal(availability('editor'), 'enabled');
  assert.equal(availability('wiki'), 'degraded');
  assert.equal(availability('unknown'), 'degraded');
});
