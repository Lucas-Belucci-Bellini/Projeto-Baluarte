import test from 'node:test';
import assert from 'node:assert/strict';
import { BillingPersistenceError } from '../../v2/data/billing-driver.ts';
import { BillingReadMetrics } from '../../v2/data/billing-observability.ts';
import { BillingHttpReadDriver } from '../../v2/data/billing-http-read-driver.ts';

function response(status, payload) {
  return {
    status,
    async json() {
      return payload;
    },
  };
}

function driver(queue, observer) {
  return new BillingHttpReadDriver({
    baseUrl: 'https://staging.example.test/private',
    apiKey: 'secret-api-key',
    accessToken: 'secret-access-token',
    principalUserId: 'user-1',
    observer,
    transport: {
      async request() {
        return queue.shift();
      },
    },
  });
}

test('metrics aggregate reads without storing identifiers or payloads', async () => {
  const metrics = new BillingReadMetrics();
  const readDriver = driver([
    response(200, [{ id: 'workspace-1', account_id: 'account-1', slug: 'main', display_name: 'Main' }]),
  ], metrics);
  await readDriver.getWorkspace('workspace-1', 'user-1');
  const snapshot = metrics.snapshot();
  const workspaceMetric = snapshot.find((item) => item.operation === 'getWorkspace');
  assert.equal(workspaceMetric?.success, 1);
  assert.equal(workspaceMetric?.errors, 0);
  assert.equal(workspaceMetric?.totalDurationMs >= 0, true);
  assert.doesNotMatch(JSON.stringify(snapshot), /workspace-1|account-1|secret-access-token|staging\.example/);
});

test('metrics aggregate typed upstream errors and retryable failures', async () => {
  const metrics = new BillingReadMetrics();
  const readDriver = driver([response(503, { error: 'provider internals' })], metrics);
  await assert.rejects(
    () => readDriver.listUsage('workspace-1', 'user-1'),
    (error) => error instanceof BillingPersistenceError && error.code === 'UPSTREAM_UNAVAILABLE',
  );
  const metric = metrics.snapshot().find((item) => item.operation === 'listUsage');
  assert.equal(metric?.success, 0);
  assert.equal(metric?.errors, 1);
  assert.equal(metric?.retryableErrors, 1);
  assert.deepEqual(metric?.errorCodes, { UPSTREAM_UNAVAILABLE: 1 });
  assert.doesNotMatch(JSON.stringify(metrics.snapshot()), /provider internals|workspace-1|secret/);
});

test('metrics preserve only the stable observation shape', () => {
  const metrics = new BillingReadMetrics();
  metrics.observe({ operation: 'resolvePlan', outcome: 'error', durationMs: -10, errorCode: 'INVALID_RESPONSE' });
  const observation = metrics.snapshot().find((item) => item.operation === 'resolvePlan');
  assert.deepEqual(Object.keys(observation ?? {}).sort(), ['errorCodes', 'errors', 'operation', 'retryableErrors', 'success', 'totalDurationMs']);
  assert.equal(observation?.totalDurationMs, 0);
});
