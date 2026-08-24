import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  LocalQuotaSimulator,
  buildDistributedRateLimitAudit,
  evaluateDistributedRateLimit,
} from '../src/security/distributed-rate-limit-contract.ts';

function input(store, overrides = {}) {
  return {
    route: '/claims/observe',
    namespace: 'claims',
    bucketMaterial: 'opaque-bucket-material',
    limit: 2,
    windowSeconds: 60,
    nowMs: 30_000,
    store,
    ...overrides,
  };
}

test('local simulator is explicitly labeled and allows within limit', () => {
  const store = new LocalQuotaSimulator();
  const decision = evaluateDistributedRateLimit(input(store));
  assert.equal(decision.allowed, true);
  assert.equal(decision.decision, 'simulated');
  assert.equal(decision.storage, 'local-simulator');
  assert.equal(decision.failureMode, 'none');
  assert.equal(decision.remaining, 1);
});

test('local simulator blocks at the limit and returns bounded retry data', () => {
  const store = new LocalQuotaSimulator();
  evaluateDistributedRateLimit(input(store));
  evaluateDistributedRateLimit(input(store));
  const decision = evaluateDistributedRateLimit(input(store));
  assert.equal(decision.allowed, false);
  assert.equal(decision.decision, 'simulated');
  assert.equal(decision.storage, 'local-simulator');
  assert.equal(decision.retryAfter > 0, true);
});

test('route and namespace are part of quota separation', () => {
  const store = new LocalQuotaSimulator();
  evaluateDistributedRateLimit(input(store));
  evaluateDistributedRateLimit(input(store));
  const otherRoute = evaluateDistributedRateLimit(input(store, { route: '/observability/observe', namespace: 'observability' }));
  assert.equal(otherRoute.allowed, true);
  assert.equal(otherRoute.remaining, 1);
});

test('unavailable store fails closed without claiming a global quota', () => {
  const store = new LocalQuotaSimulator();
  store.setAvailable(false);
  const decision = evaluateDistributedRateLimit(input(store));
  assert.deepEqual(decision, {
    allowed: false,
    decision: 'blocked',
    storage: 'unavailable',
    failureMode: 'closed',
    count: 0,
    limit: 2,
    remaining: 0,
    resetAt: null,
    retryAfter: 0,
  });
});

test('bounded audit excludes the raw bucket material and identity fields', () => {
  const store = new LocalQuotaSimulator();
  const quota = evaluateDistributedRateLimit(input(store));
  const audit = buildDistributedRateLimitAudit(quota, input(store), true);
  assert.equal(audit.contractVersion, 'distributed-rate-limit/v1');
  assert.equal(audit.storage, 'local-simulator');
  assert.equal(audit.requestIdPresent, true);
  assert.equal('bucketMaterial' in audit, false);
  assert.equal('authorization' in audit, false);
  assert.equal('subject' in audit, false);
  assert.equal(JSON.stringify(audit).includes('opaque-bucket-material'), false);
});
