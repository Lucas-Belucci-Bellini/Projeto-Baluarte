import test from 'node:test';
import assert from 'node:assert/strict';
import { BillingPersistenceError } from '../../v2/data/billing-driver.ts';
import { BillingHttpReadDriver } from '../../v2/data/billing-http-read-driver.ts';

function response(status, payload) {
  return {
    status,
    async json() {
      return payload;
    },
  };
}

function driverWithQueue(queue, options = {}) {
  const calls = [];
  const transport = {
    async request(url, init) {
      calls.push({ url, init });
      const next = queue.shift();
      if (next instanceof Error) throw next;
      return next;
    },
  };
  return {
    calls,
    driver: new BillingHttpReadDriver({
      baseUrl: 'https://staging.example.test',
      apiKey: 'server-api-key',
      accessToken: 'session-token',
      principalUserId: 'user-1',
      timeoutMs: 300,
      transport,
      ...options,
    }),
  };
}

test('HTTP read driver parses authorized workspace and usage rows', async () => {
  const { calls, driver } = driverWithQueue([
    response(200, [{ id: 'workspace-1', account_id: 'account-1', slug: 'main', display_name: 'Main' }]),
    response(200, [{
      id: 'usage-1', idempotency_key: 'key-1', account_id: 'account-1', workspace_id: 'workspace-1',
      feature: 'JARVIS_MESSAGES_PER_MONTH', quantity: 1, occurred_at: '2026-08-19T00:00:00Z',
      source: 'test', metadata: { mode: 'local' },
    }]),
  ]);
  const workspace = await driver.getWorkspace('workspace-1', 'user-1');
  const usage = await driver.listUsage('workspace-1', 'user-1');
  assert.equal(workspace.displayName, 'Main');
  assert.equal(usage.length, 1);
  assert.equal(calls[0].init.headers.Authorization, 'Bearer session-token');
  assert.equal(calls[0].init.headers['Accept-Profile'], 'billing');
  assert.match(calls[0].url, /workspace-1/);
});

test('HTTP read driver resolves the versioned plan inside the requested time window', async () => {
  const { calls, driver } = driverWithQueue([
    response(200, [{
      id: 'assignment-1', account_id: 'account-1', workspace_id: 'workspace-1', plan_id: 'pro', plan_version: 2,
      status: 'active', effective_from: '2026-08-01T00:00:00Z', effective_to: null,
      assigned_at: '2026-08-01T00:00:00Z', source: 'fixture',
    }]),
    response(200, [{
      plan_id: 'pro', version: 2, name: 'Pro', description: 'Test', status: 'active', currency: 'BRL',
      billing_period: 'monthly', price_minor: 0, trial_days: 0, entitlements: ['CAN_USE_JARVIS'],
      limits: {}, features: [], metadata: {},
    }]),
  ]);
  const resolution = await driver.resolvePlan('account-1', 'workspace-1', 'user-1', '2026-08-19T00:00:00Z');
  assert.equal(resolution.reason, 'resolved');
  assert.equal(resolution.plan?.version, 2);
  assert.equal(resolution.assignment?.planVersion, 2);
  assert.match(calls[0].url, /effective_from=lte/);
  assert.match(calls[1].url, /version=eq\.2/);
});

test('HTTP read driver maps upstream authorization failures to stable errors', async () => {
  const { driver } = driverWithQueue([response(401, { message: 'not exposed' })]);
  await assert.rejects(
    () => driver.getWorkspace('workspace-1', 'user-1'),
    (error) => error instanceof BillingPersistenceError && error.code === 'MEMBERSHIP_REQUIRED' && error.retryable === false,
  );
});

test('HTTP read driver rejects invalid upstream payloads without exposing provider details', async () => {
  const { driver } = driverWithQueue([response(200, { not: 'an array' })]);
  await assert.rejects(
    () => driver.listUsage('workspace-1', 'user-1'),
    (error) => error instanceof BillingPersistenceError && error.code === 'INVALID_RESPONSE',
  );
});

test('HTTP read driver aborts a slow upstream request at the configured timeout', async () => {
  const transport = {
    request(_url, init) {
      return new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () => {
          const error = new Error('aborted');
          error.name = 'AbortError';
          reject(error);
        }, { once: true });
      });
    },
  };
  const driver = new BillingHttpReadDriver({
    baseUrl: 'https://staging.example.test',
    apiKey: 'server-api-key',
    accessToken: 'session-token',
    principalUserId: 'user-1',
    timeoutMs: 100,
    transport,
  });
  await assert.rejects(
    () => driver.listUsage('workspace-1', 'user-1'),
    (error) => error instanceof BillingPersistenceError && error.code === 'UPSTREAM_TIMEOUT' && error.retryable === true,
  );
});

test('HTTP read driver cannot be used for a different principal or insecure remote URL', async () => {
  const fixture = driverWithQueue([]);
  await assert.rejects(() => fixture.driver.getWorkspace('workspace-1', 'user-2'), /ator não corresponde/);
  assert.throws(() => new BillingHttpReadDriver({
    baseUrl: 'http://staging.example.test',
    apiKey: 'server-api-key',
    accessToken: 'session-token',
    principalUserId: 'user-1',
    transport: { async request() { return response(200, []); } },
  }), /HTTPS/);
});
