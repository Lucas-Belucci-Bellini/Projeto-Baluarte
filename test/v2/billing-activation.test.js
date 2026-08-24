import test from 'node:test';
import assert from 'node:assert/strict';
import { assertBillingStagingActivation, validateBillingStagingActivation } from '../../v2/data/billing-activation.ts';
import { loadBillingReadConfig } from '../../v2/data/billing-config.ts';

const config = loadBillingReadConfig({
  BILLING_READ_DRIVER_ENABLED: '1',
  BILLING_READ_ENVIRONMENT: 'staging',
  BILLING_READ_BASE_URL: 'https://billing-staging.example.test',
  BILLING_READ_API_KEY: 'server-key',
  BILLING_READ_ACCESS_TOKEN: 'server-token',
  BILLING_READ_PRINCIPAL_USER_ID: 'user-1',
});

function input(overrides = {}) {
  assert.ok(config);
  return {
    config,
    approvedProjectHost: 'billing-staging.example.test',
    secretsSource: 'server-env',
    rlsReviewed: true,
    observabilityReviewed: true,
    rollbackDocumented: true,
    writesEnabled: false,
    connectorExplicitlyApproved: true,
    ...overrides,
  };
}

test('activation gate allows only a fully reviewed read-only staging setup', () => {
  const result = validateBillingStagingActivation(input());
  assert.equal(result.allowed, true);
  assert.deepEqual(result.failedChecks, []);
  assertBillingStagingActivation(input());
});

test('activation gate reports every missing approval without exposing secrets', () => {
  const result = validateBillingStagingActivation(input({
    approvedProjectHost: 'other.example.test',
    secretsSource: 'server-env',
    rlsReviewed: false,
    observabilityReviewed: false,
    rollbackDocumented: false,
    writesEnabled: true,
    connectorExplicitlyApproved: false,
  }));
  assert.equal(result.allowed, false);
  assert.deepEqual(result.failedChecks, [
    'approved-project-host',
    'rls-reviewed',
    'observability-reviewed',
    'rollback-documented',
    'writes-disabled',
    'connector-explicit',
  ]);
  assert.doesNotMatch(JSON.stringify(result), /server-key|server-token/);
  assert.throws(() => assertBillingStagingActivation(input({ writesEnabled: true })), /writes-disabled/);
});

test('activation gate rejects malformed approved host before comparing projects', () => {
  assert.throws(
    () => validateBillingStagingActivation(input({ approvedProjectHost: 'https://billing-staging.example.test' })),
    /hostname sem porta/,
  );
});

test('activation gate accepts secret manager as a server-side source', () => {
  assert.equal(validateBillingStagingActivation(input({ secretsSource: 'secret-manager' })).allowed, true);
});
