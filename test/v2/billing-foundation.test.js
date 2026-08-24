import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBillingMutationAudit,
  evaluateBillingPreflight,
} from '../../v2/data/billing-foundation.ts';
import { BillingPersistenceError } from '../../v2/data/billing-driver.ts';
import { BillingPersistenceAdapter } from '../../v2/data/billing-persistence.ts';

function planFixture(overrides = {}) {
  return {
    id: 'pro',
    name: 'Pro',
    description: 'Plano de teste',
    status: 'active',
    currency: 'BRL',
    billingPeriod: 'monthly',
    priceMinor: 0,
    trialDays: 7,
    entitlements: ['CAN_USE_JARVIS'],
    limits: { JARVIS_MESSAGES_PER_MONTH: { kind: 'finite', value: 2 } },
    features: ['jarvis'],
    metadata: {},
    version: 1,
    ...overrides,
  };
}

function assignmentFixture(overrides = {}) {
  return {
    id: 'assignment-1',
    accountId: 'account-1',
    workspaceId: 'workspace-1',
    planId: 'pro',
    planVersion: 1,
    status: 'active',
    effectiveFrom: '2026-08-01T00:00:00.000Z',
    assignedAt: '2026-08-19T00:00:00.000Z',
    source: 'test-fixture',
    ...overrides,
  };
}

function usageFixture(overrides = {}) {
  return {
    id: 'usage-1',
    idempotencyKey: 'request-1',
    accountId: 'account-1',
    workspaceId: 'workspace-1',
    feature: 'JARVIS_MESSAGES_PER_MONTH',
    quantity: 1,
    timestamp: '2026-08-19T00:00:00.000Z',
    source: 'test',
    metadata: {},
    actorUserId: 'user-1',
    ...overrides,
  };
}

function adapterFixture(observer) {
  const adapter = new BillingPersistenceAdapter(undefined, undefined, observer);
  adapter.createWorkspace({ id: 'workspace-1', accountId: 'account-1', slug: 'main', displayName: 'Main' });
  adapter.addMember({ workspaceId: 'workspace-1', userId: 'user-1', role: 'dev' });
  adapter.registerPlan(planFixture());
  adapter.assignPlan(assignmentFixture());
  return adapter;
}

test('preflight allows finite usage when entitlement and projected limit are valid', () => {
  const result = evaluateBillingPreflight({
    plan: planFixture(),
    feature: 'JARVIS_MESSAGES_PER_MONTH',
    requiredEntitlement: 'CAN_USE_JARVIS',
    consumed: 1,
    requested: 1,
  });
  assert.equal(result.allowed, true);
  assert.equal(result.reason, 'allowed');
  assert.equal(result.projected, 2);
});

test('preflight denies missing plan, entitlement, limit and exceeded limit', () => {
  assert.equal(evaluateBillingPreflight({
    plan: null,
    feature: 'JARVIS_MESSAGES_PER_MONTH',
    consumed: 0,
    requested: 1,
  }).reason, 'plan-unavailable');
  assert.equal(evaluateBillingPreflight({
    plan: planFixture(),
    feature: 'JARVIS_MESSAGES_PER_MONTH',
    requiredEntitlement: 'CAN_USE_EDITOR',
    consumed: 0,
    requested: 1,
  }).reason, 'entitlement-missing');
  assert.equal(evaluateBillingPreflight({
    plan: planFixture(),
    feature: 'UNKNOWN_FEATURE',
    consumed: 0,
    requested: 1,
  }).reason, 'limit-missing');
  assert.equal(evaluateBillingPreflight({
    plan: planFixture(),
    feature: 'JARVIS_MESSAGES_PER_MONTH',
    consumed: 2,
    requested: 1,
  }).reason, 'limit-exceeded');
});

test('preflight handles unlimited plans and malformed numeric input without throwing', () => {
  const unlimited = evaluateBillingPreflight({
    plan: planFixture({ limits: { JARVIS_MESSAGES_PER_MONTH: { kind: 'unlimited' } } }),
    feature: 'JARVIS_MESSAGES_PER_MONTH',
    consumed: 9_999,
    requested: 1,
  });
  assert.equal(unlimited.allowed, true);
  assert.equal(unlimited.reason, 'allowed');
  assert.equal(evaluateBillingPreflight({
    plan: planFixture(),
    feature: 'JARVIS_MESSAGES_PER_MONTH',
    consumed: Number.NaN,
    requested: 1,
  }).reason, 'invalid-input');
  assert.equal(evaluateBillingPreflight({
    plan: planFixture({ limits: { JARVIS_MESSAGES_PER_MONTH: { kind: 'finite', value: Number.NaN } } }),
    feature: 'JARVIS_MESSAGES_PER_MONTH',
    consumed: 0,
    requested: 1,
  }).reason, 'invalid-limit');
});

test('protected append performs preflight before mutation and exposes bounded error codes', async () => {
  const adapter = adapterFixture();
  await adapter.appendUsageWithPreflight(usageFixture(), 'CAN_USE_JARVIS');
  await assert.rejects(
    () => adapter.appendUsageWithPreflight(
      usageFixture({ id: 'usage-2', idempotencyKey: 'request-2', quantity: 2 }),
      'CAN_USE_JARVIS',
    ),
    (error) => error instanceof BillingPersistenceError && error.code === 'LIMIT_EXCEEDED',
  );
  assert.equal(adapter.ledger.list().length, 1);
});

test('protected append rejects a missing entitlement before creating an event', async () => {
  const adapter = adapterFixture();
  await assert.rejects(
    () => adapter.appendUsageWithPreflight(usageFixture(), 'CAN_USE_EDITOR'),
    (error) => error instanceof BillingPersistenceError && error.code === 'ENTITLEMENT_REQUIRED',
  );
  assert.equal(adapter.ledger.list().length, 0);
});

test('protected append replays compatible idempotency keys without rerunning plan resolution', async () => {
  const adapter = adapterFixture();
  const first = await adapter.appendUsageWithPreflight(usageFixture(), 'CAN_USE_JARVIS');
  const replay = await adapter.appendUsageWithPreflight(
    usageFixture({ id: 'usage-retry' }),
    'DIFFERENT_ENTITLEMENT',
  );
  assert.equal(first.replayed, false);
  assert.equal(replay.replayed, true);
  assert.equal(replay.preflight, null);
  assert.equal(replay.usage.id, first.usage.id);
  assert.equal(adapter.ledger.list().length, 1);
});

test('protected append rejects idempotency drift and records only bounded audit data', async () => {
  const events = [];
  const adapter = adapterFixture({ observe: (event) => events.push(event) });
  await adapter.appendUsageWithPreflight(usageFixture(), 'CAN_USE_JARVIS');
  await assert.rejects(
    () => adapter.appendUsageWithPreflight(usageFixture({ id: 'usage-conflict', quantity: 2 }), 'CAN_USE_JARVIS'),
    (error) => error instanceof BillingPersistenceError && error.code === 'IDEMPOTENCY_CONFLICT',
  );
  const serialized = JSON.stringify(events);
  assert.match(serialized, /billing-mutation\/v1/);
  assert.ok(!serialized.includes('account-1'));
  assert.ok(!serialized.includes('workspace-1'));
  assert.ok(!serialized.includes('JARVIS_MESSAGES_PER_MONTH'));
  assert.ok(events.some((event) => event.outcome === 'committed'));
  assert.ok(events.some((event) => event.reason === 'idempotency-conflict'));
});

test('protected append remains append-once under concurrent retries', async () => {
  const events = [];
  const adapter = adapterFixture({ observe: (event) => events.push(event) });
  const results = await Promise.all(Array.from({ length: 16 }, (_, index) => adapter.appendUsageWithPreflight(
    usageFixture({ id: `usage-${index + 1}` }),
    'CAN_USE_JARVIS',
  )));
  assert.equal(new Set(results.map((result) => result.usage.id)).size, 1);
  assert.equal(adapter.ledger.list().length, 1);
  assert.equal(events.filter((event) => event.outcome === 'committed').length, 1);
  assert.equal(events.filter((event) => event.outcome === 'replayed').length, 15);
});

test('audit builder normalizes invalid quantities and does not accept request identifiers', () => {
  const audit = buildBillingMutationAudit({
    operation: 'append-usage',
    outcome: 'rejected',
    reason: 'invalid-input',
    statusClass: '4xx',
    requestedQuantity: Number.NaN,
    requestIdPresent: true,
  });
  assert.deepEqual(audit, {
    contractVersion: 'billing-mutation/v1',
    operation: 'append-usage',
    outcome: 'rejected',
    reason: 'invalid-input',
    statusClass: '4xx',
    requestedQuantity: 0,
    requestIdPresent: true,
  });
  assert.equal(Object.keys(audit).includes('requestId'), false);
});
