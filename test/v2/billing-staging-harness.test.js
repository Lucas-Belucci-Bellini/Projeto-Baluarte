import test from 'node:test';
import assert from 'node:assert/strict';
import { BillingPersistenceError } from '../../v2/data/billing-driver.ts';
import { BillingHttpReadDriver } from '../../v2/data/billing-http-read-driver.ts';
import { createBillingStagingTransport } from '../../v2/data/billing-staging-harness.ts';

const dataset = {
  workspaces: [
    { id: 'workspace-1', account_id: 'account-1', slug: 'main', display_name: 'Main' },
    { id: 'workspace-2', account_id: 'account-2', slug: 'main', display_name: 'Other Account' },
  ],
  memberships: [
    { workspace_id: 'workspace-1', user_id: 'user-1' },
    { workspace_id: 'workspace-2', user_id: 'user-2' },
  ],
  plans: [{
    plan_id: 'pro', version: 2, name: 'Pro', description: 'Staging', status: 'active', currency: 'BRL',
    billing_period: 'monthly', price_minor: 0, trial_days: 0, entitlements: ['CAN_USE_JARVIS'],
    limits: {}, features: [], metadata: {},
  }],
  assignments: [{
    id: 'assignment-1', account_id: 'account-1', workspace_id: 'workspace-1', plan_id: 'pro', plan_version: 2,
    status: 'active', effective_from: '2026-08-01T00:00:00Z', effective_to: null,
    assigned_at: '2026-08-01T00:00:00Z', source: 'staging-fixture',
  }],
  usage: [{
    id: 'usage-1', idempotency_key: 'key-1', account_id: 'account-1', workspace_id: 'workspace-1',
    feature: 'JARVIS_MESSAGES_PER_MONTH', quantity: 1, occurred_at: '2026-08-19T00:00:00Z',
    source: 'staging-fixture', metadata: { mode: 'test' },
  }],
};

function driverFor(userId) {
  return new BillingHttpReadDriver({
    baseUrl: 'https://staging.example.test',
    apiKey: 'staging-api-key',
    accessToken: `staging-user:${userId}`,
    principalUserId: userId,
    transport: createBillingStagingTransport(dataset),
  });
}

test('staging harness enforces workspace membership for all read surfaces', async () => {
  const userOne = driverFor('user-1');
  const userTwo = driverFor('user-2');
  assert.equal((await userOne.getWorkspace('workspace-1', 'user-1')).slug, 'main');
  assert.equal((await userOne.listUsage('workspace-1', 'user-1')).length, 1);
  assert.equal((await userOne.resolvePlan('account-1', 'workspace-1', 'user-1', '2026-08-19T00:00:00Z')).reason, 'resolved');
  await assert.rejects(
    () => userTwo.listUsage('workspace-1', 'user-2'),
    (error) => error instanceof BillingPersistenceError && error.code === 'MEMBERSHIP_REQUIRED',
  );
});

test('staging harness isolates same slug across accounts', async () => {
  const userTwo = driverFor('user-2');
  const workspace = await userTwo.getWorkspace('workspace-2', 'user-2');
  assert.equal(workspace.accountId, 'account-2');
  await assert.rejects(
    () => userTwo.getWorkspace('workspace-1', 'user-2'),
    (error) => error instanceof BillingPersistenceError
      && ['MEMBERSHIP_REQUIRED', 'WORKSPACE_NOT_FOUND'].includes(error.code),
  );
});

test('staging harness rejects missing session and unknown resources', async () => {
  const transport = createBillingStagingTransport(dataset);
  const noSession = await transport.request('https://staging.example.test/rest/v1/workspaces?id=eq.workspace-1', {
    method: 'GET',
    headers: { 'Accept-Profile': 'billing' },
    signal: new AbortController().signal,
  });
  assert.equal(noSession.status, 401);
  const driver = driverFor('user-1');
  await assert.rejects(
    () => driver.getWorkspace('missing', 'user-1'),
    (error) => error instanceof BillingPersistenceError && error.code === 'WORKSPACE_NOT_FOUND',
  );
});
