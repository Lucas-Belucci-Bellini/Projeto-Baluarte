import test from 'node:test';
import assert from 'node:assert/strict';
import { planResolutionToEvidence } from '../../v2/data/billing-evidence.ts';

const base = {
  accountId: 'account-1',
  workspaceId: 'workspace-1',
  assignment: {
    id: 'assignment-1',
    accountId: 'account-1',
    workspaceId: 'workspace-1',
    planId: 'pro',
    status: 'active',
    effectiveFrom: '2026-08-01T00:00:00.000Z',
    assignedAt: '2026-08-01T00:00:00.000Z',
    source: 'fixture',
  },
  plan: {
    id: 'pro',
    name: 'Pro',
    description: 'Plano de teste',
    status: 'active',
    currency: 'BRL',
    billingPeriod: 'monthly',
    priceMinor: 0,
    trialDays: 0,
    entitlements: ['CAN_USE_JARVIS'],
    limits: {},
    features: [],
    metadata: {},
    version: 2,
  },
  reason: 'resolved',
};

test('plan resolution becomes an internal verified evidence claim', () => {
  const evidence = planResolutionToEvidence(base, '2026-08-19T00:00:00.000Z');
  assert.equal(evidence.claimKey, 'billing.plan.account-1.workspace-1');
  assert.equal(evidence.id, 'evidence:billing.plan.account-1.workspace-1:assignment-1');
  assert.equal(evidence.source.uri, 'baluarte://billing/assignments/assignment-1');
  assert.equal(evidence.status, 'verified');
  assert.equal(evidence.confidence, 1);
  assert.equal(evidence.moduleId, 'v2.billing');
});

test('missing plan resolution is represented without fabricated plan identity', () => {
  const evidence = planResolutionToEvidence({
    accountId: 'account-1',
    workspaceId: 'workspace-2',
    assignment: null,
    plan: null,
    reason: 'no-assignment',
  }, '2026-08-19T00:00:00.000Z');
  assert.match(evidence.statement, /não possui plano ativo/);
  assert.equal(evidence.source.uri, 'baluarte://billing/assignments/none');
  assert.equal(evidence.source.revision, 'none');
});
