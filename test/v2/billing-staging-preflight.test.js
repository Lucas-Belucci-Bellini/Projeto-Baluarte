import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareBillingStagingReadDriver } from '../../v2/data/billing-staging-preflight.ts';

const source = {
  BILLING_READ_DRIVER_ENABLED: '1',
  BILLING_READ_ENVIRONMENT: 'staging',
  BILLING_READ_BASE_URL: 'https://billing-staging.example.test',
  BILLING_READ_API_KEY: 'server-key',
  BILLING_READ_ACCESS_TOKEN: 'server-token',
  BILLING_READ_PRINCIPAL_USER_ID: 'user-1',
};

const activation = {
  approvedProjectHost: 'billing-staging.example.test',
  secretsSource: 'server-env',
  rlsReviewed: true,
  observabilityReviewed: true,
  rollbackDocumented: true,
  writesEnabled: false,
  connectorExplicitlyApproved: true,
};

const transport = {
  async request() {
    return { status: 200, async json() { return []; } };
  },
};

test('preflight keeps billing disabled when opt-in is absent', () => {
  const result = prepareBillingStagingReadDriver({ source: {}, activation, transport });
  assert.equal(result.report.status, 'disabled');
  assert.equal(result.driver, null);
});

test('preflight blocks incomplete configuration without leaking secrets', () => {
  const result = prepareBillingStagingReadDriver({
    source: { ...source, BILLING_READ_ACCESS_TOKEN: '' },
    activation,
    transport,
  });
  assert.equal(result.report.status, 'blocked');
  assert.equal(result.report.configurationErrorCode, 'MISSING_ENV');
  assert.doesNotMatch(JSON.stringify(result), /server-key|server-token/);
});

test('preflight blocks unsafe activation before constructing a driver', () => {
  const result = prepareBillingStagingReadDriver({
    source,
    activation: { ...activation, writesEnabled: true, rlsReviewed: false },
    transport,
  });
  assert.equal(result.report.status, 'blocked');
  assert.deepEqual(result.report.failedChecks, ['rls-reviewed', 'writes-disabled']);
  assert.equal(result.driver, null);
});

test('preflight constructs a read-only driver only after all checks pass', () => {
  const result = prepareBillingStagingReadDriver({ source, activation, transport });
  assert.equal(result.report.status, 'ready');
  assert.ok(result.driver);
  assert.equal(typeof result.driver.listUsage, 'function');
});
