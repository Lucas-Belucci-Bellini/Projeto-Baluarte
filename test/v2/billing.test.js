import test from 'node:test';
import assert from 'node:assert/strict';
import { BillingCatalog, decideUsage, hasEntitlement, normalizePlan, UsageLedger } from '../../v2/data/billing.ts';

const plan = normalizePlan({
  id: 'pro',
  name: 'Pro',
  description: 'Plano configurável para uso profissional.',
  status: 'active',
  currency: 'BRL',
  billingPeriod: 'monthly',
  priceMinor: 0,
  trialDays: 7,
  entitlements: ['CAN_USE_JARVIS', 'CAN_USE_API', 'CAN_USE_JARVIS'],
  limits: {
    JARVIS_MESSAGES_PER_MONTH: { kind: 'finite', value: 500 },
    API_REQUESTS_PER_MONTH: { kind: 'unlimited' },
  },
  features: ['jarvis', 'api'],
  metadata: { environment: 'test' },
  version: 1,
});

test('plan normalizes entitlements and exposes access by contract', () => {
  assert.deepEqual(plan.entitlements, ['CAN_USE_JARVIS', 'CAN_USE_API']);
  assert.equal(hasEntitlement(plan, 'CAN_USE_JARVIS'), true);
  assert.equal(hasEntitlement(plan, 'CAN_PUBLISH_MODULES'), false);
});

test('usage decision enforces finite and unlimited limits', () => {
  assert.deepEqual(decideUsage(plan, 'JARVIS_MESSAGES_PER_MONTH', 499, 1), {
    allowed: true,
    reason: 'within-limit',
    consumed: 499,
    limit: { kind: 'finite', value: 500 },
  });
  assert.equal(decideUsage(plan, 'JARVIS_MESSAGES_PER_MONTH', 500, 1).reason, 'limit-exceeded');
  assert.equal(decideUsage(plan, 'API_REQUESTS_PER_MONTH', 100000, 1).reason, 'unlimited');
  assert.equal(decideUsage(plan, 'UNKNOWN', 0, 1).reason, 'missing-limit');
});

test('billing catalog resolves the active plan by account and workspace', () => {
  const catalog = new BillingCatalog();
  catalog.registerPlan(plan);
  catalog.assignPlan({
    id: 'assignment-1',
    accountId: 'account-1',
    workspaceId: 'workspace-1',
    planId: 'pro',
    status: 'active',
    effectiveFrom: '2026-08-01T00:00:00.000Z',
    assignedAt: '2026-08-01T00:00:00.000Z',
    source: 'test-fixture',
  });
  const resolved = catalog.resolve('account-1', 'workspace-1', '2026-08-19T00:00:00.000Z');
  assert.equal(resolved.reason, 'resolved');
  assert.equal(resolved.plan?.id, 'pro');
  assert.equal(catalog.resolve('account-1', 'workspace-2').reason, 'no-assignment');
});

test('billing catalog rejects stale plan versions and invalid assignment windows', () => {
  const catalog = new BillingCatalog();
  catalog.registerPlan(plan);
  assert.throws(() => catalog.registerPlan(plan), /plan.version deve avançar/);
  assert.throws(() => catalog.assignPlan({
    id: 'assignment-invalid',
    accountId: 'account-1',
    workspaceId: 'workspace-1',
    planId: 'pro',
    status: 'active',
    effectiveFrom: '2026-08-20T00:00:00.000Z',
    effectiveTo: '2026-08-19T00:00:00.000Z',
    assignedAt: '2026-08-01T00:00:00.000Z',
    source: 'test-fixture',
  }), /effectiveTo/);
});

test('usage ledger is append-only and idempotent', () => {
  const ledger = new UsageLedger();
  const event = {
    id: 'usage-1',
    idempotencyKey: 'request-1',
    accountId: 'account-1',
    workspaceId: 'workspace-1',
    feature: 'JARVIS_MESSAGES_PER_MONTH',
    quantity: 1,
    timestamp: '2026-08-19T00:00:00.000Z',
    source: 'jarvis-test',
    metadata: { mode: 'local' },
  };
  const first = ledger.append(event);
  const retry = ledger.append({ ...event, id: 'usage-retry' });
  assert.equal(retry.id, first.id);
  assert.equal(ledger.list().length, 1);
  assert.equal(ledger.total('account-1', 'workspace-1', 'JARVIS_MESSAGES_PER_MONTH'), 1);
  assert.throws(() => ledger.append({ ...event, idempotencyKey: 'request-2' }), /usage.id duplicado/);
});
