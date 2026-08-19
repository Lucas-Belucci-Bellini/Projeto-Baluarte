import test from 'node:test';
import assert from 'node:assert/strict';
import { decideUsage, hasEntitlement, normalizePlan, UsageLedger } from '../../v2/data/billing.ts';

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
