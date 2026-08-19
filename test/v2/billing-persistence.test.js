import test from 'node:test';
import assert from 'node:assert/strict';
import { BillingPersistenceError } from '../../v2/data/billing-driver.ts';
import { BillingPersistenceAdapter } from '../../v2/data/billing-persistence.ts';

function adapterFixture() {
  const adapter = new BillingPersistenceAdapter();
  adapter.createWorkspace({ id: 'workspace-1', accountId: 'account-1', slug: 'main', displayName: 'Main Workspace' });
  adapter.addMember({ workspaceId: 'workspace-1', userId: 'user-1', role: 'dev' });
  return adapter;
}

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
    limits: { JARVIS_MESSAGES_PER_MONTH: { kind: 'finite', value: 500 } },
    features: ['jarvis'],
    metadata: { environment: 'test' },
    version: 1,
    ...overrides,
  };
}

function assignmentRequest(overrides = {}) {
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

function usageRequest(overrides = {}) {
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

test('concurrent retries with the same idempotency key append once', async () => {
  const adapter = adapterFixture();
  const results = await Promise.all(Array.from({ length: 32 }, (_, index) => adapter.appendUsage(
    usageRequest({ id: `usage-${index + 1}` }),
  )));
  assert.equal(new Set(results.map((event) => event.id)).size, 1);
  assert.equal(adapter.ledger.list().length, 1);
  assert.equal(adapter.ledger.total('account-1', 'workspace-1', 'JARVIS_MESSAGES_PER_MONTH'), 1);
});

test('same idempotency key with a compatible payload is a safe replay', async () => {
  const adapter = adapterFixture();
  const first = await adapter.appendUsage(usageRequest({ metadata: { source: 'api', region: 'br' } }));
  const replay = await adapter.appendUsage(usageRequest({
    id: 'usage-retry',
    metadata: { region: 'br', source: 'api' },
  }));
  assert.equal(replay.id, first.id);
  assert.equal(adapter.ledger.list().length, 1);
});

test('same idempotency key with a different payload is rejected', async () => {
  const adapter = adapterFixture();
  await adapter.appendUsage(usageRequest());
  await assert.rejects(
    () => adapter.appendUsage(usageRequest({ quantity: 2, id: 'usage-conflict' })),
    (error) => error instanceof BillingPersistenceError && error.code === 'IDEMPOTENCY_CONFLICT',
  );
  assert.equal(adapter.ledger.list().length, 1);
});

test('assignment and usage are committed together and replay safely under concurrency', async () => {
  const adapter = adapterFixture();
  adapter.registerPlan(planFixture());
  const assignment = assignmentRequest();
  const usage = usageRequest();
  const results = await Promise.all(Array.from({ length: 16 }, () => adapter.assignPlanAndAppendUsage(assignment, usage)));
  assert.equal(new Set(results.map((result) => result.assignment.id)).size, 1);
  assert.equal(new Set(results.map((result) => result.usage.id)).size, 1);
  assert.equal(adapter.catalog.resolve('account-1', 'workspace-1', '2026-08-19T12:00:00.000Z').reason, 'resolved');
  assert.equal(adapter.ledger.list().length, 1);
});

test('transaction rejects an unregistered plan before mutating usage or assignment', async () => {
  const adapter = adapterFixture();
  await assert.rejects(
    () => adapter.assignPlanAndAppendUsage(assignmentRequest(), usageRequest()),
    (error) => error instanceof BillingPersistenceError && error.code === 'PLAN_NOT_FOUND',
  );
  assert.equal(adapter.ledger.list().length, 0);
  assert.equal(adapter.catalog.resolve('account-1', 'workspace-1').reason, 'no-assignment');
});

test('transaction rejects invalid assignment before mutating usage or assignment', async () => {
  const adapter = adapterFixture();
  adapter.registerPlan(planFixture());
  await assert.rejects(
    () => adapter.assignPlanAndAppendUsage(
      assignmentRequest({ effectiveTo: '2026-07-01T00:00:00.000Z' }),
      usageRequest(),
    ),
    /effectiveTo/,
  );
  assert.equal(adapter.ledger.list().length, 0);
  assert.equal(adapter.catalog.resolve('account-1', 'workspace-1').reason, 'no-assignment');
});

test('transaction enforces membership and account/workspace isolation before mutation', async () => {
  const adapter = adapterFixture();
  adapter.registerPlan(planFixture());
  await assert.rejects(
    () => adapter.assignPlanAndAppendUsage(assignmentRequest(), usageRequest({ actorUserId: 'outsider' })),
    (error) => error instanceof BillingPersistenceError && error.code === 'MEMBERSHIP_REQUIRED',
  );
  await assert.rejects(
    () => adapter.assignPlanAndAppendUsage(
      assignmentRequest({ accountId: 'account-2' }),
      usageRequest({ accountId: 'account-2' }),
    ),
    (error) => error instanceof BillingPersistenceError && error.code === 'ACCOUNT_MISMATCH',
  );
  await assert.rejects(
    () => adapter.assignPlanAndAppendUsage(
      assignmentRequest({ workspaceId: 'workspace-2' }),
      usageRequest(),
    ),
    (error) => error instanceof BillingPersistenceError && error.code === 'ACCOUNT_MISMATCH',
  );
  assert.equal(adapter.ledger.list().length, 0);
  assert.equal(adapter.catalog.resolve('account-1', 'workspace-1').reason, 'no-assignment');
});

test('different idempotency keys are preserved under concurrent writes', async () => {
  const adapter = adapterFixture();
  await Promise.all(Array.from({ length: 12 }, (_, index) => adapter.appendUsage(
    usageRequest({ id: `usage-${index + 1}`, idempotencyKey: `request-${index + 1}` }),
  )));
  assert.equal(adapter.ledger.list().length, 12);
  assert.equal(adapter.ledger.total('account-1', 'workspace-1', 'JARVIS_MESSAGES_PER_MONTH'), 12);
});

test('membership and account boundaries reject unauthorized usage with typed codes', async () => {
  const adapter = adapterFixture();
  await assert.rejects(
    () => adapter.appendUsage(usageRequest({ actorUserId: 'outsider' })),
    (error) => error instanceof BillingPersistenceError && error.code === 'MEMBERSHIP_REQUIRED',
  );
  await assert.rejects(
    () => adapter.appendUsage(usageRequest({ accountId: 'account-2' })),
    (error) => error instanceof BillingPersistenceError && error.code === 'ACCOUNT_MISMATCH',
  );
  assert.equal(adapter.ledger.list().length, 0);
});

test('read-only workspace access requires membership and returns the workspace', () => {
  const adapter = adapterFixture();
  assert.equal(adapter.getWorkspace('workspace-1', 'user-1').slug, 'main');
  assert.throws(
    () => adapter.getWorkspace('workspace-1', 'outsider'),
    (error) => error instanceof BillingPersistenceError && error.code === 'MEMBERSHIP_REQUIRED',
  );
});

test('read-only plan resolution enforces account and membership boundaries', () => {
  const adapter = adapterFixture();
  assert.throws(
    () => adapter.resolvePlan('account-1', 'workspace-1', 'outsider'),
    (error) => error instanceof BillingPersistenceError && error.code === 'MEMBERSHIP_REQUIRED',
  );
  assert.throws(
    () => adapter.resolvePlan('account-2', 'workspace-1', 'user-1'),
    (error) => error instanceof BillingPersistenceError && error.code === 'ACCOUNT_MISMATCH',
  );
  assert.throws(
    () => adapter.getWorkspace('missing', 'user-1'),
    (error) => error instanceof BillingPersistenceError && error.code === 'WORKSPACE_NOT_FOUND',
  );
});

test('driver errors expose stable public codes instead of SQL details', () => {
  const adapter = new BillingPersistenceAdapter();
  assert.throws(
    () => adapter.addMember({ workspaceId: 'missing', userId: 'user-1', role: 'user' }),
    (error) => error instanceof BillingPersistenceError && error.code === 'WORKSPACE_NOT_FOUND' && error.retryable === false,
  );
});

test('workspace slug is unique within an account but reusable by another account', () => {
  const adapter = adapterFixture();
  assert.throws(() => adapter.createWorkspace({
    id: 'workspace-duplicate', accountId: 'account-1', slug: 'main', displayName: 'Duplicate',
  }), /workspace.slug duplicado/);
  assert.doesNotThrow(() => adapter.createWorkspace({
    id: 'workspace-2', accountId: 'account-2', slug: 'main', displayName: 'Other Account',
  }));
});
